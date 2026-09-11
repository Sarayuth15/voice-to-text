package com.example.backend.service.anthropic;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Raw shape of Anthropic's {@code GET /v1/organizations/usage_report/messages} response.
 * Every field is annotated explicitly (rather than relying on an automatic
 * camelCase&lt;-&gt;snake_case naming strategy) since some Anthropic field names
 * (e.g. {@code ephemeral_1h_input_tokens}) don't round-trip through those strategies
 * reliably. Cross-check against
 * <a href="https://docs.anthropic.com/en/api/usage-cost-api">the Admin API docs</a>
 * if Anthropic changes this shape - this is the one place that would need updating.
 */
public record UsageReportResponse(
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
            @JsonProperty("uncached_input_tokens") long uncachedInputTokens,
            @JsonProperty("cache_creation") CacheCreation cacheCreation,
            @JsonProperty("cache_read_input_tokens") long cacheReadInputTokens,
            @JsonProperty("output_tokens") long outputTokens,
            @JsonProperty("server_tool_use") ServerToolUse serverToolUse,
            @JsonProperty("api_key_id") String apiKeyId,
            @JsonProperty("workspace_id") String workspaceId,
            String model,
            @JsonProperty("service_tier") String serviceTier,
            @JsonProperty("context_window") String contextWindow
    ) {}

    public record CacheCreation(
            @JsonProperty("ephemeral_1h_input_tokens") long ephemeral1hInputTokens,
            @JsonProperty("ephemeral_5m_input_tokens") long ephemeral5mInputTokens
    ) {}

    public record ServerToolUse(
            @JsonProperty("web_search_requests") long webSearchRequests
    ) {}
}
