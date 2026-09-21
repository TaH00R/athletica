package com.freshco.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record PlayerStatRequest(

        @NotNull(message = "Player ID is required")
        Long playerId,

        @NotNull(message = "Match ID is required")
        Long matchId,

        @NotBlank(message = "Stat type is required")
        String statType,

        @NotNull(message = "Stat value is required")
        @PositiveOrZero(message = "Stat value cannot be negative")
        Double value
) {
}