package com.pharmaflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.dto.request.ChangePasswordRequest;
import com.pharmaflow.dto.request.UpdateProfileRequest;
import com.pharmaflow.service.UserService;
import com.pharmaflow.util.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Validated
public class ProfileController {

    private final UserService userService;

    // Desc - view own profile (Customer, Pharmacist or Admin - whoever is logged in)
    // URI - GET /profile
    @GetMapping
    public ResponseEntity<?> getMyProfile() {
        return ResponseEntity.ok(userService.getProfile(SecurityUtil.getCurrentUserId()));
    }

    // Desc - edit own profile (name, phone, address - not email/password)
    // URI - PUT /profile
    @PutMapping
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(SecurityUtil.getCurrentUserId(), request));
    }

    // Desc - change own password (requires current password verification)
    // URI - PUT /profile/password
    @PutMapping("/password")
    public ResponseEntity<?> changeMyPassword(@Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(SecurityUtil.getCurrentUserId(), request));
    }
}
