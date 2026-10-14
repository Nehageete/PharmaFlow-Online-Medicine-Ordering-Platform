package com.pharmaflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmaflow.entities.User;
import com.pharmaflow.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {

    // used by CustomUserDetailsService while loading user during login (JWT auth)
    Optional<User> findByEmail(String email);

    // used during registration, to reject duplicate emails before hitting the DB unique constraint
    boolean existsByEmail(String email);

    // used by Admin module to list users of a specific role (e.g. all PHARMACIST accounts)
    List<User> findByRole(Role role);
}
