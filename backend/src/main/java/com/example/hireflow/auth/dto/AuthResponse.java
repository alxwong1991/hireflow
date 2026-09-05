package com.example.hireflow.auth.dto;

public record AuthResponse(
    Long userId,
    String email,
    String displayName,
    String role,
    Long employeeProfileId,
    Long employerProfileId,
    String message
) {
}
