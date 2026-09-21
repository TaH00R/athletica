package com.freshco.backend.repository;

import com.freshco.backend.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findBySportId(Long sportId);

    boolean existsByNameIgnoreCaseAndSportId(String name, Long sportId);
}