package com.example.backend.dto.usage;

import java.math.BigDecimal;

/** {@code key} is a day (yyyy-MM-dd), a model id, or an api key label, depending on the requested groupBy. */
public record TimeseriesPointResponse(
        String key,
        long inputTokens,
        long outputTokens,
        long totalTokens,
        BigDecimal cost
) {}
