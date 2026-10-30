package com.example.hireflow.notification.dto;

import java.util.List;

public record NotificationPageResponse(
    List<NotificationResponse> items,
    long unreadCount,
    boolean hasMore
) {}
