package com.pharmaflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.pharmaflow.entities.User;
import com.pharmaflow.enums.Role;
import com.pharmaflow.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Seeds exactly one ADMIN account on application startup, but only if the
 * users table does not already contain any ADMIN account. This solves the
 * bootstrap problem: POST /admin/users requires an ADMIN JWT to call, so the
 * very first admin can't be created through the API itself.
 *
 * Credentials are supplied via environment variables (with safe local-dev
 * defaults) so nothing sensitive is hard-coded. On every startup where an
 * admin already exists, this is a no-op.
 *
 * Configure via env vars (see README for details):
 *   PHARMAFLOW_ADMIN_EMAIL
 *   PHARMAFLOW_ADMIN_PASSWORD
 *   PHARMAFLOW_ADMIN_FIRST_NAME
 *   PHARMAFLOW_ADMIN_LAST_NAME
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${pharmaflow.admin.bootstrap.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${pharmaflow.admin.bootstrap.email:admin@pharmaflow.local}")
    private String adminEmail;

    @Value("${pharmaflow.admin.bootstrap.password:ChangeMe123!}")
    private String adminPassword;

    @Value("${pharmaflow.admin.bootstrap.first-name:System}")
    private String adminFirstName;

    @Value("${pharmaflow.admin.bootstrap.last-name:Admin}")
    private String adminLastName;

    @Override
    public void run(String... args) {
        if (!bootstrapEnabled) {
            log.info("Admin bootstrap is disabled (pharmaflow.admin.bootstrap.enabled=false); skipping.");
            return;
        }

        boolean anyAdminExists = !userRepository.findByRole(Role.ADMIN).isEmpty();
        if (anyAdminExists) {
            // Normal steady-state case on every restart after the first one.
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            log.warn("Admin bootstrap skipped: no ADMIN account exists yet, but the configured "
                    + "bootstrap email ({}) is already registered under a different role. "
                    + "Set PHARMAFLOW_ADMIN_EMAIL to an unused address, or promote that account manually.",
                    adminEmail);
            return;
        }

        User admin = new User();
        admin.setFirstName(adminFirstName);
        admin.setLastName(adminLastName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        log.warn("=================================================================");
        log.warn(" PharmaFlow: no ADMIN account was found, so one was seeded.");
        log.warn(" Login email : {}", adminEmail);
        log.warn(" Login password is the value of PHARMAFLOW_ADMIN_PASSWORD");
        log.warn(" (defaults to a placeholder if that env var isn't set).");
        log.warn(" CHANGE THIS PASSWORD IMMEDIATELY via PUT /profile/password.");
        log.warn("=================================================================");
    }
}
