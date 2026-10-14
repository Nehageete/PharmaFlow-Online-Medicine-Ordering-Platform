package com.pharmaflow.service.impl;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.request.ChangePasswordRequest;
import com.pharmaflow.dto.request.CreateUserRequest;
import com.pharmaflow.dto.request.UpdateProfileRequest;
import com.pharmaflow.dto.response.ApiResponse;
import com.pharmaflow.dto.response.UserProfileResponse;
import com.pharmaflow.entities.User;
import com.pharmaflow.enums.Role;
import com.pharmaflow.exception.DuplicateResourceException;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileResponse getProfile(Long userId) {
        User user = findUserOrThrow(userId);
        return toProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserOrThrow(userId);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        return toProfileResponse(user); // managed entity - Hibernate flushes changes on transaction commit
    }

    @Override
    public UserProfileResponse createUser(CreateUserRequest request) {
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
        user.setRole(request.getRole()); // explicit role - this is how PHARMACIST/ADMIN accounts get made
        user.setActive(true);

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toProfileResponse)
                .toList();
    }

    @Override
    public List<UserProfileResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::toProfileResponse)
                .toList();
    }

    @Override
    public ApiResponse setUserActiveStatus(Long userId, boolean active) {
        User user = findUserOrThrow(userId);
        if (user.getRole() == Role.ADMIN && !active) {
            throw new InvalidOperationException("Administrator accounts are protected and cannot be deactivated");
        }
        user.setActive(active);
        return new ApiResponse(active ? "User activated" : "User deactivated", "Success");
    }

    @Override
    public ApiResponse changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUserOrThrow(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidOperationException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        return new ApiResponse("Password updated successfully", "Success");
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(user.getUserId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRole(user.getRole());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
