package com.freshco.backend.service;

import com.freshco.backend.dto.AuthResponse;
import com.freshco.backend.dto.LoginRequest;
import com.freshco.backend.entity.Admin;
import com.freshco.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        Admin admin = adminRepository
                .findByUsernameIgnoreCase(request.username())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Admin not found"
                        )
                );

        String token = jwtService.generateToken(
                admin.getUsername(),
                admin.getRole().name()
        );

        return new AuthResponse(
                token,
                "Bearer",
                admin.getUsername(),
                admin.getRole().name()
        );
    }
}