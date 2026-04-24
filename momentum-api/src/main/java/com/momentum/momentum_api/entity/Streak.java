package com.momentum.momentum_api.entity;

import com.momentum.momentum_api.enums.StreakStage;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "streaks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Streak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    @Builder.Default
    private int longestStreak = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "streak_stage", nullable = false)
    @Builder.Default
    private StreakStage streakStage = StreakStage.BEGINNER;

    @Column(name = "current_threshold", nullable = false)
    @Builder.Default
    private int currentThreshold = 10;

    @Column(name = "grace_days_used_this_week", nullable = false)
    @Builder.Default
    private int graceDaysUsedThisWeek = 0;

    @Column(name = "week_start_date")
    private LocalDate weekStartDate;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "last_evaluated_date")
    private LocalDate lastEvaluatedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
