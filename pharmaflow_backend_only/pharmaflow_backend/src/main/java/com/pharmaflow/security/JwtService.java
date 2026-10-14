package com.pharmaflow.security;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtService {

    @Value("${jwt.expiration.time}")
    private long expirationTime;

    @Value("${jwt.secret.key}")
    private String key;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        secretKey = Keys.hmacShaKeyFor(key.getBytes());
    }

    // called by AuthService right after successful authentication, to hand the client a signed JWT
    public String generateJwt(CustomUserDetailsImpl userDetails) {
        Date issuedAt = new Date();
        Date expiresAt = new Date(issuedAt.getTime() + expirationTime);

        return Jwts.builder()
                .subject(userDetails.getUsername()) // email
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .claims(Map.of(
                        "user_id", userDetails.getUser().getUserId(),
                        "user_role", userDetails.getUser().getRole().name()))
                .signWith(secretKey)
                .compact();
    }

    // called by JwtFilter on every request to verify signature/expiry and extract claims
    public Claims validateToken(String jwt) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
    }
}
