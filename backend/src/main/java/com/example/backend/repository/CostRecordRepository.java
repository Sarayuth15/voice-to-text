package com.example.backend.repository;

import com.example.backend.entity.AnthropicApiKey;
import com.example.backend.entity.CostRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CostRecordRepository extends JpaRepository<CostRecord, Long> {

    Optional<CostRecord> findByApiKeyAndBucketStartAndWorkspaceIdAndDescription(
            AnthropicApiKey apiKey, LocalDate bucketStart, String workspaceId, String description);

    List<CostRecord> findByApiKeyInAndBucketStartBetween(
            List<AnthropicApiKey> apiKeys, LocalDate start, LocalDate end);

    void deleteByApiKey(AnthropicApiKey apiKey);
}
