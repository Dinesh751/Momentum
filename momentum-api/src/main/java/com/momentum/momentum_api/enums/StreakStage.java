package com.momentum.momentum_api.enums;

public enum StreakStage {
    BEGINNER, BUILDING, HABIT, COMMITTED;

    public int getThreshold() {
        return switch (this) {
            case BEGINNER  -> 10;
            case BUILDING  -> 12;
            case HABIT     -> 15;
            case COMMITTED -> 20;
        };
    }
}
