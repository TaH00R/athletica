package com.freshco.backend.service;

import com.freshco.backend.dto.LeaderboardEntry;
import com.freshco.backend.entity.MatchStatus;
import com.freshco.backend.entity.Sport;
import com.freshco.backend.repository.PlayerStatRepository;
import com.freshco.backend.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardService {

    private final PlayerStatRepository playerStatRepository;
    private final SportRepository sportRepository;

    public List<LeaderboardEntry> getLeaderboard(Long sportId) {

        Sport sport = sportRepository.findById(sportId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sport not found with id: " + sportId
                        )
                );

        return getLeaderboard(
                sportId,
                sport.getPrimaryStat()
        );
    }


    public List<LeaderboardEntry> getLeaderboard(
            Long sportId,
            String statType
    ) {

        if (!sportRepository.existsById(sportId)) {
            throw new RuntimeException(
                    "Sport not found with id: " + sportId
            );
        }

        if (statType == null || statType.isBlank()) {
            throw new IllegalArgumentException(
                    "Stat type is required"
            );
        }

        String normalizedStatType =
                statType.trim().toUpperCase(Locale.ROOT);

        List<PlayerStatRepository.LeaderboardProjection> results =
                playerStatRepository.findLeaderboard(
                        sportId,
                        normalizedStatType,
                        MatchStatus.CANCELLED
                );

        return buildLeaderboardResponse(results);
    }

    public List<LeaderboardEntry> getTopPlayers(
            Long sportId,
            String statType,
            int limit
    ) {

        if (limit <= 0) {
            throw new IllegalArgumentException(
                    "Limit must be greater than 0"
            );
        }

        Sport sport = sportRepository.findById(sportId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sport not found with id: " + sportId
                        )
                );

        if (statType == null || statType.isBlank()) {
            statType = sport.getPrimaryStat();
        }

        return getLeaderboard(sportId, statType)
                .stream()
                .limit(limit)
                .toList();
    }

    private List<LeaderboardEntry> buildLeaderboardResponse(
            List<PlayerStatRepository.LeaderboardProjection> results
    ) {

        List<LeaderboardEntry> leaderboard =
                new ArrayList<>();

        for (int i = 0; i < results.size(); i++) {

            PlayerStatRepository.LeaderboardProjection result =
                    results.get(i);

            leaderboard.add(
                    new LeaderboardEntry(
                            result.getPlayerId(),
                            result.getPlayerName(),
                            result.getTeamId(),
                            result.getTeamName(),
                            result.getStatType(),
                            result.getTotalValue(),
                            i + 1
                    )
            );
        }

        return leaderboard;
    }
}