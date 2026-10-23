package com.example.hireflow.auth;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hireflow.auth.dto.AuthResponse;
import com.example.hireflow.auth.dto.LoginRequest;
import com.example.hireflow.auth.dto.RegisterRequest;
import com.example.hireflow.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

    public AuthController(
        AuthService authService,
        JwtService jwtService,
        CurrentUserService currentUserService
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerUser(request);
        return authService.toAuthResponse(user, jwtService.createToken(user), "Registration successful");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        User user = authService.authenticate(request);
        return authService.toAuthResponse(user, jwtService.createToken(user), "Login successful");
    }

    @GetMapping("/me")
    public AuthResponse me(Authentication authentication) {
        User user = currentUserService.requireUser(authentication);
        return authService.toAuthResponse(user, null, "Authenticated");
    }

    @PostMapping("/renew")
    public AuthResponse renew(Authentication authentication) {
        User user = currentUserService.requireUser(authentication);
        return authService.toAuthResponse(user, jwtService.createToken(user), "Session renewed");
    }
}
