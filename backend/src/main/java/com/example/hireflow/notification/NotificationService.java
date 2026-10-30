package com.example.hireflow.notification;

import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hireflow.job.entity.JobApplication;
import com.example.hireflow.notification.dto.NotificationPageResponse;
import com.example.hireflow.notification.dto.NotificationResponse;
import com.example.hireflow.notification.entity.Notification;

@Service
@Transactional
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void applicationReceived(JobApplication application, long applicantCount) {
        // Called from the application transaction so the employer is notified only if the application is committed.
        var job = application.getJob();
        notificationRepository.save(new Notification(
            job.getEmployerProfile().getUser().getId(),
            job.getId(),
            "%s applied to %s. %d applicant%s so far.".formatted(
                application.getEmployeeProfile().getFullName(), job.getTitle(),
                applicantCount, applicantCount == 1 ? "" : "s"
            ),
            "/employer/jobs/" + job.getId() + "/applications"
        ));
    }

    public void applicationStatusChanged(JobApplication application) {
        // The applicant's notification is written with the status change in the same transaction.
        var job = application.getJob();
        notificationRepository.save(new Notification(
            application.getEmployeeProfile().getUser().getId(),
            job.getId(),
            "%s updated your application for %s to %s.".formatted(
                job.getEmployerProfile().getCompanyName(), job.getTitle(),
                application.getStatus().name().toLowerCase(Locale.ROOT)
            ),
            "/employee/applications#application-" + application.getId()
        ));
    }

    @Transactional(readOnly = true)
    public NotificationPageResponse getNotifications(Long userId, int page) {
        if (page < 0) {
            throw new IllegalArgumentException("Notification page must not be negative");
        }
        // Slice-based paging avoids a total-row count; unreadCount is returned separately for the navigation badge.
        var notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDescIdDesc(
            userId, PageRequest.of(page, 20)
        );
        return new NotificationPageResponse(
            notifications.stream().map(NotificationResponse::from).toList(),
            notificationRepository.countByRecipientIdAndReadAtIsNull(userId),
            notifications.hasNext()
        );
    }

    public NotificationResponse markRead(Long userId, Long notificationId) {
        Notification notification = requireNotification(userId, notificationId);
        notification.markRead();
        return NotificationResponse.from(notification);
    }

    public void deleteReadNotification(Long userId, Long notificationId) {
        Notification notification = requireNotification(userId, notificationId);
        if (!notification.isRead()) {
            throw new IllegalArgumentException("Read a notification before deleting it");
        }
        notificationRepository.delete(notification);
    }

    private Notification requireNotification(Long userId, Long notificationId) {
        // Scoping lookup by recipient prevents one account from reading or deleting another account's notification.
        return notificationRepository.findByIdAndRecipientId(notificationId, userId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
    }
}
