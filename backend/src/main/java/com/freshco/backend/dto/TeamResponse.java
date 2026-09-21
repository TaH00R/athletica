package com.freshco.backend.dto;

public record TeamResponse(
        Long id,
        String name,
        String logo,
        Long sportId,
        String sportName
) {
}