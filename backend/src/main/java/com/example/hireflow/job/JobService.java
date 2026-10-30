package com.example.hireflow.job;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.hireflow.employee.entity.EmployeeProfile;
import com.example.hireflow.employee.EmployeeProfileRepository;
import com.example.hireflow.employer.entity.EmployerProfile;
import com.example.hireflow.job.entity.Job;
import com.example.hireflow.job.entity.JobApplication;
import com.example.hireflow.employer.EmployerProfileRepository;
import com.example.hireflow.job.dto.ApplicationResponse;
import com.example.hireflow.job.dto.CreateApplicationRequest;
import com.example.hireflow.job.dto.CreateJobRequest;
import com.example.hireflow.job.dto.EmployerApplicationResponse;
import com.example.hireflow.job.dto.JobResponse;
import com.example.hireflow.job.dto.UpdateApplicationStatusRequest;
import com.example.hireflow.job.dto.UpdateJobStatusRequest;
import com.example.hireflow.notification.NotificationService;

import jakarta.transaction.Transactional;

@Service
public class JobService {
    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final NotificationService notificationService;

    public JobService(
        JobRepository jobRepository,
        JobApplicationRepository applicationRepository,
        EmployerProfileRepository employerProfileRepository,
        EmployeeProfileRepository employeeProfileRepository,
        NotificationService notificationService
    ) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.employerProfileRepository = employerProfileRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public JobResponse createJob(Long employerProfileId, CreateJobRequest request) {
        EmployerProfile employer = employerProfileRepository.findById(employerProfileId)
            .orElseThrow(() -> new IllegalArgumentException("Employer profile not found"));
        EmploymentType employmentType = parseEmploymentType(request.employmentType());
        validateSalaryRange(request.salaryMin(), request.salaryMax());

        Job job = new Job();
        job.setEmployerProfile(employer);
        job.setTitle(request.title().trim());
        job.setDescription(request.description().trim());
        job.setRequirements(normalizeOptional(request.requirements()));
        job.setLocation(normalizeOptional(request.location()));
        job.setEmploymentType(employmentType);
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        job.setStatus(JobStatus.OPEN);

        return toJobResponse(jobRepository.save(job));
    }

    @Transactional
    public JobResponse createJobForUser(Long userId, CreateJobRequest request) {
        return createJob(requireEmployerProfile(userId).getId(), request);
    }

    @Transactional
    public List<JobResponse> getOpenJobs() {
        return jobRepository.findByStatusOrderByCreatedAtDesc(JobStatus.OPEN)
            .stream()
            .map(this::toJobResponse)
            .toList();
    }

