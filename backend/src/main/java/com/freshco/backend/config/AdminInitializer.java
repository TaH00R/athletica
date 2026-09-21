package com.freshco.backend.config;

import com.freshco.backend.entity.Admin;
import com.freshco.backend.entity.Role;
import com.freshco.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String username;

    @Value("${app.admin.password}")
    private String password;

    @Override
    public void run(String... args) {

        if (adminRepository.existsByUsernameIgnoreCase(username)) {
            return;
        }

        Admin admin = Admin.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        adminRepository.save(admin);
    }
}