package com.freshco.backend.repository;

import com.freshco.backend.entity.Match;
import com.freshco.backend.entity.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByStatusOrderByScheduledAtAsc(MatchStatus status);

    List<Match> findBySportIdOrderByScheduledAtAsc(Long sportId);

    List<Match> findBySportIdAndStatusOrderByScheduledAtAsc(
            Long sportId,
            MatchStatus status
    );
}