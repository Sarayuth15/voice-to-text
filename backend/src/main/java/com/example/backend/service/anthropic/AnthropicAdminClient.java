package com.example.backend.service.anthropic;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

/**
 * Thin client over Anthropic's org-level Usage & Cost Admin API. Requires an Admin API
 * key (organization admin role) - a normal {@code sk-ant-api...} key gets a 403 here.
 *
 * Endpoint shapes are per
 * <a href="https://docs.anthropic.com/en/api/usage-cost-api">the Admin API docs</a> at
 * the time this was written; verify against the live docs if Anthropic changes them.
 */
@Component
public class AnthropicAdminClient {

    /** Max results per page for daily buckets over the typical sync window; conservative, verify against docs. */
    private static final int PAGE_LIMIT = 31;

    private final RestClient restClient;
    private final String apiVersion;

    public AnthropicAdminClient(@Value("${app.anthropic.base-url}") String baseUrl,
                                 @Value("${app.anthropic.version}") String apiVersion) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiVersion = apiVersion;
    }

    /** Fetches every page of the daily usage report covering [start, end] (inclusive, UTC days). */
    public List<UsageReportResponse.Bucket> fetchUsage(String adminApiKey, LocalDate start, LocalDate end) {
        List<UsageReportResponse.Bucket> allBuckets = new ArrayList<>();
        String page = null;
        do {
            String currentPage = page;
            UsageReportResponse response = call(() -> restClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder
                                .path("/v1/organizations/usage_report/messages")
                                .queryParam("starting_at", toRfc3339(start))
                                .queryParam("ending_at", toRfc3339(end.plusDays(1)))
                                .queryParam("bucket_width", "1d")
                                .queryParam("limit", PAGE_LIMIT)
                                .queryParam("group_by[]", "api_key_id")
                                .queryParam("group_by[]", "model")
                                .queryParam("group_by[]", "workspace_id")
                                .queryParam("group_by[]", "service_tier");
                        if (currentPage != null) {
                            builder = builder.queryParam("page", currentPage);
                        }
                        return builder.build();
                    })
                    .header("x-api-key", adminApiKey)
                    .header("anthropic-version", apiVersion)
                    .retrieve()
                    .body(UsageReportResponse.class));

            if (response == null || response.data() == null) {
                break;
            }
            allBuckets.addAll(response.data());
            page = response.hasMore() ? response.nextPage() : null;
        } while (page != null);

        return allBuckets;
    }

    /** Fetches every page of the daily cost report covering [start, end] (inclusive, UTC days). */
    public List<CostReportResponse.Bucket> fetchCost(String adminApiKey, LocalDate start, LocalDate end) {
        List<CostReportResponse.Bucket> allBuckets = new ArrayList<>();
        String page = null;
        do {
            String currentPage = page;
            CostReportResponse response = call(() -> restClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder
                                .path("/v1/organizations/cost_report")
                                .queryParam("starting_at", toRfc3339(start))
                                .queryParam("ending_at", toRfc3339(end.plusDays(1)))
                                .queryParam("limit", PAGE_LIMIT)
                                .queryParam("group_by[]", "workspace_id")
                                .queryParam("group_by[]", "description");
                        if (currentPage != null) {
                            builder = builder.queryParam("page", currentPage);
                        }
                        return builder.build();
                    })
                    .header("x-api-key", adminApiKey)
                    .header("anthropic-version", apiVersion)
                    .retrieve()
                    .body(CostReportResponse.class));

            if (response == null || response.data() == null) {
                break;
            }
            allBuckets.addAll(response.data());
            page = response.hasMore() ? response.nextPage() : null;
        } while (page != null);

        return allBuckets;
    }

    private static String toRfc3339(LocalDate date) {
        return date.atStartOfDay(ZoneOffset.UTC).toInstant().toString();
    }

    private static <T> T call(Supplier<T> request) {
        try {
            return request.get();
        } catch (RestClientResponseException e) {
            throw new IllegalStateException(
                    "Anthropic API call failed with status " + e.getStatusCode().value()
                            + ": " + truncate(e.getResponseBodyAsString(), 500),
                    e);
        }
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
