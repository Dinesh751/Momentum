package com.momentum.momentum_api.dto.task;

import com.momentum.momentum_api.enums.TaskPriority;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

@Getter
public class UpdateTaskRequest {

    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must be 1000 characters or fewer")
    private String description;

    private TaskPriority priority;

    private LocalDate dueDate;

    private Boolean recurring;

    private Set<DayOfWeek> recurringDays;
}
