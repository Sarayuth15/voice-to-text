package com.example.backend.repository;

import com.example.backend.entity.AnthropicApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnthropicApiKeyRepository extends JpaRepository<AnthropicApiKey, Long> {
    List<AnthropicApiKey> findAllByOrderByIdAsc();
}
