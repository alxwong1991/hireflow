package com.example.hireflow.employee;

import org.springframework.web.bind.annotation.*;

import com.example.hireflow.employee.dto.EmployeeProfileResponse;
import com.example.hireflow.employee.dto.EmployeeProfileUpdateRequest;

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

    @PostMapping("/profile/{id}/update")
    public EmployeeProfileUpdateRequest updateEmployeeProfile(@PathVariable Long id, @RequestBody EmployeeProfileUpdateRequest request) {
        return employeeProfileService.updateEmployeeProfile(id, request);
    }

    @PatchMapping("/profile/{id}/amend")
    public EmployeeProfileUpdateRequest amendEmployeeProfile(@PathVariable Long id,@RequestBody EmployeeProfileUpdateRequest request) {
        return employeeProfileService.amendEmployeeProfile(id, request);
    }
}