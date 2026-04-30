package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.task.CreateTaskRequest;
import com.momentum.momentum_api.dto.task.SeriesSummaryResponse;
import com.momentum.momentum_api.dto.task.TaskResponse;
import com.momentum.momentum_api.dto.task.UpdateTaskRequest;
import com.momentum.momentum_api.entity.RecurringSeries;
import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.enums.TaskPriority;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.exception.TaskNotFoundException;
import com.momentum.momentum_api.repository.RecurringSeriesRepository;
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
    private final RecurringSeriesRepository recurringSeriesRepository;
    private final RecurringMaterializationService recurringMaterializationService;
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
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.NONE)
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

        RecurringSeries series = RecurringSeries.builder()
                .groupId(groupId)
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.NONE)
                .recurringDays(days)
                .startDate(start)
                .endDate(end)
                .build();
        recurringSeriesRepository.save(series);

        // Only create task rows for past and present dates — future dates are created on-demand
        LocalDate materializeUpTo = today.isAfter(end) ? end : today;
        List<Task> tasks = new ArrayList<>();

        if (!start.isAfter(materializeUpTo)) {
            LocalDate cursor = start;
            while (!cursor.isAfter(materializeUpTo)) {
                if (days.contains(cursor.getDayOfWeek())) {
                    tasks.add(buildTaskFromSeries(user, series, cursor, days));
                }
                cursor = cursor.plusDays(1);
            }
        }

        if (tasks.isEmpty() && start.isAfter(today)) {
            // Series starts in the future — no rows yet, will be created when user views those dates
            return List.of();
        }

        if (!tasks.isEmpty()) {
            taskRepository.saveAll(tasks);
            tasks.stream()
                    .map(Task::getDueDate)
                    .distinct()
                    .forEach(d -> dailyPointsService.sync(user, d));
        }

        return tasks.stream().map(TaskResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SeriesSummaryResponse getSeriesSummary(String email, UUID groupId) {
        resolveUser(email);

        RecurringSeries series = recurringSeriesRepository.findByGroupId(groupId)
                .orElseThrow(() -> new TaskNotFoundException(-1L));

        Set<DayOfWeek> days = series.getRecurringDays();
        LocalDate firstDate = firstOccurrence(series.getStartDate(), series.getEndDate(), days);
        LocalDate lastDate = lastOccurrence(series.getStartDate(), series.getEndDate(), days);

        long total = countOccurrences(series.getStartDate(), series.getEndDate(), days);
        long completed = taskRepository.countByRecurringGroupIdAndCompletedTrue(groupId);

        String pattern = days == null || days.isEmpty() ? "Custom" :
                days.stream()
                        .sorted(Comparator.comparingInt(DayOfWeek::getValue))
                        .map(d -> d.getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                        .collect(Collectors.joining(", "));

        return SeriesSummaryResponse.builder()
                .recurringGroupId(groupId.toString())
                .pattern(pattern)
                .firstDate(firstDate)
                .lastDate(lastDate)
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

        int pointsToRemove = toDelete.stream()
                .filter(Task::isCompleted)
                .mapToInt(Task::getPoints)
                .sum();
        if (pointsToRemove > 0) {
            user.setLifetimePoints(Math.max(0, user.getLifetimePoints() - pointsToRemove));
            userRepository.save(user);
        }

        taskRepository.deleteAll(toDelete);

        if (from == null) {
            recurringSeriesRepository.deleteByGroupId(groupId);
        } else {
            recurringSeriesRepository.findByGroupId(groupId).ifPresent(series -> {
                LocalDate newEnd = from.minusDays(1);
                if (newEnd.isBefore(series.getStartDate())) {
                    recurringSeriesRepository.delete(series);
                } else {
                    series.setEndDate(newEnd);
                    recurringSeriesRepository.save(series);
                }
            });
        }

        LocalDate today = LocalDate.now();
        affectedDates.stream()
                .filter(d -> !d.isAfter(today))
                .forEach(d -> dailyPointsService.sync(user, d));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getBacklogTasks(String email) {
        User user = resolveUser(email);
        return taskRepository.findAllByUserAndDueDateIsNullOrderByCreatedAtDesc(user)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    // Lazy materialization: task rows for recurring series are created on first view of a date
    @Transactional
    public List<TaskResponse> getTasksByDate(String email, LocalDate date) {
        User user = resolveUser(email);
        recurringMaterializationService.materializeForUserOnDate(user, date);
        return taskRepository.findAllByUserAndDueDateAndSkippedFalseOrderByCreatedAtAsc(user, date)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getIncompleteTasksBefore(String email, LocalDate before, LocalDate after) {
        User user = resolveUser(email);
        List<Task> tasks = (after != null)
                ? taskRepository.findAllByUserAndDueDateGreaterThanEqualAndDueDateBeforeAndCompletedFalseAndSkippedFalseOrderByDueDateAscCreatedAtAsc(user, after, before)
                : taskRepository.findAllByUserAndDueDateBeforeAndCompletedFalseAndSkippedFalseOrderByDueDateAscCreatedAtAsc(user, before);
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

        if (task.getRecurringGroupId() != null) {
            // Soft-skip so the materialization service won't recreate this instance
            task.setSkipped(true);
            task.setCompleted(false);
            task.setCompletedAt(null);
            taskRepository.save(task);
        } else {
            taskRepository.delete(task);
        }

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

    private long countOccurrences(LocalDate start, LocalDate end, Set<DayOfWeek> days) {
        long count = 0;
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            if (days.contains(cursor.getDayOfWeek())) count++;
            cursor = cursor.plusDays(1);
        }
        return count;
    }

    private LocalDate firstOccurrence(LocalDate start, LocalDate end, Set<DayOfWeek> days) {
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            if (days.contains(cursor.getDayOfWeek())) return cursor;
            cursor = cursor.plusDays(1);
        }
        return start;
    }

    private LocalDate lastOccurrence(LocalDate start, LocalDate end, Set<DayOfWeek> days) {
        LocalDate cursor = end;
        while (!cursor.isBefore(start)) {
            if (days.contains(cursor.getDayOfWeek())) return cursor;
            cursor = cursor.minusDays(1);
        }
        return end;
    }

    private Task buildTaskFromSeries(User user, RecurringSeries series, LocalDate date, Set<DayOfWeek> days) {
        return Task.builder()
                .user(user)
                .title(series.getTitle())
                .description(series.getDescription())
                .priority(series.getPriority())
                .dueDate(date)
                .recurring(true)
                .recurringDays(days)
                .recurringGroupId(series.getGroupId())
                .build();
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
