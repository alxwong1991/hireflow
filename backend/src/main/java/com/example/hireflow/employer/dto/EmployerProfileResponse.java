package com.example.hireflow.employer.dto;

public record EmployerProfileResponse(
    String companyName,
    String companyDescription,
    String website,
    String location
) {
}
