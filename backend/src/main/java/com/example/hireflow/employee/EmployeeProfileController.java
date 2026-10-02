package com.example.hireflow.employee;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import com.example.hireflow.auth.CurrentUserService;
import com.example.hireflow.employee.dto.EmployeeProfileResponse;
import com.example.hireflow.employee.dto.EmployeeProfileUpdateRequest;

@RestController
@RequestMapping("/api/employee")
public class EmployeeProfileController {
    private final EmployeeProfileService employeeProfileService;
    private final CurrentUserService currentUserService;

    public EmployeeProfileController(EmployeeProfileService employeeProfileService, CurrentUserService currentUserService) {
        this.employeeProfileService = employeeProfileService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/profile")
    public EmployeeProfileResponse getEmployeeProfile(Authentication authentication) {
        return employeeProfileService.getEmployeeProfileByUserId(
            currentUserService.requireUser(authentication).getId()
        );
    }

    @PostMapping("/profile")
    public EmployeeProfileResponse updateEmployeeProfile(Authentication authentication, @RequestBody EmployeeProfileUpdateRequest request) {
        return employeeProfileService.updateEmployeeProfileByUserId(
            currentUserService.requireUser(authentication).getId(),
            request
        );
    }

    @PatchMapping("/profile")
    public EmployeeProfileResponse amendEmployeeProfile(Authentication authentication, @RequestBody EmployeeProfileUpdateRequest request) {
        return employeeProfileService.amendEmployeeProfileByUserId(
            currentUserService.requireUser(authentication).getId(),
            request
        );
    }
}