package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.task.CreateTaskRequest;
import com.momentum.momentum_api.dto.task.SeriesSummaryResponse;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final DailyPointsService dailyPointsService;
    private final BadgeService badgeService;

    @Transactional
    public List<TaskResponse> createTask(String email, CreateTaskRequest request) {
        User user = resolveUser(email);

        if (request.isRecurring()) {
            if (request.getRecurringDays() == null || request.getRecurringDays().isEmpty()) {
                throw new IllegalArgumentException("recurringDays is required when recurring is true");
            }
            return createRecurringSeries(user, request);
        }

        Task task = Task.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : com.momentum.momentum_api.enums.TaskPriority.NONE)
                .dueDate(request.getDueDate())
                .recurring(false)
                .build();

        taskRepository.save(task);
        dailyPointsService.sync(user, task.getDueDate());

        return List.of(TaskResponse.from(task));
    }

    private List<TaskResponse> createRecurringSeries(User user, CreateTaskRequest request) {
        LocalDate start = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate end = request.getEndDate() != null ? request.getEndDate() : start.plusYears(1);

        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("endDate must be after startDate");
        }

        Set<DayOfWeek> days = new LinkedHashSet<>(request.getRecurringDays());
        UUID groupId = UUID.randomUUID();
        LocalDate today = LocalDate.now();

        List<Task> tasks = new ArrayList<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            if (days.contains(cursor.getDayOfWeek())) {
                tasks.add(Task.builder()
                        .user(user)
                        .title(request.getTitle())
                        .description(request.getDescription())
                        .priority(request.getPriority() != null ? request.getPriority() : com.momentum.momentum_api.enums.TaskPriority.NONE)
                        .dueDate(cursor)
                        .recurring(true)
                        .recurringDays(days)
                        .recurringGroupId(groupId)
                        .build());
            }
            cursor = cursor.plusDays(1);
        }

        if (tasks.isEmpty()) {
            throw new IllegalArgumentException("No occurrences found in the given date range for the selected days");
        }

        taskRepository.saveAll(tasks);

        // Sync daily points only for past/present dates to avoid creating unnecessary future records
        tasks.stream()
                .map(Task::getDueDate)
                .filter(d -> !d.isAfter(today))
                .distinct()
                .forEach(d -> dailyPointsService.sync(user, d));

        return tasks.stream().map(TaskResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SeriesSummaryResponse getSeriesSummary(String email, UUID groupId) {
        resolveUser(email);

        Optional<Task> first = taskRepository.findFirstByRecurringGroupIdOrderByDueDateAsc(groupId);
        Optional<Task> last = taskRepository.findFirstByRecurringGroupIdOrderByDueDateDesc(groupId);

        if (first.isEmpty()) {
            throw new TaskNotFoundException(-1L);
        }

        long total = taskRepository.countByRecurringGroupId(groupId);
        long completed = taskRepository.countByRecurringGroupIdAndCompletedTrue(groupId);

        Set<DayOfWeek> days = first.get().getRecurringDays();
        String pattern = days == null || days.isEmpty() ? "Custom" :
                days.stream()
                        .sorted(Comparator.comparingInt(DayOfWeek::getValue))
                        .map(d -> d.getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .collect(Collectors.joining(", "));

        return SeriesSummaryResponse.builder()
                .recurringGroupId(groupId.toString())
                .pattern(pattern)
                .firstDate(first.get().getDueDate())
                .lastDate(last.get().getDueDate())
                .totalOccurrences(total)
                .completedOccurrences(completed)
                .remainingOccurrences(total - completed)
                .build();
    }

    @Transactional
    public void deleteSeries(String email, UUID groupId, LocalDate from) {
        User user = resolveUser(email);

        List<Task> toDelete = (from != null)
                ? taskRepository.findAllByRecurringGroupIdAndDueDateGreaterThanEqualOrderByDueDateAsc(groupId, from)
                : taskRepository.findAllByRecurringGroupIdOrderByDueDateAsc(groupId);

        Set<LocalDate> affectedDates = toDelete.stream().map(Task::getDueDate).collect(Collectors.toSet());

        // Reverse completed points for any completed tasks being deleted
        int pointsToRemove = toDelete.stream()
                .filter(Task::isCompleted)
                .mapToInt(Task::getPoints)
                .sum();
        if (pointsToRemove > 0) {
            user.setLifetimePoints(Math.max(0, user.getLifetimePoints() - pointsToRemove));
            userRepository.save(user);
        }

        taskRepository.deleteAll(toDelete);

        LocalDate today = LocalDate.now();
        affectedDates.stream()
                .filter(d -> !d.isAfter(today))
                .forEach(d -> dailyPointsService.sync(user, d));
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

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getRecurring() != null) {
            task.setRecurring(request.getRecurring());
            if (!request.getRecurring()) {
                task.setRecurringDays(null);
            }
        }
        if (request.getRecurringDays() != null) {
            task.setRecurringDays(new LinkedHashSet<>(request.getRecurringDays()));
        }

        if (task.isRecurring() && (task.getRecurringDays() == null || task.getRecurringDays().isEmpty())) {
            throw new IllegalArgumentException("recurringDays is required when recurring is true");
        }

        taskRepository.save(task);

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

    // -------------------------------------------------------------------------

    private User resolveUser(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(InvalidCredentialsException::new);
    }

    private Task resolveTask(Long taskId, User user) {
        return taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }
}
