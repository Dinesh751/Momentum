package com.momentum.momentum_api.scheduler;

import com.momentum.momentum_api.repository.UserRepository;
import com.momentum.momentum_api.service.RecurringMaterializationService;
import com.momentum.momentum_api.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class StreakScheduler {

    private final StreakService streakService;
    private final UserRepository userRepository;
    private final RecurringMaterializationService recurringMaterializationService;

    @Scheduled(cron = "0 0 0 * * *")
    public void evaluateEndOfDay() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Running end-of-day streak evaluation for {}", yesterday);

        // Ensure recurring task rows exist for yesterday before streak evaluation.
        // Without this, a user who didn't open the app would appear to have "no tasks"
        // (grace day) instead of "had tasks but missed threshold" (streak risk).
        recurringMaterializationService.materializeAllUsersForDate(yesterday);

        userRepository.findAllByDeletedAtIsNull().forEach(user -> {
            try {
                streakService.evaluateMissedDays(user, yesterday);
            } catch (Exception e) {
                log.error("Failed to evaluate streak for user {}: {}", user.getEmail(), e.getMessage());
            }
        });

        log.info("End-of-day streak evaluation complete");
    }
}
