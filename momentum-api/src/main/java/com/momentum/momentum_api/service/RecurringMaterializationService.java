package com.momentum.momentum_api.service;

import com.momentum.momentum_api.entity.RecurringSeries;
import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.repository.RecurringSeriesRepository;
import com.momentum.momentum_api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecurringMaterializationService {

    private final RecurringSeriesRepository recurringSeriesRepository;
    private final TaskRepository taskRepository;
    private final DailyPointsService dailyPointsService;

    /**
     * Called when a user views a specific date.
     * Creates task rows for any recurring series that cover this date but don't have a row yet.
     */
    @Transactional
    public void materializeForUserOnDate(User user, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<RecurringSeries> series = recurringSeriesRepository.findActiveSeriesForUserOnDate(user, date);

        List<Task> toCreate = new ArrayList<>();
        for (RecurringSeries s : series) {
            if (!s.getRecurringDays().contains(dayOfWeek)) continue;
            if (taskRepository.existsByRecurringGroupIdAndDueDate(s.getGroupId(), date)) continue;
            toCreate.add(buildTask(s, date));
        }

        if (!toCreate.isEmpty()) {
            taskRepository.saveAll(toCreate);
            dailyPointsService.sync(user, date);
        }
    }

    /**
     * Called by the midnight streak scheduler before evaluating yesterday's streaks.
     * Ensures task rows exist for ALL users who had recurring tasks due yesterday,
     * so the streak engine sees them as missed (not as "no tasks").
     */
    @Transactional
    public void materializeAllUsersForDate(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<RecurringSeries> allSeries = recurringSeriesRepository.findAllActiveOnDate(date);

        // Group tasks by user so we call dailyPointsService.sync once per user
        Map<User, List<Task>> byUser = new LinkedHashMap<>();
        for (RecurringSeries s : allSeries) {
            if (!s.getRecurringDays().contains(dayOfWeek)) continue;
            if (taskRepository.existsByRecurringGroupIdAndDueDate(s.getGroupId(), date)) continue;
            byUser.computeIfAbsent(s.getUser(), u -> new ArrayList<>()).add(buildTask(s, date));
        }

        byUser.forEach((user, tasks) -> {
            taskRepository.saveAll(tasks);
            dailyPointsService.sync(user, date);
        });
    }

    private Task buildTask(RecurringSeries series, LocalDate date) {
        return Task.builder()
                .user(series.getUser())
                .title(series.getTitle())
                .description(series.getDescription())
                .priority(series.getPriority())
                .dueDate(date)
                .recurring(true)
                .recurringDays(series.getRecurringDays())
                .recurringGroupId(series.getGroupId())
                .build();
    }
}
