package com.pharmaflow.dto.response;

import java.time.LocalDateTime;

import com.pharmaflow.enums.Role;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;
}
