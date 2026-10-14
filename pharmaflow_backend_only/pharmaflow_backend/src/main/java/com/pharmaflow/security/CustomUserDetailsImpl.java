package com.pharmaflow.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.pharmaflow.entities.User;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomUserDetailsImpl implements UserDetails {

    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Role enum (ADMIN / PHARMACIST / CUSTOMER) becomes a single GrantedAuthority,
        // used by @PreAuthorize / hasRole(...) checks in SecurityConfig.
        // NOTE: hasRole("ADMIN") internally checks for authority "ROLE_ADMIN", so the
        // "ROLE_" prefix must be added here - hasRole() does NOT add it for you unless
        // you configure a GrantedAuthorityDefaults bean (which this project doesn't).
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        // PharmaFlow logs in with email, not a separate username field
        return user.getEmail();
    }

    @Override
    public boolean isEnabled() {
        // isActive lets Admin disable an account (e.g. a banned customer) without deleting it
        return user.isActive();
    }

    public User getUser() {
        return user;
    }
}
