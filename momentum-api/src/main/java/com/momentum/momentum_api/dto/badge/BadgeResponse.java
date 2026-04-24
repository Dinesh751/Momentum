package com.momentum.momentum_api.dto.badge;

import com.momentum.momentum_api.entity.Badge;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class BadgeResponse {

    private String code;
    private String name;
    private String description;
    private boolean earned;
    private OffsetDateTime earnedAt;

    public static BadgeResponse from(Badge badge, boolean earned, OffsetDateTime earnedAt) {
        return BadgeResponse.builder()
                .code(badge.getCode())
                .name(badge.getName())
                .description(badge.getDescription())
                .earned(earned)
                .earnedAt(earnedAt)
                .build();
    }
}
