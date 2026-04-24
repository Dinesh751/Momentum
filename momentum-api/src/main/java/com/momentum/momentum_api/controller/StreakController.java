package com.momentum.momentum_api.controller;

import com.momentum.momentum_api.dto.common.ApiResponse;
import com.momentum.momentum_api.dto.streak.StreakResponse;
import com.momentum.momentum_api.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/streaks")
@RequiredArgsConstructor
public class StreakController {

    private final StreakService streakService;

    @GetMapping
    public ResponseEntity<ApiResponse<StreakResponse>> getStreak(
            @AuthenticationPrincipal UserDetails userDetails) {

        StreakResponse response = streakService.getStreak(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Streak retrieved", response));
    }
}
