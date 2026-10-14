package com.pharmaflow.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pharmaflow.dto.request.RegisterRequest;
import com.pharmaflow.dto.response.AuthResponse;
import com.pharmaflow.entities.User;
import com.pharmaflow.enums.Role;
import com.pharmaflow.exception.DuplicateResourceException;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.security.CustomUserDetailsImpl;
import com.pharmaflow.security.JwtService;
import com.pharmaflow.service.impl.AuthServiceImpl;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void testRegister_whenEmailAlreadyExists_throwsDuplicateResourceException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setPassword("password123");
        request.setFirstName("Ravi");
        request.setLastName("Kumar");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
    }

    @Test
    void testRegister_whenEmailIsNew_createsCustomerAccountAndReturnsToken() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new.customer@example.com");
        request.setPassword("password123");
        request.setFirstName("Meera");
        request.setLastName("Shah");

        User saved = new User();
        saved.setUserId(10L);
        saved.setFirstName("Meera");
        saved.setEmail("new.customer@example.com");
        saved.setRole(Role.CUSTOMER);

        when(userRepository.existsByEmail("new.customer@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(jwtService.generateJwt(any(CustomUserDetailsImpl.class))).thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(request);

        // self-registration must always create a CUSTOMER, regardless of what's in the request
        assertEquals(Role.CUSTOMER, response.getRole());
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals(10L, response.getUserId());
    }
}
