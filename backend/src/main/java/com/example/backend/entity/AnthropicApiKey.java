package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * An Anthropic Admin API key, stored encrypted. No login/accounts (see claude.md) -
 * every key here is global to this app instance, not scoped to a user.
 * See {@link com.example.backend.service.CryptoService} for the encryption scheme.
 */
@Entity
@Table(name = "anthropic_api_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnthropicApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String label;

    /** AES-256-GCM ciphertext (IV + tag + data), base64-encoded. Never exposed via the API. */
    @Column(name = "encrypted_key", nullable = false, length = 1024)
    private String encryptedKey;

    /** Last 4 characters of the real key, for display only. */
    @Column(name = "key_prefix", nullable = false, length = 16)
    private String keyPrefix;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_sync_status", nullable = false, length = 20)
    @Builder.Default
    private SyncStatus lastSyncStatus = SyncStatus.NEVER_SYNCED;

    @Column(name = "last_sync_error", length = 2000)
    private String lastSyncError;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
