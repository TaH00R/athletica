package com.freshco.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PlayerRequest(

        @NotBlank(message = "Player name is required")
        @Size(max = 100, message = "Player name cannot exceed 100 characters")
        String name,

        Integer jerseyNumber,

        String image,

        Boolean active,

        @NotNull(message = "Team ID is required")
        Long teamId
) {
}