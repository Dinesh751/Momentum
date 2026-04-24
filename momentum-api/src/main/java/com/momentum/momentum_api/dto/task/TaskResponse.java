package com.momentum.momentum_api.dto.task;

import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.enums.RecurrenceType;
import com.momentum.momentum_api.enums.TaskPriority;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

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
    private RecurrenceType recurrenceType;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static TaskResponse from(Task task) {
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
                .recurrenceType(task.getRecurrenceType())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
