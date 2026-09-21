package com.freshco.backend.dto;

public record AuthResponse(
        String token,
        String tokenType,
        String username,
        String role
) {
}