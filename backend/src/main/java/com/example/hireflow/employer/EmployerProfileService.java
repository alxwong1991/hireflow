package com.example.hireflow.employer;

import org.springframework.stereotype.Service;

import com.example.hireflow.employer.dto.EmployerProfileResponse;

@Service
public class EmployerProfileService {
    private final EmployerProfileRepository employerProfileRepository;

    public EmployerProfileService(EmployerProfileRepository employerProfileRepository) {
        this.employerProfileRepository = employerProfileRepository;
    }

    public EmployerProfileResponse getEmployerProfileById(Long employerProfileId) {
        EmployerProfile profile = employerProfileRepository.findById(employerProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Employer profile not found"));

        return new EmployerProfileResponse(
                profile.getCompanyName(),
                profile.getCompanyDescription(),
                profile.getWebsite(),
                profile.getLocation()
        );
    }

    // For later use with JWT Authentication: Get employer profile by user ID
    public EmployerProfileResponse getEmployerProfileByUserId(Long userId) {
        EmployerProfile profile = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employer profile not found for user"));

        return new EmployerProfileResponse(
                profile.getCompanyName(),
                profile.getCompanyDescription(),
                profile.getWebsite(),
                profile.getLocation()
        );
    }
}
