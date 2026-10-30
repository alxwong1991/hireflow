package com.example.hireflow.chat.dto;

import com.example.hireflow.job.entity.JobApplication;

public record ChatResponse(
    Long applicationId, Long jobId, String jobTitle, String companyName,
    String employeeName, String status, boolean jobClosed, boolean canSendMessages
) {
    public static ChatResponse from(JobApplication application) {
        var job = application.getJob();
        return new ChatResponse(
            application.getId(), job.getId(), job.getTitle(),
            job.getEmployerProfile().getCompanyName(),
            application.getEmployeeProfile().getFullName(),
            application.getStatus().name(),
            job.getStatus() == com.example.hireflow.job.JobStatus.CLOSED,
            application.canSendChatMessages()
        );
    }
}
