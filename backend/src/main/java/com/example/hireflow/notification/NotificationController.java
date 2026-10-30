package com.example.hireflow.notification;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.hireflow.auth.CurrentUserService;
import com.example.hireflow.notification.dto.NotificationPageResponse;
import com.example.hireflow.notification.dto.NotificationResponse;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public NotificationController(NotificationService notificationService, CurrentUserService currentUserService) {
        this.notificationService = notificationService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public NotificationPageResponse getNotifications(
        Authentication authentication,
        @RequestParam(defaultValue = "0") int page
    ) {
        return notificationService.getNotifications(currentUserService.requireUser(authentication).getId(), page);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(Authentication authentication, @PathVariable Long id) {
        return notificationService.markRead(currentUserService.requireUser(authentication).getId(), id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNotification(Authentication authentication, @PathVariable Long id) {
        notificationService.deleteReadNotification(currentUserService.requireUser(authentication).getId(), id);
    }
}
