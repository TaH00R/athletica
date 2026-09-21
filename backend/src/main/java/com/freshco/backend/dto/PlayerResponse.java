package com.freshco.backend.dto;

public record PlayerResponse(
        Long id,
        String name,
        Integer jerseyNumber,
        String image,
        Boolean active,
        Long teamId,
        String teamName,
        Long sportId,
        String sportName
) {
}