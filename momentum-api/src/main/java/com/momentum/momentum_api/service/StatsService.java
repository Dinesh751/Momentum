package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.stats.DailyStatEntry;
import com.momentum.momentum_api.dto.stats.PeriodStatsResponse;
import com.momentum.momentum_api.dto.stats.StatsOverviewResponse;
import com.momentum.momentum_api.dto.stats.TaskStatsResponse;
import com.momentum.momentum_api.entity.DailyPoints;
import com.momentum.momentum_api.entity.Streak;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.enums.TaskPriority;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.repository.DailyPointsRepository;
import com.momentum.momentum_api.repository.StreakRepository;
import com.momentum.momentum_api.repository.TaskRepository;
import com.momentum.momentum_api.repository.UserBadgeRepository;
import com.momentum.momentum_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final StreakRepository streakRepository;
    private final DailyPointsRepository dailyPointsRepository;
    private final TaskRepository taskRepository;
    private final UserBadgeRepository userBadgeRepository;

    @Transactional(readOnly = true)
    public StatsOverviewResponse getOverview(String email) {
        User user = resolveUser(email);
        Streak streak = streakRepository.findByUser(user).orElse(null);

        int currentStreak = streak != null ? streak.getCurrentStreak() : 0;
        int longestStreak = streak != null ? streak.getLongestStreak() : 0;
        String stage = streak != null ? streak.getStreakStage().name() : "BEGINNER";

        long badgesEarned = userBadgeRepository.countByUser(user);

        List<DailyPoints> allDays = dailyPointsRepository.findAllByUser(user);
        double consistency = computeConsistency(allDays);

        return StatsOverviewResponse.builder()
                .lifetimePoints(user.getLifetimePoints())
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .streakStage(stage)
                .badgesEarned((int) badgesEarned)
                .consistencyPercent(consistency)
                .build();
    }

    @Transactional(readOnly = true)
    public PeriodStatsResponse getWeeklyStats(String email) {
        User user = resolveUser(email);
        LocalDate today = LocalDate.now();
        return buildPeriodStats(user, today.minusDays(6), today);
    }

    @Transactional(readOnly = true)
    public PeriodStatsResponse getMonthlyStats(String email) {
        User user = resolveUser(email);
        LocalDate today = LocalDate.now();
        return buildPeriodStats(user, today.minusDays(29), today);
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getTaskStats(String email) {
        User user = resolveUser(email);

        long totalCreated = taskRepository.countByUser(user);
        long totalCompleted = taskRepository.countByUserAndCompletedTrue(user);
        double completionRate = totalCreated == 0 ? 0
                : Math.round((double) totalCompleted / totalCreated * 100 * 10.0) / 10.0;

        return TaskStatsResponse.builder()
                .totalCreated(totalCreated)
                .totalCompleted(totalCompleted)
                .completionRate(completionRate)
                .highCompleted(taskRepository.countByUserAndPriorityAndCompletedTrue(user, TaskPriority.HIGH))
                .midCompleted(taskRepository.countByUserAndPriorityAndCompletedTrue(user, TaskPriority.MID))
                .lowCompleted(taskRepository.countByUserAndPriorityAndCompletedTrue(user, TaskPriority.LOW))
                .noneCompleted(taskRepository.countByUserAndPriorityAndCompletedTrue(user, TaskPriority.NONE))
                .build();
    }

    private PeriodStatsResponse buildPeriodStats(User user, LocalDate from, LocalDate to) {
        List<DailyPoints> days = dailyPointsRepository.findAllByUserAndDateBetween(user, from, to);
        List<DailyStatEntry> entries = days.stream().map(DailyStatEntry::from).toList();

        int totalEarned = days.stream().mapToInt(DailyPoints::getPointsEarned).sum();
        long daysThresholdMet = days.stream().filter(DailyPoints::isThresholdMet).count();

        return PeriodStatsResponse.builder()
                .days(entries)
                .totalPointsEarned(totalEarned)
                .daysThresholdMet((int) daysThresholdMet)
                .consistencyPercent(computeConsistency(days))
                .build();
    }

    private double computeConsistency(List<DailyPoints> days) {
        if (days.isEmpty()) return 0;
        int earned = days.stream().mapToInt(DailyPoints::getPointsEarned).sum();
        int denominator = days.stream()
                .mapToInt(dp -> Math.max(dp.getThresholdPts(), dp.getTotalPossiblePts()))
                .sum();
        if (denominator == 0) return 0;
        return Math.round((double) earned / denominator * 100 * 10.0) / 10.0;
    }

    private User resolveUser(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(InvalidCredentialsException::new);
    }
}
