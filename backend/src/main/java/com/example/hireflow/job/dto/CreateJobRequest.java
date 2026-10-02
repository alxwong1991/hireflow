package com.example.hireflow.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateJobRequest(
    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Job title must be 200 characters or fewer")
    String title,

    @NotBlank(message = "Job description is required")
    String description,

    String requirements,

    @Size(max = 150, message = "Location must be 150 characters or fewer")
    String location,

    @NotNull(message = "Employment type is required")
    String employmentType,

    @PositiveOrZero(message = "Minimum salary cannot be negative")
    Integer salaryMin,

    @PositiveOrZero(message = "Maximum salary cannot be negative")
    Integer salaryMax
) {
}
