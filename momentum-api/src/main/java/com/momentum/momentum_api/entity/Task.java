package com.momentum.momentum_api.entity;

import com.momentum.momentum_api.converter.DayOfWeekSetConverter;
import com.momentum.momentum_api.enums.TaskPriority;
import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskPriority priority = TaskPriority.NONE;

    @Column(nullable = false)
    @Builder.Default
    private int points = 0;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "is_recurring", nullable = false)
    @Builder.Default
    private boolean recurring = false;

    @Convert(converter = DayOfWeekSetConverter.class)
    @Column(name = "recurring_days")
    private Set<DayOfWeek> recurringDays;

    @Column(name = "recurring_group_id")
    private UUID recurringGroupId;

    @Column(name = "snoozed_until")
    private OffsetDateTime snoozedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        points = priority.getPoints();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
        points = priority.getPoints();
    }
}
