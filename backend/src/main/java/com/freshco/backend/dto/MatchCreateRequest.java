package com.freshco.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record MatchCreateRequest(

        @NotNull(message = "Sport ID is required")
        Long sportId,

        @NotNull(message = "Team A ID is required")
        Long teamAId,

        @NotNull(message = "Team B ID is required")
        Long teamBId,

        String venue,

        String roundName,

        LocalDateTime scheduledAt
) {
}