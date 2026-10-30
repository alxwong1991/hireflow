package com.example.hireflow.job;

import java.util.List;

import com.example.hireflow.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);
    List<Job> findByEmployerProfileIdOrderByCreatedAtDesc(Long employerProfileId);
}
