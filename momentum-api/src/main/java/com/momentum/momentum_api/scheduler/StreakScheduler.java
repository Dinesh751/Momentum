package com.momentum.momentum_api.scheduler;

import com.momentum.momentum_api.repository.UserRepository;
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

    @Scheduled(cron = "0 0 0 * * *")
    public void evaluateEndOfDay() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Running end-of-day streak evaluation for {}", yesterday);

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
