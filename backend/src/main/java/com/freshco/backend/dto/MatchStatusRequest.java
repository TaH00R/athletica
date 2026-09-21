package com.freshco.backend.dto;

import com.freshco.backend.entity.MatchStatus;
import jakarta.validation.constraints.NotNull;

public record MatchStatusRequest(

        @NotNull(message = "Status is required")
        MatchStatus status,

        Long winnerTeamId
) {
}