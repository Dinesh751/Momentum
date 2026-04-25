package com.momentum.momentum_api.config;

import com.momentum.momentum_api.entity.Badge;
import com.momentum.momentum_api.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BadgeSeeder {

    private final BadgeRepository badgeRepository;

    private static final List<Badge> CATALOGUE = List.of(
            badge("FIRST_STEP",        "First Step",        "Complete your first task"),
            badge("ON_FIRE",           "On Fire",           "Achieve a 3 day streak"),
            badge("WEEK_WARRIOR",      "Week Warrior",      "Achieve a 7 day streak"),
            badge("DIAMOND_HABIT",     "Diamond Habit",     "Achieve a 30 day streak"),
            badge("CENTURY_CLUB",      "Century Club",      "Achieve a 100 day streak"),
            badge("SHARPSHOOTER",      "Sharpshooter",      "Complete 5 High priority tasks in one day"),
            badge("OVERACHIEVER",      "Overachiever",      "Earn 2x daily threshold in one day"),
            badge("PERFECT_WEEK",      "Perfect Week",      "Meet threshold every day for 7 days"),
            badge("POINT_MILLIONAIRE", "Point Millionaire", "Earn 1000 lifetime points"),
            badge("10K_CLUB",          "10K Club",          "Earn 10000 lifetime points"),
            badge("CLEAN_SWEEP",       "Clean Sweep",       "Complete all tasks for a single day"),
            badge("EARLY_BIRD",        "Early Bird",        "Complete a task before 8 AM on 5 different days")
    );

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        long existing = badgeRepository.count();
        if (existing == CATALOGUE.size()) return;

        CATALOGUE.forEach(badge -> {
            if (!badgeRepository.existsByCode(badge.getCode())) {
                badgeRepository.save(badge);
                log.info("Seeded badge: {}", badge.getCode());
            }
        });
    }

    private static Badge badge(String code, String name, String description) {
        Badge b = new Badge();
        b.setCode(code);
        b.setName(name);
        b.setDescription(description);
        return b;
    }
}
