package com.pharmaflow.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.pharmaflow.entities.User;
import com.pharmaflow.enums.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "key", "PharmaFlowSecretKeyForJwtSigningMustBeAtLeast32BytesLong!");
        ReflectionTestUtils.setField(jwtService, "expirationTime", 3600000L); // 1 hour
        jwtService.init();
    }

    @Test
    void testGenerateJwt_andValidateToken_returnsCorrectClaimsAndRole() {
        User user = new User();
        user.setUserId(42L);
        user.setEmail("pharmacist@pharmaflow.com");
        user.setRole(Role.PHARMACIST);
        user.setPassword("secret");

        CustomUserDetailsImpl userDetails = new CustomUserDetailsImpl(user);

        String token = jwtService.generateJwt(userDetails);
        assertNotNull(token);

        Claims claims = jwtService.validateToken(token);
        assertEquals("pharmacist@pharmaflow.com", claims.getSubject());
        assertEquals(42L, claims.get("user_id", Long.class));
        assertEquals("PHARMACIST", claims.get("user_role", String.class));
    }

    @Test
    void testValidateToken_whenExpired_throwsExpiredJwtException() {
        ReflectionTestUtils.setField(jwtService, "expirationTime", -1000L); // expired 1s ago

        User user = new User();
        user.setUserId(1L);
        user.setEmail("admin@pharmaflow.com");
        user.setRole(Role.ADMIN);

        CustomUserDetailsImpl userDetails = new CustomUserDetailsImpl(user);
        String expiredToken = jwtService.generateJwt(userDetails);

        assertThrows(ExpiredJwtException.class, () -> jwtService.validateToken(expiredToken));
    }
}
