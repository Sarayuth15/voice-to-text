package com.example.backend.dto.usage;

import java.math.BigDecimal;

/**
 * Note: {@code cost} is always zero here - Anthropic's cost_report endpoint is not
 * broken down by model (only by workspace/description), so per-model spend can't be
 * attributed without an assumption about per-model pricing. Token counts are exact.
 */
public record ModelBreakdownResponse(
        String model,
        long inputTokens,
        long outputTokens,
        long totalTokens,
        BigDecimal cost
) {}
