package com.momentum.momentum_api.controller;

import com.momentum.momentum_api.dto.common.ApiResponse;
import com.momentum.momentum_api.dto.stats.PeriodStatsResponse;
import com.momentum.momentum_api.dto.stats.StatsOverviewResponse;
import com.momentum.momentum_api.dto.stats.TaskStatsResponse;
import com.momentum.momentum_api.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<StatsOverviewResponse>> getOverview(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Overview retrieved",
                statsService.getOverview(userDetails.getUsername())));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<PeriodStatsResponse>> getWeekly(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Weekly stats retrieved",
                statsService.getWeeklyStats(userDetails.getUsername())));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<PeriodStatsResponse>> getMonthly(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Monthly stats retrieved",
                statsService.getMonthlyStats(userDetails.getUsername())));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<TaskStatsResponse>> getTaskStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Task stats retrieved",
                statsService.getTaskStats(userDetails.getUsername())));
    }
}
