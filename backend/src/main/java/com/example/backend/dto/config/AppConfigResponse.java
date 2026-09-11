package com.example.backend.dto.config;

/**
 * Small, public, read-only bit of app-wide config the frontend needs at boot.
 * {@code ownerEmail} is cosmetic only (labels the dashboard - see the {@code USER_EMAIL}
 * env var in claude.md's Setup Guide) - there is no login, so this isn't an identity.
 */
public record AppConfigResponse(String ownerEmail) {}
