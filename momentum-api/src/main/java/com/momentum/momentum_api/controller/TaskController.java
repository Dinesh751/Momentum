package com.momentum.momentum_api.controller;

import com.momentum.momentum_api.dto.common.ApiResponse;
import com.momentum.momentum_api.dto.task.CreateTaskRequest;
import com.momentum.momentum_api.dto.task.TaskResponse;
import com.momentum.momentum_api.dto.task.UpdateTaskRequest;
import com.momentum.momentum_api.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateTaskRequest request) {

        TaskResponse response = taskService.createTask(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByDate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<TaskResponse> tasks = taskService.getTasksByDate(userDetails.getUsername(), targetDate);
        return ResponseEntity.ok(ApiResponse.ok("Tasks retrieved", tasks));
    }

    @GetMapping("/incomplete-before")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getIncompleteTasksBefore(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate before,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate after) {

        List<TaskResponse> tasks = taskService.getIncompleteTasksBefore(userDetails.getUsername(), before, after);
        return ResponseEntity.ok(ApiResponse.ok("Incomplete tasks retrieved", tasks));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {

        TaskResponse response = taskService.updateTask(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Task updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        taskService.deleteTask(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TaskResponse>> completeTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        TaskResponse response = taskService.completeTask(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Task completed", response));
    }

    @PatchMapping("/{id}/uncomplete")
    public ResponseEntity<ApiResponse<TaskResponse>> uncompleteTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        TaskResponse response = taskService.uncompleteTask(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Task marked incomplete", response));
    }
}
