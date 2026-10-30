package com.example.hireflow.notification.dto;

import java.time.LocalDateTime;

import com.example.hireflow.notification.entity.Notification;

public record NotificationResponse(
    Long id,
    String message,
    String targetPath,
    LocalDateTime createdAt,
    boolean read
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
            notification.getId(), notification.getMessage(), notification.getTargetPath(),
            notification.getCreatedAt(), notification.isRead()
        );
    }
}
