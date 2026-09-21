package com.freshco.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMilliseconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration}") long expirationMilliseconds
    ) {
        this.secretKey = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secret)
        );

        this.expirationMilliseconds = expirationMilliseconds;
    }

    public String generateToken(
            String username,
            String role
    ) {

        Date issuedAt = new Date();
        Date expiration = new Date(
                issuedAt.getTime() + expirationMilliseconds
        );

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {

        return parseClaims(token)
                .getSubject();
    }

    public String extractRole(String token) {

        return parseClaims(token)
                .get("role", String.class);
    }

    public boolean isTokenValid(
            String token,
            String username
    ) {

        try {

            Claims claims = parseClaims(token);

            return claims.getSubject().equals(username)
                    && claims.getExpiration().after(new Date());

        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}