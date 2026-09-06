package com.example.hireflow.employer;

import org.springframework.web.bind.annotation.*;

import com.example.hireflow.employer.dto.EmployerProfileResponse;

@RestController
@RequestMapping("/api/employer")
public class EmployerProfileController {
    private final EmployerProfileService employerProfileService;

    public EmployerProfileController(EmployerProfileService employerProfileService) {
        this.employerProfileService = employerProfileService;
    }

    @GetMapping("/profile/{id}")
    public EmployerProfileResponse getEmployerProfile(@PathVariable Long id) {
        return employerProfileService.getEmployerProfileById(id);
    }
}
