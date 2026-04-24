package com.momentum.momentum_api.dto.dailypoints;

import com.momentum.momentum_api.entity.DailyPoints;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class DailyPointsResponse {

    private LocalDate date;
    private int pointsEarned;
    private int thresholdPts;
    private int totalPossiblePts;
    private boolean thresholdMet;
    private double consistencyPercent;

    public static DailyPointsResponse from(DailyPoints dp) {
        int denominator = Math.max(dp.getThresholdPts(), dp.getTotalPossiblePts());
        double consistency = denominator > 0
                ? Math.min(100.0, (dp.getPointsEarned() * 100.0) / denominator)
                : 0.0;

        return DailyPointsResponse.builder()
                .date(dp.getDate())
                .pointsEarned(dp.getPointsEarned())
                .thresholdPts(dp.getThresholdPts())
                .totalPossiblePts(dp.getTotalPossiblePts())
                .thresholdMet(dp.isThresholdMet())
                .consistencyPercent(Math.round(consistency * 10.0) / 10.0)
                .build();
    }
}
