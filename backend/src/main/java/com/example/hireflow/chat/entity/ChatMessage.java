package com.example.hireflow.chat.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected ChatMessage() {}

    public ChatMessage(Long applicationId, Long senderId, String body) {
        this.applicationId = applicationId;
        this.senderId = senderId;
        this.body = body;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public Long getSenderId() { return senderId; }
    public String getBody() { return body; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
