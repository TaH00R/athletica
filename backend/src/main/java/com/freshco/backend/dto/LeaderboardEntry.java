package com.freshco.backend.dto;

public record LeaderboardEntry(
        Long playerId,
        String playerName,
        Long teamId,
        String teamName,
        String statType,
        Double totalValue,
        Integer rank
) {
}