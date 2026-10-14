package com.pharmaflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.dto.request.CreateUserRequest;
import com.pharmaflow.enums.Role;
import com.pharmaflow.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    // Desc - list every registered user (Admin's "Manage Users" screen)
    // URI - GET /admin/users | ADMIN only (covered by the "/admin/**" security rule)
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Desc - create a user with an explicit role (CUSTOMER, PHARMACIST or ADMIN).
    // This is the only way a PHARMACIST or ADMIN account can be created - public
    // /auth/register always forces CUSTOMER.
    // URI - POST /admin/users | ADMIN only
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    // Desc - list users of one role, e.g. all Pharmacist accounts
    // URI - GET /admin/users/role/{role}
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Desc - activate/deactivate a user account instead of deleting it
    // URI - PATCH /admin/users/{userId}/status?active=true|false
    @PatchMapping("/{userId}/status")
    public ResponseEntity<?> setUserActiveStatus(@PathVariable Long userId, @RequestParam boolean active) {
        return ResponseEntity.ok(userService.setUserActiveStatus(userId, active));
    }
}
