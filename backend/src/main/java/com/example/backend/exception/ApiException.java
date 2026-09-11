package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** Thrown for expected, user-facing failures (bad input, not found, auth) with a specific HTTP status. */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
