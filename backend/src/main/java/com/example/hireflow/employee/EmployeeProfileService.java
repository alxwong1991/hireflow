package com.example.hireflow.employee;

import org.springframework.stereotype.Service;

import com.example.hireflow.employee.dto.EmployeeProfileResponse;

@Service
public class EmployeeProfileService {
    private final EmployeeProfileRepository employeeProfileRepository;

    public EmployeeProfileService(EmployeeProfileRepository employeeProfileRepository) {
        this.employeeProfileRepository = employeeProfileRepository;
    }

    public EmployeeProfileResponse getEmployeeProfile(Long id) {
        EmployeeProfile profile = employeeProfileRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));
        
        return new EmployeeProfileResponse(
            profile.getFullName(),
            profile.getPhone(),
            profile.getLocation(),
            profile.getSummary()
        );
    }

    // For later use with JWT Authentication: Get employee profile by user ID
    public EmployeeProfileResponse getEmployeeProfileByUserId(Long userId) {
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found for user"));

        return new EmployeeProfileResponse(
                profile.getFullName(),
                profile.getPhone(),
                profile.getLocation(),
                profile.getSummary()
        );
    }
}
