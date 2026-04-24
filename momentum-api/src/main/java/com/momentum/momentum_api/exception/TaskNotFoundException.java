package com.momentum.momentum_api.exception;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(Long taskId) {
        super("Task not found: " + taskId);
    }
}