    @Transactional
    public JobResponse getJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("Job not found"));
        return toJobResponse(job);
    }

    @Transactional
    public List<JobResponse> getEmployerJobs(Long employerProfileId) {
        if (!employerProfileRepository.existsById(employerProfileId)) {
            throw new IllegalArgumentException("Employer profile not found");
        }
        return jobRepository.findByEmployerProfileIdOrderByCreatedAtDesc(employerProfileId)
            .stream()
            .map(this::toJobResponse)
            .toList();
    }

    @Transactional
    public List<JobResponse> getEmployerJobsForUser(Long userId) {
        return getEmployerJobs(requireEmployerProfile(userId).getId());
    }

    @Transactional
    public JobResponse closeJobForUser(Long userId, Long jobId, UpdateJobStatusRequest request) {
        JobStatus requestedStatus = parseJobStatus(request.status());
        if (requestedStatus != JobStatus.CLOSED) {
            throw new IllegalArgumentException("Employers can only close an open job");
        }

        Job job = requireEmployerJob(requireEmployerProfile(userId).getId(), jobId);
        if (job.getStatus() == JobStatus.CLOSED) {
            return toJobResponse(job);
        }
        if (job.getStatus() != JobStatus.OPEN) {
            throw new IllegalArgumentException("Only open jobs can be closed");
        }

        job.setStatus(JobStatus.CLOSED);
        job.setClosedAt(LocalDateTime.now());
        return toJobResponse(jobRepository.save(job));
    }

    @Transactional
    public void deleteClosedJobForUser(Long userId, Long jobId) {
        Job job = requireEmployerJob(requireEmployerProfile(userId).getId(), jobId);
        if (job.getStatus() != JobStatus.CLOSED) {
            throw new IllegalArgumentException("Only closed jobs can be deleted");
        }

        jobRepository.delete(job);
    }

    @Transactional
    public ApplicationResponse apply(Long jobId, Long employeeProfileId, CreateApplicationRequest request) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("Job not found"));
        // A job must still be open, and each employee may apply to it only once.
        if (job.getStatus() != JobStatus.OPEN) {
            throw new IllegalArgumentException("This job is no longer accepting applications");
        }

        EmployeeProfile employee = employeeProfileRepository.findById(employeeProfileId)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));
        if (applicationRepository.existsByJobIdAndEmployeeProfileId(jobId, employeeProfileId)) {
            throw new IllegalArgumentException("You have already applied to this job");
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setEmployeeProfile(employee);
        application.setCoverLetter(request.coverLetter().trim());
        application.setStatus(ApplicationStatus.APPLIED);

        application = applicationRepository.save(application);
        // Keep the employer notification in the same transaction as the application it describes.
        notificationService.applicationReceived(application, applicationRepository.countByJobId(jobId));
        return toApplicationResponse(application);
    }

    @Transactional
    public ApplicationResponse applyForUser(Long jobId, Long userId, CreateApplicationRequest request) {
        return apply(jobId, requireEmployeeProfile(userId).getId(), request);
    }

    @Transactional
    public List<ApplicationResponse> getEmployeeApplications(Long employeeProfileId) {
        if (!employeeProfileRepository.existsById(employeeProfileId)) {
            throw new IllegalArgumentException("Employee profile not found");
        }

        return applicationRepository.findByEmployeeProfileIdOrderByAppliedAtDesc(employeeProfileId)
            .stream()
            .map(this::toApplicationResponse)
            .toList();
    }

    @Transactional
    public List<ApplicationResponse> getEmployeeApplicationsForUser(Long userId) {
        return getEmployeeApplications(requireEmployeeProfile(userId).getId());
    }

    @Transactional
    public List<EmployerApplicationResponse> getJobApplications(Long employerProfileId, Long jobId) {
        requireEmployerJob(employerProfileId, jobId);

        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId)
            .stream()
            .map(this::toEmployerApplicationResponse)
            .toList();
    }

    @Transactional
    public List<EmployerApplicationResponse> getJobApplicationsForUser(Long userId, Long jobId) {
        return getJobApplications(requireEmployerProfile(userId).getId(), jobId);
    }

    @Transactional
    public EmployerApplicationResponse updateApplicationStatus(
        Long employerProfileId,
        Long jobId,
        Long applicationId,
        UpdateApplicationStatusRequest request
    ) {
        requireEmployerJob(employerProfileId, jobId);
        JobApplication application = applicationRepository.findByIdForUpdate(applicationId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (!application.getJob().getId().equals(jobId)) {
            throw new IllegalArgumentException("Application does not belong to this job");
        }

        ApplicationStatus status = parseEmployerApplicationStatus(request.status());
        if (application.getStatus() != status) {
            application.setStatus(status);
            // Avoid generating duplicate notifications when a status is saved without changing.
            notificationService.applicationStatusChanged(application);
        }
        return toEmployerApplicationResponse(applicationRepository.save(application));
    }

    @Transactional
    public EmployerApplicationResponse updateApplicationStatusForUser(
        Long userId,
        Long jobId,
        Long applicationId,
        UpdateApplicationStatusRequest request
    ) {
        return updateApplicationStatus(
            requireEmployerProfile(userId).getId(),
            jobId,
            applicationId,
            request
        );
    }

    private EmploymentType parseEmploymentType(String value) {
        try {
            return EmploymentType.valueOf(value.trim().toUpperCase());
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid employment type");
        }
    }

    private JobStatus parseJobStatus(String value) {
        try {
            return JobStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception exception) {
            throw new IllegalArgumentException("Job status must be CLOSED");
        }
    }

    private ApplicationStatus parseEmployerApplicationStatus(String value) {
        ApplicationStatus status;
        try {
            status = ApplicationStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception exception) {
            throw new IllegalArgumentException(
                "Status must be APPLIED, REVIEWING, SHORTLISTED, REJECTED, or ACCEPTED"
            );
        }

        if (status == ApplicationStatus.WITHDRAWN) {
            throw new IllegalArgumentException("Employers cannot withdraw an employee application");
        }
        return status;
    }

    private Job requireEmployerJob(Long employerProfileId, Long jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("Job not found"));
        // Reuse this ownership check before employers view applicants or change/delete a job.
        if (!job.getEmployerProfile().getId().equals(employerProfileId)) {
            throw new IllegalArgumentException("This job does not belong to the employer");
        }
        return job;
    }

    // Convert the authenticated account ID to its role-specific profile instead of trusting a client-supplied profile ID.
    private EmployerProfile requireEmployerProfile(Long userId) {
        return employerProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employer profile not found"));
    }

    private EmployeeProfile requireEmployeeProfile(Long userId) {
        return employeeProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));
    }

    private void validateSalaryRange(Integer salaryMin, Integer salaryMax) {
        if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
            throw new IllegalArgumentException("Minimum salary cannot exceed maximum salary");
        }
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private JobResponse toJobResponse(Job job) {
        return new JobResponse(
            job.getId(),
            job.getEmployerProfile().getCompanyName(),
            job.getEmployerProfile().getCompanyDescription(),
            job.getEmployerProfile().getWebsite(),
            job.getEmployerProfile().getLocation(),
            job.getTitle(),
            job.getDescription(),
            job.getRequirements(),
            job.getLocation(),
            job.getEmploymentType().name(),
            job.getSalaryMin(),
            job.getSalaryMax(),
            job.getStatus().name(),
            job.getCreatedAt(),
            applicationRepository.countByJobId(job.getId())
        );
    }

    private ApplicationResponse toApplicationResponse(JobApplication application) {
        Job job = application.getJob();
        return new ApplicationResponse(
            application.getId(),
            job.getId(),
            job.getTitle(),
            job.getEmployerProfile().getCompanyName(),
            application.getCoverLetter(),
            application.getStatus().name(),
            application.getAppliedAt(),
            application.isChatEnabled()
        );
    }

    private EmployerApplicationResponse toEmployerApplicationResponse(JobApplication application) {
        EmployeeProfile employee = application.getEmployeeProfile();
        return new EmployerApplicationResponse(
            application.getId(),
            employee.getFullName(),
            employee.getLocation(),
            employee.getPhone(),
            employee.getSummary(),
            application.getCoverLetter(),
            application.getStatus().name(),
            application.getAppliedAt(),
            application.isChatEnabled()
        );
    }
}
