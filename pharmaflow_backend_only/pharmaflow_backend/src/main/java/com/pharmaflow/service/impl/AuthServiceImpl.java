package com.pharmaflow.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.request.LoginRequest;
import com.pharmaflow.dto.request.RegisterRequest;
import com.pharmaflow.dto.response.AuthResponse;
import com.pharmaflow.entities.User;
import com.pharmaflow.enums.Role;
import com.pharmaflow.exception.DuplicateResourceException;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.security.CustomUserDetailsImpl;
import com.pharmaflow.security.JwtService;
import com.pharmaflow.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        // Self-registration always creates a CUSTOMER account.
        // ADMIN and PHARMACIST accounts are created separately (by an Admin), never through public signup.
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        User saved = userRepository.save(user);

        String jwt = jwtService.generateJwt(new CustomUserDetailsImpl(saved));
        return new AuthResponse("Registration successful", jwt, saved.getUserId(), saved.getFirstName(), saved.getRole());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // AuthenticationManager -> CustomUserDetailsService.loadUserByUsername -> BCrypt password check.
        // Throws AuthenticationException on bad credentials, handled by GlobalExceptionHandler.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        CustomUserDetailsImpl userDetails = (CustomUserDetailsImpl) authentication.getPrincipal();
        User user = userDetails.getUser();

        String jwt = jwtService.generateJwt(userDetails);
        return new AuthResponse("Login successful", jwt, user.getUserId(), user.getFirstName(), user.getRole());
    }
}
