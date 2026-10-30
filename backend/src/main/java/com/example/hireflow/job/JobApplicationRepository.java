package com.example.hireflow.job;

import java.util.List;

import com.example.hireflow.job.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    boolean existsByJobIdAndEmployeeProfileId(Long jobId, Long employeeProfileId);
    long countByJobId(Long jobId);
    List<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId);
    List<JobApplication> findByEmployeeProfileIdOrderByAppliedAtDesc(Long employeeProfileId);
}
