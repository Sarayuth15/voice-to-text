package com.example.backend.dto.usage;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UsageSummaryResponse(
        long inputTokens,
        long outputTokens,
        long totalTokens,
        BigDecimal totalCost,
        String currency,
        LocalDate start,
        LocalDate end
) {}
