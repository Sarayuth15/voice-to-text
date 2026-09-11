package com.example.backend.service.anthropic;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

/**
 * Raw shape of Anthropic's {@code GET /v1/organizations/cost_report} response.
 * See {@link UsageReportResponse} for why fields are annotated explicitly.
 */
public record CostReportResponse(
        List<Bucket> data,
        @JsonProperty("has_more") boolean hasMore,
        @JsonProperty("next_page") String nextPage
) {

    public record Bucket(
            @JsonProperty("starting_at") String startingAt,
            @JsonProperty("ending_at") String endingAt,
            List<Result> results
    ) {}

    public record Result(
            BigDecimal amount,
            String currency,
            @JsonProperty("workspace_id") String workspaceId,
            String description
    ) {}
}
