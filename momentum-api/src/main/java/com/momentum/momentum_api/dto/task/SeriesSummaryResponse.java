package com.momentum.momentum_api.dto.task;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SeriesSummaryResponse {
    private String recurringGroupId;
    private String pattern;
    private LocalDate firstDate;
    private LocalDate lastDate;
    private long totalOccurrences;
    private long completedOccurrences;
    private long remainingOccurrences;
}
