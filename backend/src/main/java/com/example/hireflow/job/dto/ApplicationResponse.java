package com.example.hireflow.job.dto;

import java.time.LocalDateTime;

public record ApplicationResponse(
    Long id,
    Long jobId,
    String jobTitle,
    String companyName,
    String coverLetter,
    String status,
    LocalDateTime appliedAt
) {
}
