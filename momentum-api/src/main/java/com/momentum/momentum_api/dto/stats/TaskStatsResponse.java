package com.momentum.momentum_api.dto.stats;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TaskStatsResponse {

    private long totalCreated;
    private long totalCompleted;
    private double completionRate;
    private long highCompleted;
    private long midCompleted;
    private long lowCompleted;
    private long noneCompleted;
}
