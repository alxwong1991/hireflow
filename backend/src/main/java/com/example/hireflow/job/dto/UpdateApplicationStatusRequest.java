package com.example.hireflow.job.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateApplicationStatusRequest(
    @NotBlank(message = "Application status is required")
    String status
) {
}
