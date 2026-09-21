package com.freshco.backend.repository;

import com.freshco.backend.entity.Standing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StandingRepository extends JpaRepository<Standing, Long> {

    Optional<Standing> findByTeamId(Long teamId);

    List<Standing> findByTeamSportId(Long sportId);
}