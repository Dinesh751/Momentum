package com.momentum.momentum_api.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UpdateProfileRequest {

    @Size(min = 1, max = 50, message = "Display name must be between 1 and 50 characters")
    private String displayName;

    private String timezone;
}
