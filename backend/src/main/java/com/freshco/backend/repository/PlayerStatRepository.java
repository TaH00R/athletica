package com.freshco.backend.repository;

import com.freshco.backend.entity.MatchStatus;
import com.freshco.backend.entity.PlayerStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlayerStatRepository extends JpaRepository<PlayerStat, Long> {

    List<PlayerStat> findByPlayerId(Long playerId);

    List<PlayerStat> findByMatchId(Long matchId);

    Optional<PlayerStat> findByPlayerIdAndMatchIdAndStatTypeIgnoreCase(
            Long playerId,
            Long matchId,
            String statType
    );

    List<PlayerStat> findByMatchIdAndStatTypeIgnoreCase(
            Long matchId,
            String statType
    );

    @Query("""
            SELECT
                ps.player.id AS playerId,
                ps.player.name AS playerName,
                ps.player.team.id AS teamId,
                ps.player.team.name AS teamName,
                ps.statType AS statType,
                SUM(ps.value) AS totalValue
            FROM PlayerStat ps
            WHERE ps.player.team.sport.id = :sportId
              AND LOWER(ps.statType) = LOWER(:statType)
              AND ps.match.status <> :cancelledStatus
            GROUP BY
                ps.player.id,
                ps.player.name,
                ps.player.team.id,
                ps.player.team.name,
                ps.statType
            ORDER BY SUM(ps.value) DESC
            """)
    List<LeaderboardProjection> findLeaderboard(
            @Param("sportId") Long sportId,
            @Param("statType") String statType,
            @Param("cancelledStatus") MatchStatus cancelledStatus
    );

    interface LeaderboardProjection {

        Long getPlayerId();

        String getPlayerName();

        Long getTeamId();

        String getTeamName();

        String getStatType();

        Double getTotalValue();
    }
}