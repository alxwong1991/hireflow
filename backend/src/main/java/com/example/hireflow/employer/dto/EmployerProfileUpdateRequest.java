package com.example.hireflow.employer.dto;

import jakarta.validation.constraints.NotBlank;

public record EmployerProfileUpdateRequest (
    @NotBlank(message = "Company description is required")
    String description,
    @NotBlank(message = "Company location is required")
    String location,
    @NotBlank(message = "Company website is required")
    String website
) {
}
