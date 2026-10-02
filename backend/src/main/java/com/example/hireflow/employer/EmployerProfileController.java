package com.example.hireflow.employer;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import com.example.hireflow.auth.CurrentUserService;
import com.example.hireflow.employer.dto.EmployerProfileResponse;
import com.example.hireflow.employer.dto.EmployerProfileUpdateRequest;

@RestController
@RequestMapping("/api/employer")
public class EmployerProfileController {
    private final EmployerProfileService employerProfileService;
    private final CurrentUserService currentUserService;

    public EmployerProfileController(EmployerProfileService employerProfileService, CurrentUserService currentUserService) {
        this.employerProfileService = employerProfileService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/profile")
    public EmployerProfileResponse getEmployerProfile(Authentication authentication) {
        return employerProfileService.getEmployerProfileByUserId(
            currentUserService.requireUser(authentication).getId()
        );
    }

    @PostMapping("/profile")
    public EmployerProfileResponse updateEmployerProfile(Authentication authentication, @RequestBody EmployerProfileUpdateRequest request) {
        return employerProfileService.updateEmployerProfileByUserId(
            currentUserService.requireUser(authentication).getId(),
            request
        );
    }

    @PatchMapping("/profile")
    public EmployerProfileResponse amendEmployerProfile(Authentication authentication, @RequestBody EmployerProfileUpdateRequest request) {
        return employerProfileService.amendEmployerProfileByUserId(
            currentUserService.requireUser(authentication).getId(),
            request
        );
    }
}
