package com.momentum.momentum_api.dto.task;

import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.enums.TaskPriority;
import lombok.Builder;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Builder
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskPriority priority;
    private int points;
    private LocalDate dueDate;
    private boolean completed;
    private OffsetDateTime completedAt;
    private boolean recurring;
    private List<String> recurringDays;
    private String recurringGroupId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static TaskResponse from(Task task) {
        Set<DayOfWeek> days = task.getRecurringDays();
        List<String> dayNames = (days != null && !days.isEmpty())
                ? days.stream().map(DayOfWeek::name).toList()
                : List.of();

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .points(task.getPoints())
                .dueDate(task.getDueDate())
                .completed(task.isCompleted())
                .completedAt(task.getCompletedAt())
                .recurring(task.isRecurring())
                .recurringDays(dayNames)
                .recurringGroupId(task.getRecurringGroupId() != null ? task.getRecurringGroupId().toString() : null)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
