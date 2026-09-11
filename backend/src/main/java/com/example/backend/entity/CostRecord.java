package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One daily bucket of spend for a given (api key, workspace, description), as returned by
 * Anthropic's cost_report endpoint. Same upsert-on-sync idempotency as {@link UsageRecord}.
 */
@Entity
@Table(
        name = "cost_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {
                "api_key_id", "bucket_start", "workspace_id", "description"
        })
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostRecord {

    public static final String NONE = "";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "api_key_id", nullable = false)
    private AnthropicApiKey apiKey;

    @Column(name = "bucket_start", nullable = false)
    private LocalDate bucketStart;

    @Column(name = "workspace_id", nullable = false, length = 100)
    @Builder.Default
    private String workspaceId = NONE;

    @Column(nullable = false, length = 255)
    @Builder.Default
    private String description = NONE;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;
}
