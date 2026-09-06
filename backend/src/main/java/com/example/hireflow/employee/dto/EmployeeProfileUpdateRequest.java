package com.example.hireflow.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EmployeeProfileUpdateRequest(
    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid phone number format")
    String phone,
    @NotBlank(message = "Location is required")
    String location,
    @NotBlank(message = "Summary is required")
    String summary
) {
}
