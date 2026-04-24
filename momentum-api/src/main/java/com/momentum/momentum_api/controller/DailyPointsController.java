package com.momentum.momentum_api.controller;

import com.momentum.momentum_api.dto.common.ApiResponse;
import com.momentum.momentum_api.dto.dailypoints.DailyPointsResponse;
import com.momentum.momentum_api.service.DailyPointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/daily-points")
@RequiredArgsConstructor
public class DailyPointsController {

    private final DailyPointsService dailyPointsService;

    @GetMapping
    public ResponseEntity<ApiResponse<DailyPointsResponse>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = date != null ? date : LocalDate.now();
        DailyPointsResponse response = dailyPointsService.getSummary(userDetails.getUsername(), targetDate);
        return ResponseEntity.ok(ApiResponse.ok("Daily points retrieved", response));
    }
}
