package com.momentum.momentum_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "daily_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "points_earned", nullable = false)
    @Builder.Default
    private int pointsEarned = 0;

    @Column(name = "threshold_pts", nullable = false)
    private int thresholdPts;

    @Column(name = "total_possible_pts", nullable = false)
    @Builder.Default
    private int totalPossiblePts = 0;

    @Column(name = "threshold_met", nullable = false)
    @Builder.Default
    private boolean thresholdMet = false;

    @Column(name = "is_grace_day", nullable = false)
    @Builder.Default
    private boolean graceDay = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
