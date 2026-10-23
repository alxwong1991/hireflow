package com.example.hireflow.job.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateJobStatusRequest(
    @NotBlank(message = "Job status is required")
    String status
) {
}
