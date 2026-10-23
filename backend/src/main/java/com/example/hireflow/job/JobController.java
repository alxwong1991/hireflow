package com.example.hireflow.job;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.hireflow.job.dto.ApplicationResponse;
import com.example.hireflow.job.dto.CreateApplicationRequest;
import com.example.hireflow.job.dto.CreateJobRequest;
import com.example.hireflow.job.dto.EmployerApplicationResponse;
import com.example.hireflow.job.dto.JobResponse;
import com.example.hireflow.job.dto.UpdateApplicationStatusRequest;
import com.example.hireflow.job.dto.UpdateJobStatusRequest;
import com.example.hireflow.auth.CurrentUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class JobController {
    private final JobService jobService;
    private final CurrentUserService currentUserService;

    public JobController(JobService jobService, CurrentUserService currentUserService) {
        this.jobService = jobService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/jobs")
    public List<JobResponse> getOpenJobs() {
        return jobService.getOpenJobs();
    }

    @GetMapping("/jobs/{jobId}")
    public JobResponse getJob(@PathVariable Long jobId) {
        return jobService.getJob(jobId);
    }

    @PostMapping("/employer/jobs")
    @ResponseStatus(HttpStatus.CREATED)
    public JobResponse createJob(
        Authentication authentication,
        @Valid @RequestBody CreateJobRequest request
    ) {
        return jobService.createJobForUser(currentUserService.requireUser(authentication).getId(), request);
    }

    @GetMapping("/employer/jobs")
    public List<JobResponse> getEmployerJobs(Authentication authentication) {
        return jobService.getEmployerJobsForUser(currentUserService.requireUser(authentication).getId());
    }

    @PatchMapping("/employer/jobs/{jobId}/status")
    public JobResponse closeJob(
        Authentication authentication,
        @PathVariable Long jobId,
        @Valid @RequestBody UpdateJobStatusRequest request
    ) {
        return jobService.closeJobForUser(
            currentUserService.requireUser(authentication).getId(),
            jobId,
            request
        );
    }

    @DeleteMapping("/employer/jobs/{jobId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClosedJob(Authentication authentication, @PathVariable Long jobId) {
        jobService.deleteClosedJobForUser(
            currentUserService.requireUser(authentication).getId(),
            jobId
        );
    }

    @GetMapping("/employer/jobs/{jobId}/applications")
    public List<EmployerApplicationResponse> getJobApplications(
        Authentication authentication,
        @PathVariable Long jobId
    ) {
        return jobService.getJobApplicationsForUser(
            currentUserService.requireUser(authentication).getId(),
            jobId
        );
    }

    @PatchMapping("/employer/jobs/{jobId}/applications/{applicationId}/status")
    public EmployerApplicationResponse updateApplicationStatus(
        Authentication authentication,
        @PathVariable Long jobId,
        @PathVariable Long applicationId,
        @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        return jobService.updateApplicationStatusForUser(
            currentUserService.requireUser(authentication).getId(),
            jobId,
            applicationId,
            request
        );
    }

    @PostMapping("/employee/jobs/{jobId}/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse apply(
        @PathVariable Long jobId,
        Authentication authentication,
        @Valid @RequestBody CreateApplicationRequest request
    ) {
        return jobService.applyForUser(
            jobId,
            currentUserService.requireUser(authentication).getId(),
            request
        );
    }

    @GetMapping("/employee/applications")
    public List<ApplicationResponse> getEmployeeApplications(Authentication authentication) {
        return jobService.getEmployeeApplicationsForUser(
            currentUserService.requireUser(authentication).getId()
        );
    }
}
