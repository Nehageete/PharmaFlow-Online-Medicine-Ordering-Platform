package com.pharmaflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.dto.request.LoginRequest;
import com.pharmaflow.dto.request.RegisterRequest;
import com.pharmaflow.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    // Desc - Customer self-registration. Always creates a CUSTOMER account (see AuthServiceImpl).
    // URI - POST /auth/register | public, no token required
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED) // 201
                .body(authService.register(request));
    }

    // Desc - Login for all roles (Customer, Pharmacist, Admin) - same endpoint, role comes from the DB record
    // URI - POST /auth/login | public, no token required
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
