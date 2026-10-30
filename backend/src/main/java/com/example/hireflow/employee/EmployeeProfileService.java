package com.example.hireflow.employee;

import org.springframework.stereotype.Service;

import com.example.hireflow.employee.entity.EmployeeProfile;
import com.example.hireflow.employee.dto.EmployeeProfileResponse;
import com.example.hireflow.employee.dto.EmployeeProfileUpdateRequest;

@Service
public class EmployeeProfileService {
    private final EmployeeProfileRepository employeeProfileRepository;

    public EmployeeProfileService(EmployeeProfileRepository employeeProfileRepository) {
        this.employeeProfileRepository = employeeProfileRepository;
    }

    // public EmployeeProfileResponse getEmployeeProfile(Long id) {
    //     EmployeeProfile profile = employeeProfileRepository.findById(id)
    //         .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));
        
    //     return new EmployeeProfileResponse(
    //         profile.getFullName(),
    //         profile.getPhone(),
    //         profile.getLocation(),
    //         profile.getSummary()
    //     );
    // }

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

    public EmployeeProfileResponse updateEmployeeProfile(Long id, EmployeeProfileUpdateRequest request) {
        EmployeeProfile profile = employeeProfileRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));
        profile.setPhone(request.phone());
        profile.setLocation(request.location());
        profile.setSummary(request.summary());
        return toResponse(employeeProfileRepository.save(profile));
    }

    public EmployeeProfileResponse updateEmployeeProfileByUserId(Long userId, EmployeeProfileUpdateRequest request) {
        return updateEmployeeProfile(requireProfile(userId).getId(), request);
    }

    public EmployeeProfileResponse amendEmployeeProfile(Long id, EmployeeProfileUpdateRequest request) {
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

        return toResponse(updatedProfile);
    }

    public EmployeeProfileResponse amendEmployeeProfileByUserId(Long userId, EmployeeProfileUpdateRequest request) {
        return amendEmployeeProfile(requireProfile(userId).getId(), request);
    }

    private EmployeeProfile requireProfile(Long userId) {
        return employeeProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found for user"));
    }

    private EmployeeProfileResponse toResponse(EmployeeProfile profile) {
        return new EmployeeProfileResponse(
            profile.getFullName(),
            profile.getPhone(),
            profile.getLocation(),
            profile.getSummary()
        );
    }
}
