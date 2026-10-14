package com.pharmaflow.util;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    // JwtFilter puts the JWT's "user_id" claim directly as the Authentication principal
    // (see JwtFilter.doFilterInternal) - this is how every controller finds out
    // "who is making this request" without trusting a client-supplied id.
    public static Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Checks the logged-in user's role against a list of role names (without "ROLE_" prefix,
    // e.g. "PHARMACIST", "ADMIN") - used for ownership-or-staff checks in service methods
    // where a URL-level hasRole() rule isn't precise enough (e.g. "owner OR staff can view this").
    public static boolean hasAnyRole(String... roleNames) {
        for (GrantedAuthority authority : SecurityContextHolder.getContext().getAuthentication().getAuthorities()) {
            for (String roleName : roleNames) {
                if (authority.getAuthority().equals("ROLE_" + roleName)) {
                    return true;
                }
            }
        }
        return false;
    }
}
