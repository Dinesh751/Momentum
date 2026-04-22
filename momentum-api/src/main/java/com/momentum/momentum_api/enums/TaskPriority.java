package com.momentum.momentum_api.enums;

public enum TaskPriority {
    HIGH, MID, LOW, NONE;

    public int getPoints() {
        return switch (this) {
            case HIGH -> 10;
            case MID  -> 5;
            case LOW  -> 2;
            case NONE -> 0;
        };
    }
}
