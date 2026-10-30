package com.example.hireflow.employer;

import org.springframework.stereotype.Service;

import com.example.hireflow.employer.entity.EmployerProfile;
import com.example.hireflow.employer.dto.EmployerProfileResponse;
import com.example.hireflow.employer.dto.EmployerProfileUpdateRequest;

@Service
public class EmployerProfileService {
    private final EmployerProfileRepository employerProfileRepository;

    public EmployerProfileService(EmployerProfileRepository employerProfileRepository) {
        this.employerProfileRepository = employerProfileRepository;
    }

    // public EmployerProfileResponse getEmployerProfileById(Long employerProfileId) {
    //     EmployerProfile profile = employerProfileRepository.findById(employerProfileId)
    //             .orElseThrow(() -> new IllegalArgumentException("Employer profile not found"));

    //     return new EmployerProfileResponse(
    //             profile.getCompanyName(),
    //             profile.getCompanyDescription(),
    //             profile.getWebsite(),
    //             profile.getLocation()
    //     );
    // }

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

    public EmployerProfileResponse updateEmployerProfile(Long id, EmployerProfileUpdateRequest request) {
        EmployerProfile profile = employerProfileRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Employer profile not found"));
        profile.setCompanyDescription(request.description());
        profile.setWebsite(request.website());
        profile.setLocation(request.location());
        return toResponse(employerProfileRepository.save(profile));
    }

    public EmployerProfileResponse updateEmployerProfileByUserId(Long userId, EmployerProfileUpdateRequest request) {
        return updateEmployerProfile(requireProfile(userId).getId(), request);
    }

    public EmployerProfileResponse amendEmployerProfile(Long id, EmployerProfileUpdateRequest request) {
        EmployerProfile profile = employerProfileRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Employer profile not found"));

        if (request.description() != null && !request.description().isBlank()) {
            profile.setCompanyDescription(request.description());
        }
        if (request.website() != null && !request.website().isBlank()) {
            profile.setWebsite(request.website());
        }
        if (request.location() != null && !request.location().isBlank()) {
            profile.setLocation(request.location());
        }

        EmployerProfile updatedProfile = employerProfileRepository.save(profile);

        return toResponse(updatedProfile);
    }

    public EmployerProfileResponse amendEmployerProfileByUserId(Long userId, EmployerProfileUpdateRequest request) {
        return amendEmployerProfile(requireProfile(userId).getId(), request);
    }

    private EmployerProfile requireProfile(Long userId) {
        return employerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employer profile not found for user"));
    }

    private EmployerProfileResponse toResponse(EmployerProfile profile) {
        return new EmployerProfileResponse(
            profile.getCompanyName(),
            profile.getCompanyDescription(),
            profile.getWebsite(),
            profile.getLocation()
        );
    }
}
