package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.streak.StreakResponse;
import com.momentum.momentum_api.entity.DailyPoints;
import com.momentum.momentum_api.entity.Streak;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.enums.StreakStage;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.repository.DailyPointsRepository;
import com.momentum.momentum_api.repository.StreakRepository;
import com.momentum.momentum_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreakService {

    private final StreakRepository streakRepository;
    private final DailyPointsRepository dailyPointsRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;

    @Transactional(readOnly = true)
    public StreakResponse getStreak(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(InvalidCredentialsException::new);
        Streak streak = streakRepository.findByUser(user)
                .orElseThrow(InvalidCredentialsException::new);
        return StreakResponse.from(streak);
    }

    /**
     * Backfills any missed days from lastEvaluatedDate+1 up to and including upToDate.
     * Called by the scheduler so a server restart never silently skips days.
     */
    @Transactional
    public void evaluateMissedDays(User user, LocalDate upToDate) {
        Streak streak = streakRepository.findByUser(user).orElse(null);
        if (streak == null) return;

        LocalDate startFrom = streak.getLastEvaluatedDate() != null
                ? streak.getLastEvaluatedDate().plusDays(1)
                : upToDate;

        for (LocalDate date = startFrom; !date.isAfter(upToDate); date = date.plusDays(1)) {
            evaluateDayForUser(user, date);
        }
    }

    /**
     * Evaluates one user's streak for the given date.
     * Called by the end-of-day scheduler for yesterday's date.
     */
    @Transactional
    public void evaluateDayForUser(User user, LocalDate date) {
        Streak streak = streakRepository.findByUser(user).orElse(null);
        if (streak == null) return;

        resetGraceDaysIfNewWeek(streak);

        Optional<DailyPoints> dp = dailyPointsRepository.findByUserAndDate(user, date);

        if (dp.isPresent()) {
            if (dp.get().isThresholdMet()) {
                incrementStreak(streak);
                streak.setLastActivityDate(date);
                log.info("User {} — streak incremented to {}", user.getEmail(), streak.getCurrentStreak());
                badgeService.evaluateAfterStreakIncrement(user, streak, date);
            } else {
                // tasks existed but threshold wasn't met — no grace day applies
                resetStreak(streak);
                log.info("User {} — streak reset (threshold not met on {})", user.getEmail(), date);
            }
        } else {
            // no tasks added — grace day applies if available
            if (streak.getGraceDaysUsedThisWeek() < 2) {
                streak.setGraceDaysUsedThisWeek(streak.getGraceDaysUsedThisWeek() + 1);
                markGraceDay(user, date, streak.getCurrentThreshold());
                log.info("User {} — grace day used on {}", user.getEmail(), date);
            } else {
                resetStreak(streak);
                log.info("User {} — streak reset (no grace days left, no tasks on {})", user.getEmail(), date);
            }
        }

        streak.setLastEvaluatedDate(date);
        streakRepository.save(streak);
    }

    private void incrementStreak(Streak streak) {
        int newStreak = streak.getCurrentStreak() + 1;
        streak.setCurrentStreak(newStreak);

        if (newStreak > streak.getLongestStreak()) {
            streak.setLongestStreak(newStreak);
        }

        StreakStage newStage = stageFor(newStreak);
        streak.setStreakStage(newStage);
        streak.setCurrentThreshold(newStage.getThreshold());
    }

    private void resetStreak(Streak streak) {
        streak.setCurrentStreak(0);
        streak.setStreakStage(StreakStage.BEGINNER);
        streak.setCurrentThreshold(StreakStage.BEGINNER.getThreshold());
    }

    private void resetGraceDaysIfNewWeek(Streak streak) {
        LocalDate thisMonday = LocalDate.now().with(DayOfWeek.MONDAY);
        if (streak.getWeekStartDate() == null || streak.getWeekStartDate().isBefore(thisMonday)) {
            streak.setGraceDaysUsedThisWeek(0);
            streak.setWeekStartDate(thisMonday);
        }
    }

    private void markGraceDay(User user, LocalDate date, int threshold) {
        dailyPointsRepository.findByUserAndDate(user, date).ifPresentOrElse(
                dp -> {
                    dp.setGraceDay(true);
                    dailyPointsRepository.save(dp);
                },
                () -> dailyPointsRepository.save(
                        DailyPoints.builder()
                                .user(user)
                                .date(date)
                                .thresholdPts(threshold)
                                .graceDay(true)
                                .build()
                )
        );
    }

    private static StreakStage stageFor(int streak) {
        if (streak >= 30) return StreakStage.COMMITTED;
        if (streak >= 14) return StreakStage.HABIT;
        if (streak >= 7)  return StreakStage.BUILDING;
        return StreakStage.BEGINNER;
    }
}
