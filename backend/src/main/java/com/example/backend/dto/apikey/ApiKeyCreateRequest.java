package com.example.backend.dto.apikey;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ApiKeyCreateRequest(
        @NotBlank @Size(max = 255) String label,
        @NotBlank String apiKey
) {}
