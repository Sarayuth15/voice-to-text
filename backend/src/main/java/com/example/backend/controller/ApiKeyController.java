package com.example.backend.controller;

import com.example.backend.dto.apikey.ApiKeyCreateRequest;
import com.example.backend.dto.apikey.ApiKeyResponse;
import com.example.backend.service.ApiKeyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/keys")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @Value("${app.sync.lookback-days}")
    private int defaultLookbackDays;

    @GetMapping
    public List<ApiKeyResponse> list() {
        return apiKeyService.list();
    }

    @PostMapping
    public ResponseEntity<ApiKeyResponse> create(@Valid @RequestBody ApiKeyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(apiKeyService.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        apiKeyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/sync")
    public ApiKeyResponse sync(@PathVariable Long id) {
        return apiKeyService.syncNow(id, defaultLookbackDays);
    }
}
