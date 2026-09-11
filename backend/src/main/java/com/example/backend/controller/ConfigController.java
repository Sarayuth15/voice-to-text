package com.example.backend.controller;

import com.example.backend.dto.config.AppConfigResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final String ownerEmail;

    public ConfigController(@Value("${app.owner-email:}") String ownerEmail) {
        this.ownerEmail = ownerEmail == null || ownerEmail.isBlank() ? null : ownerEmail;
    }

    @GetMapping
    public AppConfigResponse get() {
        return new AppConfigResponse(ownerEmail);
    }
}
