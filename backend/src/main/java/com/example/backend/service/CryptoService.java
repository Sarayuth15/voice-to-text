package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM encryption for Anthropic API keys at rest. Output is base64(iv || ciphertext+tag).
 * {@code app.encryption.secret} is expected to be a base64-encoded 32-byte key (see CLAUDE.md /
 * application.yaml), but any string is accepted - it's hashed down to 32 bytes with SHA-256 if
 * it isn't already the right length, so a misconfigured secret degrades rather than crashes.
 * Whatever the source, that secret must be kept safe: anyone with it can decrypt stored keys.
 */
@Service
public class CryptoService {

    private static final int IV_LENGTH_BYTES = 12;
    private static final int TAG_LENGTH_BITS = 128;
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";

    private final SecretKeySpec key;
    private final SecureRandom secureRandom = new SecureRandom();

    public CryptoService(@Value("${app.encryption.secret}") String secret) {
        this.key = new SecretKeySpec(normalize(secret), "AES");
    }

    private static byte[] normalize(String secret) {
        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException e) {
            decoded = secret.getBytes(StandardCharsets.UTF_8);
        }
        if (decoded.length == 32) {
            return decoded;
        }
        try {
            return MessageDigest.getInstance("SHA-256").digest(decoded);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt value", e);
        }
    }

    public String decrypt(String encoded) {
        try {
            byte[] combined = Base64.getDecoder().decode(encoded);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            byte[] ciphertext = new byte[combined.length - IV_LENGTH_BYTES];
            System.arraycopy(combined, 0, iv, 0, IV_LENGTH_BYTES);
            System.arraycopy(combined, IV_LENGTH_BYTES, ciphertext, 0, ciphertext.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to decrypt value", e);
        }
    }
}
