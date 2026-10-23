package com.example.hireflow.job.dto;

import java.time.LocalDateTime;

public record JobResponse(
    Long id,
    String companyName,
    String companyDescription,
    String companyWebsite,
    String companyLocation,
    String title,
    String description,
    String requirements,
    String location,
    String employmentType,
    Integer salaryMin,
    Integer salaryMax,
    String status,
    LocalDateTime createdAt,
    long applicationCount
) {
}
