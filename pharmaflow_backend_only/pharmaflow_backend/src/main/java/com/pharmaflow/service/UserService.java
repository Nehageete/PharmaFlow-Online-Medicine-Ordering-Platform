package com.pharmaflow.service;

import java.util.List;

import com.pharmaflow.dto.request.ChangePasswordRequest;
import com.pharmaflow.dto.request.CreateUserRequest;
import com.pharmaflow.dto.request.UpdateProfileRequest;
import com.pharmaflow.dto.response.ApiResponse;
import com.pharmaflow.dto.response.UserProfileResponse;
import com.pharmaflow.enums.Role;

public interface UserService {

    UserProfileResponse getProfile(Long userId);

    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    // ADMIN only - the only way to create a PHARMACIST or ADMIN account (public
    // /auth/register always forces CUSTOMER).
    UserProfileResponse createUser(CreateUserRequest request);

    List<UserProfileResponse> getAllUsers();

    List<UserProfileResponse> getUsersByRole(Role role);

    ApiResponse setUserActiveStatus(Long userId, boolean active);

    // verifies currentPassword server-side (PasswordEncoder.matches) before updating
    ApiResponse changePassword(Long userId, ChangePasswordRequest request);
}
