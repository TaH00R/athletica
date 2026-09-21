package com.freshco.backend.repository;

import com.freshco.backend.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByTeamId(Long teamId);

    List<Player> findByTeamIdAndActiveTrue(Long teamId);

    boolean existsByNameIgnoreCaseAndTeamId(String name, Long teamId);
}