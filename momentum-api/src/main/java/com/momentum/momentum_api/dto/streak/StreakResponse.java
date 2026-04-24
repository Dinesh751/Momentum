package com.momentum.momentum_api.dto.streak;

import com.momentum.momentum_api.entity.Streak;
import com.momentum.momentum_api.enums.StreakStage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class StreakResponse {

    private int currentStreak;
    private int longestStreak;
    private StreakStage streakStage;
    private int currentThreshold;
    private int graceDaysUsedThisWeek;
    private LocalDate lastActivityDate;

    public static StreakResponse from(Streak streak) {
        return StreakResponse.builder()
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .streakStage(streak.getStreakStage())
                .currentThreshold(streak.getCurrentThreshold())
                .graceDaysUsedThisWeek(streak.getGraceDaysUsedThisWeek())
                .lastActivityDate(streak.getLastActivityDate())
                .build();
    }
}
