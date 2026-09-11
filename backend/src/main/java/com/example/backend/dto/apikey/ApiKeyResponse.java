package com.example.backend.dto.apikey;

import java.time.Instant;

public record ApiKeyResponse(
        Long id,
        String label,
        String maskedKey,
        Instant createdAt,
        Instant lastSyncedAt,
        String lastSyncStatus,
        String lastSyncError
) {}
