package com.momentum.momentum_api.dto.stats;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PeriodStatsResponse {

    private List<DailyStatEntry> days;
    private int totalPointsEarned;
    private int daysThresholdMet;
    private double consistencyPercent;
}
