package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * One daily bucket of token usage for a given (api key, model, workspace, service tier),
 * as returned by Anthropic's usage_report/messages endpoint. Upserted on each sync, so
 * the unique constraint below is what makes re-syncing a date range idempotent.
 *
 * "Absent" grouping dimensions (workspaceId / serviceTier can be null in Anthropic's
 * response) are normalized to {@link #NONE} before persisting - never left as a Java
 * null - so the unique constraint below actually enforces one-row-per-bucket
 * (MySQL treats each NULL in a unique key as distinct from every other NULL).
 */
@Entity
@Table(
        name = "usage_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {
                "api_key_id", "bucket_start", "model", "workspace_id", "service_tier"
        })
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageRecord {

    public static final String NONE = "";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "api_key_id", nullable = false)
    private AnthropicApiKey apiKey;

    @Column(name = "bucket_start", nullable = false)
    private LocalDate bucketStart;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "workspace_id", nullable = false, length = 100)
    @Builder.Default
    private String workspaceId = NONE;

    @Column(name = "service_tier", nullable = false, length = 50)
    @Builder.Default
    private String serviceTier = NONE;

    @Column(name = "uncached_input_tokens", nullable = false)
    @Builder.Default
    private long uncachedInputTokens = 0;

    @Column(name = "cache_creation_1h_input_tokens", nullable = false)
    @Builder.Default
    private long cacheCreation1hInputTokens = 0;

    @Column(name = "cache_creation_5m_input_tokens", nullable = false)
    @Builder.Default
    private long cacheCreation5mInputTokens = 0;

    @Column(name = "cache_read_input_tokens", nullable = false)
    @Builder.Default
    private long cacheReadInputTokens = 0;

    @Column(name = "output_tokens", nullable = false)
    @Builder.Default
    private long outputTokens = 0;

    @Column(name = "web_search_requests", nullable = false)
    @Builder.Default
    private long webSearchRequests = 0;

    public long totalInputTokens() {
        return uncachedInputTokens + cacheCreation1hInputTokens + cacheCreation5mInputTokens + cacheReadInputTokens;
    }

    public long totalTokens() {
        return totalInputTokens() + outputTokens;
    }
}
