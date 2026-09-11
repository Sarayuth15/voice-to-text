package com.example.backend.service;

import com.example.backend.dto.usage.ModelBreakdownResponse;
import com.example.backend.dto.usage.TimeseriesPointResponse;
import com.example.backend.dto.usage.UsageSummaryResponse;
import com.example.backend.entity.AnthropicApiKey;
import com.example.backend.entity.CostRecord;
import com.example.backend.entity.UsageRecord;
import com.example.backend.repository.AnthropicApiKeyRepository;
import com.example.backend.repository.CostRecordRepository;
import com.example.backend.repository.UsageRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Aggregates the raw per-bucket rows into what the dashboard actually renders. Aggregation
 * happens in-memory rather than via SQL GROUP BY - simpler to keep portable/readable, and
 * fine at the data volumes a personal/small-team usage dashboard deals with (a handful of
 * keys x a few years of daily buckets is at most tens of thousands of rows).
 */
@Service
@RequiredArgsConstructor
public class UsageQueryService {

    private final AnthropicApiKeyRepository apiKeyRepository;
    private final UsageRecordRepository usageRecordRepository;
    private final CostRecordRepository costRecordRepository;

    public enum GroupBy { DAY, MODEL, KEY }

    public UsageSummaryResponse summary(LocalDate start, LocalDate end) {
        List<AnthropicApiKey> keys = apiKeyRepository.findAll();
        List<UsageRecord> usage = usageRecordRepository.findByApiKeyInAndBucketStartBetween(keys, start, end);
        List<CostRecord> cost = costRecordRepository.findByApiKeyInAndBucketStartBetween(keys, start, end);

        long inputTokens = usage.stream().mapToLong(UsageRecord::totalInputTokens).sum();
        long outputTokens = usage.stream().mapToLong(UsageRecord::getOutputTokens).sum();
        BigDecimal totalCost = cost.stream().map(CostRecord::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        String currency = cost.stream().map(CostRecord::getCurrency).findFirst().orElse("USD");

        return new UsageSummaryResponse(inputTokens, outputTokens, inputTokens + outputTokens, totalCost, currency, start, end);
    }

    public List<TimeseriesPointResponse> timeseries(LocalDate start, LocalDate end, GroupBy groupBy) {
        List<AnthropicApiKey> keys = apiKeyRepository.findAll();
        Map<Long, String> keyLabels = new HashMap<>();
        for (AnthropicApiKey k : keys) {
            keyLabels.put(k.getId(), k.getLabel());
        }

        List<UsageRecord> usage = usageRecordRepository.findByApiKeyInAndBucketStartBetween(keys, start, end);
        List<CostRecord> cost = costRecordRepository.findByApiKeyInAndBucketStartBetween(keys, start, end);

        Map<String, long[]> tokensByKey = new TreeMap<>(); // value = [inputTokens, outputTokens]
        for (UsageRecord r : usage) {
            String k = switch (groupBy) {
                case DAY -> r.getBucketStart().toString();
                case MODEL -> r.getModel();
                case KEY -> keyLabels.getOrDefault(r.getApiKey().getId(), "unknown");
            };
            long[] agg = tokensByKey.computeIfAbsent(k, x -> new long[2]);
            agg[0] += r.totalInputTokens();
            agg[1] += r.getOutputTokens();
        }

        // Anthropic's cost report only groups by workspace/description, not model - so cost
        // can only be attributed per-day or per-key here, not per-model (see GroupBy.MODEL below).
        Map<String, BigDecimal> costByKey = new HashMap<>();
        if (groupBy == GroupBy.DAY || groupBy == GroupBy.KEY) {
            for (CostRecord r : cost) {
                String k = groupBy == GroupBy.DAY
                        ? r.getBucketStart().toString()
                        : keyLabels.getOrDefault(r.getApiKey().getId(), "unknown");
                costByKey.merge(k, r.getAmount(), BigDecimal::add);
            }
        }

        List<TimeseriesPointResponse> points = new ArrayList<>();
        for (Map.Entry<String, long[]> e : tokensByKey.entrySet()) {
            long input = e.getValue()[0];
            long output = e.getValue()[1];
            BigDecimal costValue = costByKey.getOrDefault(e.getKey(), BigDecimal.ZERO);
            points.add(new TimeseriesPointResponse(e.getKey(), input, output, input + output, costValue));
        }
        return points;
    }

    public List<ModelBreakdownResponse> byModel(LocalDate start, LocalDate end) {
        List<AnthropicApiKey> keys = apiKeyRepository.findAll();
        List<UsageRecord> usage = usageRecordRepository.findByApiKeyInAndBucketStartBetween(keys, start, end);

        Map<String, long[]> byModel = new TreeMap<>();
        for (UsageRecord r : usage) {
            long[] agg = byModel.computeIfAbsent(r.getModel(), k -> new long[2]);
            agg[0] += r.totalInputTokens();
            agg[1] += r.getOutputTokens();
        }

        List<ModelBreakdownResponse> result = new ArrayList<>();
        for (Map.Entry<String, long[]> e : byModel.entrySet()) {
            long input = e.getValue()[0];
            long output = e.getValue()[1];
            result.add(new ModelBreakdownResponse(e.getKey(), input, output, input + output, BigDecimal.ZERO));
        }
        return result;
    }
}
