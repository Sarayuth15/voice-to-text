package com.example.backend.service;

import com.example.backend.entity.AnthropicApiKey;
import com.example.backend.entity.CostRecord;
import com.example.backend.entity.SyncStatus;
import com.example.backend.entity.UsageRecord;
import com.example.backend.repository.AnthropicApiKeyRepository;
import com.example.backend.repository.CostRecordRepository;
import com.example.backend.repository.UsageRecordRepository;
import com.example.backend.service.anthropic.AnthropicAdminClient;
import com.example.backend.service.anthropic.CostReportResponse;
import com.example.backend.service.anthropic.UsageReportResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Pulls usage + cost data from Anthropic for every stored API key and upserts it into
 * {@link UsageRecord} / {@link CostRecord}. Deliberately NOT wrapped in a single
 * {@code @Transactional}: each repository call already commits on its own (Spring Data's
 * default), which keeps us from holding a DB transaction open across the outbound HTTP
 * calls to Anthropic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UsageSyncService {

    private final AnthropicApiKeyRepository apiKeyRepository;
    private final UsageRecordRepository usageRecordRepository;
    private final CostRecordRepository costRecordRepository;
    private final AnthropicAdminClient anthropicAdminClient;
    private final CryptoService cryptoService;

    @Value("${app.sync.lookback-days}")
    private int lookbackDays;

    @Scheduled(cron = "${app.sync.cron}")
    public void scheduledSyncAll() {
        List<AnthropicApiKey> keys = apiKeyRepository.findAllByOrderByIdAsc();
        log.info("Scheduled sync starting for {} api key(s)", keys.size());
        for (AnthropicApiKey key : keys) {
            try {
                syncKey(key, lookbackDays);
            } catch (Exception e) {
                log.error("Scheduled sync failed for api key {}", key.getId(), e);
            }
        }
    }

    /**
     * Syncs the last {@code days} days of usage + cost for one key (re-pulling recent days
     * on every call, since Anthropic's own data can arrive/settle late - upserts make this
     * idempotent). Used by both the schedule and the "sync now" button.
     */
    public void syncKey(AnthropicApiKey key, int days) {
        LocalDate end = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = end.minusDays(Math.max(days, 1) - 1L);

        key.setLastSyncStatus(SyncStatus.IN_PROGRESS);
        apiKeyRepository.save(key);

        try {
            String plainKey = cryptoService.decrypt(key.getEncryptedKey());

            syncUsage(key, plainKey, start, end);
            syncCost(key, plainKey, start, end);

            key.setLastSyncStatus(SyncStatus.SUCCESS);
            key.setLastSyncedAt(Instant.now());
            key.setLastSyncError(null);
            apiKeyRepository.save(key);
        } catch (Exception e) {
            key.setLastSyncStatus(SyncStatus.FAILED);
            key.setLastSyncError(truncate(e.getMessage() == null ? e.toString() : e.getMessage(), 2000));
            apiKeyRepository.save(key);
            throw e;
        }
    }

    private void syncUsage(AnthropicApiKey key, String plainKey, LocalDate start, LocalDate end) {
        List<UsageReportResponse.Bucket> buckets = anthropicAdminClient.fetchUsage(plainKey, start, end);
        for (UsageReportResponse.Bucket bucket : buckets) {
            LocalDate bucketDate = parseDate(bucket.startingAt());
            if (bucket.results() == null) {
                continue;
            }
            for (UsageReportResponse.Result result : bucket.results()) {
                upsertUsage(key, bucketDate, result);
            }
        }
    }

    private void syncCost(AnthropicApiKey key, String plainKey, LocalDate start, LocalDate end) {
        List<CostReportResponse.Bucket> buckets = anthropicAdminClient.fetchCost(plainKey, start, end);
        for (CostReportResponse.Bucket bucket : buckets) {
            LocalDate bucketDate = parseDate(bucket.startingAt());
            if (bucket.results() == null) {
                continue;
            }
            for (CostReportResponse.Result result : bucket.results()) {
                upsertCost(key, bucketDate, result);
            }
        }
    }

    private void upsertUsage(AnthropicApiKey key, LocalDate bucketDate, UsageReportResponse.Result r) {
        String model = orNone(r.model());
        String workspaceId = orNone(r.workspaceId());
        String serviceTier = orNone(r.serviceTier());

        UsageRecord record = usageRecordRepository
                .findByApiKeyAndBucketStartAndModelAndWorkspaceIdAndServiceTier(key, bucketDate, model, workspaceId, serviceTier)
                .orElseGet(() -> UsageRecord.builder()
                        .apiKey(key)
                        .bucketStart(bucketDate)
                        .model(model)
                        .workspaceId(workspaceId)
                        .serviceTier(serviceTier)
                        .build());

        record.setUncachedInputTokens(r.uncachedInputTokens());
        record.setCacheCreation1hInputTokens(r.cacheCreation() == null ? 0 : r.cacheCreation().ephemeral1hInputTokens());
        record.setCacheCreation5mInputTokens(r.cacheCreation() == null ? 0 : r.cacheCreation().ephemeral5mInputTokens());
        record.setCacheReadInputTokens(r.cacheReadInputTokens());
        record.setOutputTokens(r.outputTokens());
        record.setWebSearchRequests(r.serverToolUse() == null ? 0 : r.serverToolUse().webSearchRequests());

        usageRecordRepository.save(record);
    }

    private void upsertCost(AnthropicApiKey key, LocalDate bucketDate, CostReportResponse.Result r) {
        String workspaceId = orNone(r.workspaceId());
        String description = orNone(r.description());

        CostRecord record = costRecordRepository
                .findByApiKeyAndBucketStartAndWorkspaceIdAndDescription(key, bucketDate, workspaceId, description)
                .orElseGet(() -> CostRecord.builder()
                        .apiKey(key)
                        .bucketStart(bucketDate)
                        .workspaceId(workspaceId)
                        .description(description)
                        .build());

        record.setAmount(r.amount() == null ? BigDecimal.ZERO : r.amount());
        record.setCurrency(r.currency() == null ? "USD" : r.currency());

        costRecordRepository.save(record);
    }

    private static String orNone(String s) {
        return s == null ? UsageRecord.NONE : s;
    }

    private static LocalDate parseDate(String rfc3339) {
        // "starting_at" is a full timestamp (e.g. "2026-09-01T00:00:00Z"); we only need the date part.
        return LocalDate.parse(rfc3339.substring(0, 10));
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}
