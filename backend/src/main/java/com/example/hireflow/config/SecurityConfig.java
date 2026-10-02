package com.example.hireflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.hireflow.auth.JwtAuthenticationFilter;
import com.example.hireflow.user.UserRepository;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {
        return http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) ->
                    response.sendError(401, "Authentication is required")
                )
                .accessDeniedHandler((request, response, exception) ->
                    response.sendError(403, "Access is denied")
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/health", "/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/jobs", "/api/jobs/*").permitAll()
                .requestMatchers("/api/employer/**").hasRole("EMPLOYER")
                .requestMatchers("/api/employee/**").hasRole("EMPLOYEE")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    UserDetailsService userDetailsService(UserRepository userRepository) {
        return email -> {
            com.example.hireflow.user.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            UserDetails details = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .disabled(!Boolean.TRUE.equals(user.getActive()))
                .build();
            return details;
        };
    }
}
