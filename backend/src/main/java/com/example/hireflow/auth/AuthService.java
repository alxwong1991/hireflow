package com.example.hireflow.auth;

import com.example.hireflow.auth.dto.AuthResponse;
import com.example.hireflow.auth.dto.LoginRequest;
import com.example.hireflow.auth.dto.RegisterRequest;
import com.example.hireflow.employee.EmployeeProfile;
import com.example.hireflow.employee.EmployeeProfileRepository;
import com.example.hireflow.employer.EmployerProfile;
import com.example.hireflow.employer.EmployerProfileRepository;
import com.example.hireflow.user.User;
import com.example.hireflow.user.UserRepository;
import com.example.hireflow.user.UserRole;

import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
        UserRepository userRepository,
        EmployeeProfileRepository employeeProfileRepository,
        EmployerProfileRepository employerProfileRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        UserRole role = parseRole(request.role());

        validateRoleSpecificFields(role, request);

        String displayName = resolveDisplayName(role, request);

        User user = new User();
        user.setEmail(email);
        user.setDisplayName(displayName);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        Long employeeProfileId = null;
        Long employerProfileId = null;

        if (role == UserRole.EMPLOYEE) {
            EmployeeProfile profile = new EmployeeProfile();
            profile.setUser(savedUser);
            profile.setFullName(request.fullName().trim());

            EmployeeProfile savedProfile = employeeProfileRepository.save(profile);
            employeeProfileId = savedProfile.getId();
        }

        if (role == UserRole.EMPLOYER) {
            EmployerProfile profile = new EmployerProfile();
            profile.setUser(savedUser);
            profile.setCompanyName(request.companyName().trim());

            EmployerProfile savedProfile = employerProfileRepository.save(profile);
            employerProfileId = savedProfile.getId();
        }
        
        return new AuthResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getDisplayName(),
                savedUser.getRole().name(),
                employeeProfileId,
                employerProfileId,
                "Registration successful"
        );
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException("Account is inactive");
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        Long employeeProfileId = employeeProfileRepository.findByUserId(user.getId())
                .map(EmployeeProfile::getId)
                .orElse(null);

        Long employerProfileId = employerProfileRepository.findByUserId(user.getId())
                .map(EmployerProfile::getId)
                .orElse(null);

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                employeeProfileId,
                employerProfileId,
                "Login successful"
        );
    }

    private UserRole parseRole(String rawRole) {
        try {
            return UserRole.valueOf(rawRole.trim().toUpperCase());
        } catch (Exception exception) {
            throw new IllegalArgumentException("Role must be EMPLOYEE or EMPLOYER");
        }
    }

    private void validateRoleSpecificFields(UserRole role, RegisterRequest request) {
        if (role == UserRole.EMPLOYEE) {
            if (request.fullName() == null || request.fullName().trim().isBlank()) {
                throw new IllegalArgumentException("Full name is required for employee registration");
            }
        }

        if (role == UserRole.EMPLOYER) {
            if (request.companyName() == null || request.companyName().trim().isBlank()) {
                throw new IllegalArgumentException("Company name is required for employer registration");
            }
        }
    }

    private String resolveDisplayName(UserRole role, RegisterRequest request) {
        if (request.displayName() != null && !request.displayName().trim().isBlank()) {
            return request.displayName().trim();
        }

        if (role == UserRole.EMPLOYEE) {
            return request.fullName().trim();
        }

        return request.companyName().trim();
    }
}
