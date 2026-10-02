package com.example.hireflow.job;

import java.time.LocalDateTime;

import com.example.hireflow.employee.EmployeeProfile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_profile_id", nullable = false)
    private EmployeeProfile employeeProfile;

    @Column(name = "cover_letter", nullable = false, columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        appliedAt = appliedAt == null ? now : appliedAt;
        updatedAt = updatedAt == null ? now : updatedAt;
        status = status == null ? ApplicationStatus.APPLIED : status;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Job getJob() { return job; }
    public EmployeeProfile getEmployeeProfile() { return employeeProfile; }
    public String getCoverLetter() { return coverLetter; }
    public ApplicationStatus getStatus() { return status; }
    public LocalDateTime getAppliedAt() { return appliedAt; }

    public void setJob(Job job) { this.job = job; }
    public void setEmployeeProfile(EmployeeProfile employeeProfile) { this.employeeProfile = employeeProfile; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
}
