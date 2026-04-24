package com.momentum.momentum_api.dto.user;

import com.momentum.momentum_api.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class UserProfileResponse {

    private Long id;
    private String email;
    private String displayName;
    private String timezone;
    private int lifetimePoints;
    private OffsetDateTime joinedAt;

    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .timezone(user.getTimezone())
                .lifetimePoints(user.getLifetimePoints())
                .joinedAt(user.getCreatedAt())
                .build();
    }
}
