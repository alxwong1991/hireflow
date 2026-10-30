package com.example.hireflow.notification.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "target_path", nullable = false)
    private String targetPath;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    protected Notification() {}

    public Notification(Long recipientId, Long jobId, String message, String targetPath) {
        this.recipientId = recipientId;
        this.jobId = jobId;
        this.message = message;
        this.targetPath = targetPath;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getMessage() { return message; }
    public String getTargetPath() { return targetPath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isRead() { return readAt != null; }

    public void markRead() {
        if (readAt == null) {
            readAt = LocalDateTime.now();
        }
    }
}
