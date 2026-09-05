package com.example.hireflow.auth;

import org.springframework.web.bind.annotation.*;

import com.example.hireflow.auth.dto.AuthResponse;
import com.example.hireflow.auth.dto.LoginRequest;
import com.example.hireflow.auth.dto.RegisterRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
