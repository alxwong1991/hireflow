package com.example.hireflow.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateApplicationRequest(
    @NotBlank(message = "Cover letter is required")
    @Size(max = 5000, message = "Cover letter must be 5000 characters or fewer")
    String coverLetter
) {
}
