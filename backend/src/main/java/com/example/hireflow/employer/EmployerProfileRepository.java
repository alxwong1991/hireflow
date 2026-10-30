package com.example.hireflow.employer;

import java.util.Optional;
import com.example.hireflow.employer.entity.EmployerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, Long> {
    Optional<EmployerProfile> findByUserId(Long userId);
}
