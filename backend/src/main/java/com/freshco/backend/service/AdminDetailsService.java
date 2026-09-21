package com.freshco.backend.service;

import com.freshco.backend.entity.Admin;
import com.freshco.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(
            String username
    ) throws UsernameNotFoundException {

        Admin admin = adminRepository
                .findByUsernameIgnoreCase(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Admin not found"
                        )
                );

        return User.builder()
                .username(admin.getUsername())
                .password(admin.getPassword())
                .authorities(
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + admin.getRole().name()
                                )
                        )
                )
                .disabled(!admin.getEnabled())
                .build();
    }
}