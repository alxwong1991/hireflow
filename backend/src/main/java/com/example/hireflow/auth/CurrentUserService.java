package com.example.hireflow.auth;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.hireflow.user.User;
import com.example.hireflow.user.UserRepository;

@Service
public class CurrentUserService {
    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Authentication is required");
        }
        // Resolve the authenticated principal server-side; API callers do not choose the acting user ID.
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
