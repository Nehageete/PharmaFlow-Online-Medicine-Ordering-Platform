package com.pharmaflow.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // enables @PreAuthorize at the controller/service layer, on top of URL rules below
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests(request -> request
                // public endpoints - no login required
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/auth/register", "/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/categories/**", "/medicines/**", "/reviews/**").permitAll()

                // ADMIN only - category & medicine catalog management, user management
                .requestMatchers(HttpMethod.POST, "/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/medicines/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/medicines/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/medicines/**").hasRole("ADMIN")
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // PHARMACIST only - stock updates, prescription review, order status
                .requestMatchers(HttpMethod.PATCH, "/medicines/*/stock").hasRole("PHARMACIST")
                .requestMatchers(HttpMethod.PATCH, "/orders/*/status").hasRole("PHARMACIST")
                .requestMatchers(HttpMethod.GET, "/orders/status/**").hasAnyRole("PHARMACIST", "ADMIN")
                .requestMatchers("/pharmacist/**").hasRole("PHARMACIST")

                // CUSTOMER only - cart, wishlist, checkout, own orders, reviews, payments
                .requestMatchers("/cart/**", "/wishlist/**", "/payments/process").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/orders/**").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/reviews/**").hasRole("CUSTOMER")

                // any other endpoint (profile, order history, etc.) - just needs to be logged in
                .anyRequest().authenticated());

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000", "http://127.0.0.1:3000",
            "http://localhost:3001", "http://127.0.0.1:3001",
            "http://localhost:5173", "http://127.0.0.1:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        // JwtFilter reads a client-sent "Authorization" header rather than a cookie, so
        // allowCredentials isn't strictly required for the JWT itself, but harmless to allow
        // in case the frontend ever needs cookies (e.g. for refresh tokens) later.
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
