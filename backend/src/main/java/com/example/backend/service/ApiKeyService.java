package com.example.backend.service;

import com.example.backend.dto.apikey.ApiKeyCreateRequest;
import com.example.backend.dto.apikey.ApiKeyResponse;
import com.example.backend.entity.AnthropicApiKey;
import com.example.backend.entity.SyncStatus;
import com.example.backend.exception.ApiException;
import com.example.backend.repository.AnthropicApiKeyRepository;
import com.example.backend.repository.CostRecordRepository;
import com.example.backend.repository.UsageRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** No login/accounts (see claude.md) - every API key here is global to this app instance. */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final AnthropicApiKeyRepository apiKeyRepository;
    private final UsageRecordRepository usageRecordRepository;
    private final CostRecordRepository costRecordRepository;
    private final CryptoService cryptoService;
    private final UsageSyncService usageSyncService;

    public List<ApiKeyResponse> list() {
        return apiKeyRepository.findAllByOrderByIdAsc().stream().map(this::toResponse).toList();
    }

    public ApiKeyResponse create(ApiKeyCreateRequest request) {
        String trimmedKey = request.apiKey().trim();
        if (trimmedKey.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "That doesn't look like a valid Anthropic API key");
        }

        AnthropicApiKey entity = AnthropicApiKey.builder()
                .label(request.label().trim())
                .encryptedKey(cryptoService.encrypt(trimmedKey))
                .keyPrefix(trimmedKey.substring(trimmedKey.length() - 4))
                .lastSyncStatus(SyncStatus.NEVER_SYNCED)
                .build();
        entity = apiKeyRepository.save(entity);
        return toResponse(entity);
    }

    @Transactional
    public void delete(Long id) {
        AnthropicApiKey key = findOrThrow(id);
        usageRecordRepository.deleteByApiKey(key);
        costRecordRepository.deleteByApiKey(key);
        apiKeyRepository.delete(key);
    }

    /**
     * Triggers an immediate sync. Sync failures (bad key, Anthropic API error, ...) are
     * swallowed here rather than surfaced as a 5xx - {@link UsageSyncService#syncKey}
     * already records the failure on the key itself, so the caller just gets back the
     * refreshed {@code lastSyncStatus}/{@code lastSyncError} with a normal 200.
     */
    public ApiKeyResponse syncNow(Long id, int lookbackDays) {
        AnthropicApiKey key = findOrThrow(id);
        try {
            usageSyncService.syncKey(key, lookbackDays);
        } catch (Exception e) {
            log.warn("Manual sync failed for api key {}", id, e);
        }
        return toResponse(apiKeyRepository.findById(id).orElseThrow());
    }

    private AnthropicApiKey findOrThrow(Long id) {
        return apiKeyRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "API key not found"));
    }

    private ApiKeyResponse toResponse(AnthropicApiKey key) {
        return new ApiKeyResponse(
                key.getId(),
                key.getLabel(),
                "••••" + key.getKeyPrefix(),
                key.getCreatedAt(),
                key.getLastSyncedAt(),
                key.getLastSyncStatus().name(),
                key.getLastSyncError()
        );
    }
}
