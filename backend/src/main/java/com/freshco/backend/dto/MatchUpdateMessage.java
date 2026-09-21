package com.freshco.backend.dto;

import com.freshco.backend.entity.MatchStatus;

import java.time.LocalDateTime;

public record MatchUpdateMessage(
        Long matchId,
        Long sportId,
        String sportName,
        Long teamAId,
        String teamAName,
        String scoreA,
        Long teamBId,
        String teamBName,
        String scoreB,
        String venue,
        String roundName,
        LocalDateTime scheduledAt,
        MatchStatus status,
        Long winnerId,
        String winnerName
) {
}