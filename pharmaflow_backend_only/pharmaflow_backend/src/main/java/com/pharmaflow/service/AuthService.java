package com.pharmaflow.service;

import com.pharmaflow.dto.request.LoginRequest;
import com.pharmaflow.dto.request.RegisterRequest;
import com.pharmaflow.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
