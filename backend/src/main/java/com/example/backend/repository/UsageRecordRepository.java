package com.example.backend.repository;

import com.example.backend.entity.AnthropicApiKey;
import com.example.backend.entity.UsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UsageRecordRepository extends JpaRepository<UsageRecord, Long> {

    Optional<UsageRecord> findByApiKeyAndBucketStartAndModelAndWorkspaceIdAndServiceTier(
            AnthropicApiKey apiKey, LocalDate bucketStart, String model, String workspaceId, String serviceTier);

    List<UsageRecord> findByApiKeyInAndBucketStartBetween(
            List<AnthropicApiKey> apiKeys, LocalDate start, LocalDate end);

    void deleteByApiKey(AnthropicApiKey apiKey);
}
