package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.badge.BadgeResponse;
import com.momentum.momentum_api.entity.Badge;
import com.momentum.momentum_api.entity.DailyPoints;
import com.momentum.momentum_api.entity.Streak;
import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.entity.UserBadge;
import com.momentum.momentum_api.enums.TaskPriority;
import com.momentum.momentum_api.repository.BadgeRepository;
import com.momentum.momentum_api.repository.DailyPointsRepository;
import com.momentum.momentum_api.repository.TaskRepository;
import com.momentum.momentum_api.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final TaskRepository taskRepository;
    private final DailyPointsRepository dailyPointsRepository;

    /**
     * Evaluate all task-completion-triggered badges.
     * Called by TaskService immediately after a task is marked complete
     * and lifetimePoints + DailyPoints have been updated.
     */
    @Transactional
    public void evaluateAfterTaskCompletion(User user, Task task) {
        evaluateFirstStep(user);
        evaluateSharpshooter(user, task);
        evaluateOverachiever(user, task);
        evaluateCleanSweep(user, task);
        evaluateEarlyBird(user, task);
        evaluatePointMilestones(user);
    }

    /**
     * Evaluate all streak-triggered badges.
     * Called by StreakService immediately after a streak day is incremented.
     */
    @Transactional
    public void evaluateAfterStreakIncrement(User user, Streak streak, LocalDate date) {
        evaluateStreakBadges(user, streak);
        evaluatePerfectWeek(user, date);
    }

    @Transactional(readOnly = true)
    public List<BadgeResponse> getBadgesForUser(User user) {
        List<Badge> all = badgeRepository.findAll();
        List<UserBadge> earned = userBadgeRepository.findByUser(user);

        Set<Long> earnedIds = earned.stream()
                .map(ub -> ub.getBadge().getId())
                .collect(Collectors.toSet());

        Map<Long, UserBadge> earnedMap = earned.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));

        return all.stream()
                .map(b -> BadgeResponse.from(
                        b,
                        earnedIds.contains(b.getId()),
                        earnedMap.containsKey(b.getId()) ? earnedMap.get(b.getId()).getEarnedAt() : null
                ))
                .toList();
    }

    // -----------------------------------------------------------------------
    // Individual badge evaluations
    // -----------------------------------------------------------------------

    private void evaluateFirstStep(User user) {
        long completed = taskRepository.countByUserAndCompletedTrue(user);
        if (completed == 1) {
            award(user, "FIRST_STEP");
        }
    }

    private void evaluateSharpshooter(User user, Task task) {
        if (task.getDueDate() == null) return;
        long highToday = taskRepository.countByUserAndDueDateAndPriorityAndCompletedTrue(
                user, task.getDueDate(), TaskPriority.HIGH);
        if (highToday >= 5) {
            award(user, "SHARPSHOOTER");
        }
    }

    private void evaluateOverachiever(User user, Task task) {
        if (task.getDueDate() == null) return;
        dailyPointsRepository.findByUserAndDate(user, task.getDueDate()).ifPresent(dp -> {
            if (dp.getThresholdPts() > 0 && dp.getPointsEarned() >= 2 * dp.getThresholdPts()) {
                award(user, "OVERACHIEVER");
            }
        });
    }

    private void evaluateCleanSweep(User user, Task task) {
        if (task.getDueDate() == null) return;
        long total = taskRepository.countByUserAndDueDate(user, task.getDueDate());
        long incomplete = taskRepository.countByUserAndDueDateAndCompletedFalse(user, task.getDueDate());
        if (total > 0 && incomplete == 0) {
            award(user, "CLEAN_SWEEP");
        }
    }

    private void evaluateEarlyBird(User user, Task task) {
        if (task.getCompletedAt() == null) return;

        ZoneId zone = safeZone(user.getTimezone());
        ZonedDateTime completedLocal = task.getCompletedAt().atZoneSameInstant(zone);
        if (completedLocal.getHour() >= 8) return;

        // Count distinct days where user completed any task before 8 AM local time
        List<Task> allCompleted = taskRepository.findAllByUserAndCompletedTrue(user);
        long earlyDays = allCompleted.stream()
                .filter(t -> t.getCompletedAt() != null)
                .filter(t -> t.getCompletedAt().atZoneSameInstant(zone).getHour() < 8)
                .map(t -> t.getCompletedAt().atZoneSameInstant(zone).toLocalDate())
                .distinct()
                .count();

        if (earlyDays >= 5) {
            award(user, "EARLY_BIRD");
        }
    }

    private void evaluatePointMilestones(User user) {
        if (user.getLifetimePoints() >= 10_000) {
            award(user, "10K_CLUB");
        }
        if (user.getLifetimePoints() >= 1_000) {
            award(user, "POINT_MILLIONAIRE");
        }
    }

    private void evaluateStreakBadges(User user, Streak streak) {
        int days = streak.getCurrentStreak();
        if (days >= 100) award(user, "CENTURY_CLUB");
        if (days >= 30)  award(user, "DIAMOND_HABIT");
        if (days >= 7)   award(user, "WEEK_WARRIOR");
        if (days >= 3)   award(user, "ON_FIRE");
    }

    private void evaluatePerfectWeek(User user, LocalDate date) {
        List<DailyPoints> week = dailyPointsRepository.findAllByUserAndDateBetween(
                user, date.minusDays(6), date);

        if (week.size() == 7 && week.stream().allMatch(DailyPoints::isThresholdMet)) {
            award(user, "PERFECT_WEEK");
        }
    }

    // -----------------------------------------------------------------------
    // Shared award helper — idempotent
    // -----------------------------------------------------------------------

    private void award(User user, String code) {
        Badge badge = badgeRepository.findByCode(code).orElse(null);
        if (badge == null) {
            log.warn("Badge with code '{}' not found in catalogue", code);
            return;
        }
        if (userBadgeRepository.existsByUserAndBadge(user, badge)) return;

        userBadgeRepository.save(UserBadge.builder().user(user).badge(badge).build());
        log.info("Awarded badge '{}' to user {}", code, user.getEmail());
    }

    private static ZoneId safeZone(String timezone) {
        try {
            return ZoneId.of(timezone);
        } catch (Exception e) {
            return ZoneId.of("UTC");
        }
    }
}
