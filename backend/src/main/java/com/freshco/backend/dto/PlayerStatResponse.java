package com.freshco.backend.dto;

public record PlayerStatResponse(

        Long id,

        Long playerId,
        String playerName,

        Long teamId,
        String teamName,

        Long sportId,
        String sportName,

        Long matchId,

        String statType,
        Double value
) {
}