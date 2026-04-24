package com.momentum.momentum_api.dto.stats;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatsOverviewResponse {

    private int lifetimePoints;
    private int currentStreak;
    private int longestStreak;
    private String streakStage;
    private int badgesEarned;
    private double consistencyPercent;
}
