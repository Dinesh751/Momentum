package com.momentum.momentum_api.controller;

import com.momentum.momentum_api.dto.badge.BadgeResponse;
import com.momentum.momentum_api.dto.common.ApiResponse;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.repository.UserRepository;
import com.momentum.momentum_api.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getBadges(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmailAndDeletedAtIsNull(userDetails.getUsername())
                .orElseThrow(InvalidCredentialsException::new);

        List<BadgeResponse> badges = badgeService.getBadgesForUser(user);
        return ResponseEntity.ok(ApiResponse.ok("Badges retrieved", badges));
    }
}
