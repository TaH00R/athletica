package com.freshco.backend.repository;

import com.freshco.backend.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SportRepository extends JpaRepository<Sport, Long> {

    Optional<Sport> findByNameIgnoreCase(String name);

    List<Sport> findByActiveTrueOrderByDisplayOrderAsc();
}