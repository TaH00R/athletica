package com.freshco.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record MatchScoreRequest(

        @NotBlank(message = "Score A is required")
        String scoreA,

        @NotBlank(message = "Score B is required")
        String scoreB
) {
}