package com.pharmaflow.dto.response;

import com.pharmaflow.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {

    private String message;
    private String token;
    private Long userId;
    private String firstName;
    private Role role;
}
