package com.example.hireflow.job.dto;

import java.time.LocalDateTime;

public record EmployerApplicationResponse(
    Long id,
    String employeeName,
    String employeeLocation,
    String employeePhone,
    String employeeSummary,
    String coverLetter,
    String status,
    LocalDateTime appliedAt,
    boolean chatEnabled
) {
}
