package com.example.hireflow.employee;

import org.springframework.stereotype.Service;

import com.example.hireflow.employee.dto.EmployeeProfileResponse;
import com.example.hireflow.employee.dto.EmployeeProfileUpdateRequest;

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

    public EmployeeProfileUpdateRequest updateEmployeeProfile(Long id, EmployeeProfileUpdateRequest request) {
        EmployeeProfile profile = employeeProfileRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        profile.setPhone(request.phone());
        profile.setLocation(request.location());
        profile.setSummary(request.summary());

        employeeProfileRepository.save(profile);

        return request;
    }

    public EmployeeProfileUpdateRequest amendEmployeeProfile(Long id, EmployeeProfileUpdateRequest request) {
        EmployeeProfile profile = employeeProfileRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        if (request.phone() != null && !request.phone().isBlank()) {
            profile.setPhone(request.phone());
        }
        if (request.location() != null && !request.location().isBlank()) {
            profile.setLocation(request.location());
        }
        if (request.summary() != null && !request.summary().isBlank()) {
            profile.setSummary(request.summary());
        }

        EmployeeProfile updatedProfile = employeeProfileRepository.save(profile);

        return new EmployeeProfileUpdateRequest(
            updatedProfile.getPhone(),
            updatedProfile.getLocation(),
            updatedProfile.getSummary()
        );
    }
}
