package com.freshco.backend.repository;

import com.freshco.backend.entity.PlayerStat;
import org.springframework.data.jpa.repository.JpaRepository;

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
}