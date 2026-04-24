package com.momentum.momentum_api.dto.stats;

import com.momentum.momentum_api.entity.DailyPoints;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class DailyStatEntry {

    private LocalDate date;
    private int pointsEarned;
    private int threshold;
    private int totalPossible;
    private boolean thresholdMet;
    private boolean graceDay;

    public static DailyStatEntry from(DailyPoints dp) {
        return DailyStatEntry.builder()
                .date(dp.getDate())
                .pointsEarned(dp.getPointsEarned())
                .threshold(dp.getThresholdPts())
                .totalPossible(dp.getTotalPossiblePts())
                .thresholdMet(dp.isThresholdMet())
                .graceDay(dp.isGraceDay())
                .build();
    }
}
