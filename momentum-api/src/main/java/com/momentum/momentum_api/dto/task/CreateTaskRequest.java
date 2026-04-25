package com.momentum.momentum_api.dto.task;

import com.momentum.momentum_api.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

@Getter
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be 255 characters or fewer")
    private String title;

    @Size(max = 1000, message = "Description must be 1000 characters or fewer")
    private String description;

    private TaskPriority priority = TaskPriority.NONE;

    private LocalDate dueDate;

    private boolean recurring = false;

    private Set<DayOfWeek> recurringDays;

    private LocalDate startDate;

    private LocalDate endDate;
}
