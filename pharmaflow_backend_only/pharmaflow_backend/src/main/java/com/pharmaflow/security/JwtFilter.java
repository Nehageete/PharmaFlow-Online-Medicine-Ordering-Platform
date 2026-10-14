package com.pharmaflow.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String headerValue = request.getHeader("Authorization");

            if (headerValue != null && headerValue.startsWith("Bearer ")) {
                String jwt = headerValue.substring(7);

                Claims claims = jwtService.validateToken(jwt);

                Long userId = claims.get("user_id", Long.class);
                String userRole = claims.get("user_role", String.class);

                // principal = userId (not the whole User entity) - services fetch fresh data from the DB when needed.
                // "ROLE_" prefix must match what CustomUserDetailsImpl.getAuthorities() produces at login time,
                // since hasRole("ADMIN") in SecurityConfig checks for authority "ROLE_ADMIN".
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + userRole)));

                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                log.debug("No JWT found in request to {}", request.getRequestURI());
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Invalid or expired JWT\",\"status\":\"Failed\"}");
        }
    }
}
