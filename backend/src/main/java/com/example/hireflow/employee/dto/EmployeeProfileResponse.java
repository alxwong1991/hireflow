package com.example.hireflow.employee.dto;

public record EmployeeProfileResponse(
    String fullName,
    String phone,
    String location,
    String summary
) {
}
