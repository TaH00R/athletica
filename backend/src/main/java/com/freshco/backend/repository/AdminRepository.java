package com.freshco.backend.repository;

import com.freshco.backend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);
}