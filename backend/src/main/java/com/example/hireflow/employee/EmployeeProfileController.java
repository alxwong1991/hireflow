package com.example.hireflow.employee;

import org.springframework.web.bind.annotation.*;

import com.example.hireflow.employee.dto.EmployeeProfileResponse;

@RestController
@RequestMapping("/api/employee")
public class EmployeeProfileController {
    private final EmployeeProfileService employeeProfileService;

    public EmployeeProfileController(EmployeeProfileService employeeProfileService) {
        this.employeeProfileService = employeeProfileService;
    }

    @GetMapping("/profile/{id}")
    public EmployeeProfileResponse getEmployeeProfile(@PathVariable Long id) {
        return employeeProfileService.getEmployeeProfile(id);
    }
}
