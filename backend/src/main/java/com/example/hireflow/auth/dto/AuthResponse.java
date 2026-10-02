package com.example.hireflow.auth.dto;

public record AuthResponse(
    String token,
    String email,
    String displayName,
    String role,
    String message
) {
}
