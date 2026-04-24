package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.task.CreateTaskRequest;
import com.momentum.momentum_api.dto.task.TaskResponse;
import com.momentum.momentum_api.dto.task.UpdateTaskRequest;
import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.exception.TaskNotFoundException;
import com.momentum.momentum_api.repository.TaskRepository;
import com.momentum.momentum_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final DailyPointsService dailyPointsService;
    private final BadgeService badgeService;

    @Transactional
    public TaskResponse createTask(String email, CreateTaskRequest request) {
        User user = resolveUser(email);

        if (request.isRecurring() && request.getRecurrenceType() == null) {
            throw new IllegalArgumentException("recurrenceType is required when recurring is true");
        }

        Task task = Task.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : com.momentum.momentum_api.enums.TaskPriority.NONE)
                .dueDate(request.getDueDate())
                .recurring(request.isRecurring())
                .recurrenceType(request.isRecurring() ? request.getRecurrenceType() : null)
                .build();

        taskRepository.save(task);
        dailyPointsService.sync(user, task.getDueDate());

        return TaskResponse.from(task);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByDate(String email, LocalDate date) {
        User user = resolveUser(email);
        return taskRepository.findAllByUserAndDueDateOrderByCreatedAtAsc(user, date)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getIncompleteTasksBefore(String email, LocalDate before, LocalDate after) {
        User user = resolveUser(email);
        List<Task> tasks = (after != null)
                ? taskRepository.findAllByUserAndDueDateGreaterThanEqualAndDueDateBeforeAndCompletedFalseOrderByDueDateAscCreatedAtAsc(user, after, before)
                : taskRepository.findAllByUserAndDueDateBeforeAndCompletedFalseOrderByDueDateAscCreatedAtAsc(user, before);
        return tasks.stream().map(TaskResponse::from).toList();
    }

    @Transactional
    public TaskResponse updateTask(String email, Long taskId, UpdateTaskRequest request) {
        User user = resolveUser(email);
        Task task = resolveTask(taskId, user);
        LocalDate oldDueDate = task.getDueDate();

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getRecurring() != null) {
            task.setRecurring(request.getRecurring());
            if (!request.getRecurring()) {
                task.setRecurrenceType(null);
            }
        }
        if (request.getRecurrenceType() != null) {
            task.setRecurrenceType(request.getRecurrenceType());
        }

        if (task.isRecurring() && task.getRecurrenceType() == null) {
            throw new IllegalArgumentException("recurrenceType is required when recurring is true");
        }

        taskRepository.save(task);

        // if dueDate changed, sync both old and new dates
        if (oldDueDate != null && !oldDueDate.equals(task.getDueDate())) {
            dailyPointsService.sync(user, oldDueDate);
        }
        dailyPointsService.sync(user, task.getDueDate());

        return TaskResponse.from(task);
    }

    @Transactional
    public void deleteTask(String email, Long taskId) {
        User user = resolveUser(email);
        Task task = resolveTask(taskId, user);
        LocalDate dueDate = task.getDueDate();

        // revoke lifetimePoints if the task was completed
        if (task.isCompleted()) {
            user.setLifetimePoints(Math.max(0, user.getLifetimePoints() - task.getPoints()));
            userRepository.save(user);
        }

        taskRepository.delete(task);
        dailyPointsService.sync(user, dueDate);
    }

    @Transactional
    public TaskResponse completeTask(String email, Long taskId) {
        User user = resolveUser(email);
        Task task = resolveTask(taskId, user);

        task.setCompleted(true);
        task.setCompletedAt(OffsetDateTime.now());
        taskRepository.save(task);

        user.setLifetimePoints(user.getLifetimePoints() + task.getPoints());
        userRepository.save(user);

        dailyPointsService.sync(user, task.getDueDate());
        badgeService.evaluateAfterTaskCompletion(user, task);

        if (task.isRecurring() && task.getDueDate() != null && task.getRecurrenceType() != null) {
            scheduleNextOccurrence(task, user);
        }

        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse uncompleteTask(String email, Long taskId) {
        User user = resolveUser(email);
        Task task = resolveTask(taskId, user);

        task.setCompleted(false);
        task.setCompletedAt(null);
        taskRepository.save(task);

        user.setLifetimePoints(Math.max(0, user.getLifetimePoints() - task.getPoints()));
        userRepository.save(user);

        dailyPointsService.sync(user, task.getDueDate());

        return TaskResponse.from(task);
    }

    private void scheduleNextOccurrence(Task original, User user) {
        LocalDate nextDueDate = switch (original.getRecurrenceType()) {
            case DAILY   -> original.getDueDate().plusDays(1);
            case WEEKLY  -> original.getDueDate().plusWeeks(1);
            case MONTHLY -> original.getDueDate().plusMonths(1);
        };

        Task next = Task.builder()
                .user(user)
                .title(original.getTitle())
                .description(original.getDescription())
                .priority(original.getPriority())
                .dueDate(nextDueDate)
                .recurring(true)
                .recurrenceType(original.getRecurrenceType())
                .build();

        taskRepository.save(next);
        dailyPointsService.sync(user, nextDueDate);
    }

    private User resolveUser(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(InvalidCredentialsException::new);
    }

    private Task resolveTask(Long taskId, User user) {
        return taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }
}
