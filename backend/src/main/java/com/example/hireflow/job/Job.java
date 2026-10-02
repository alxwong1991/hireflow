package com.example.hireflow.job;

import java.time.LocalDateTime;

import com.example.hireflow.employer.EmployerProfile;

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
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_profile_id", nullable = false)
    private EmployerProfile employerProfile;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    private EmploymentType employmentType;

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = createdAt == null ? now : createdAt;
        updatedAt = updatedAt == null ? now : updatedAt;
        status = status == null ? JobStatus.OPEN : status;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public EmployerProfile getEmployerProfile() { return employerProfile; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getRequirements() { return requirements; }
    public String getLocation() { return location; }
    public EmploymentType getEmploymentType() { return employmentType; }
    public Integer getSalaryMin() { return salaryMin; }
    public Integer getSalaryMax() { return salaryMax; }
    public JobStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getClosedAt() { return closedAt; }

    public void setEmployerProfile(EmployerProfile employerProfile) { this.employerProfile = employerProfile; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public void setLocation(String location) { this.location = location; }
    public void setEmploymentType(EmploymentType employmentType) { this.employmentType = employmentType; }
    public void setSalaryMin(Integer salaryMin) { this.salaryMin = salaryMin; }
    public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }
    public void setStatus(JobStatus status) { this.status = status; }
}
