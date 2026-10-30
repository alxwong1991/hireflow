package com.example.hireflow.chat.dto;

import java.time.LocalDateTime;

import com.example.hireflow.chat.entity.ChatMessage;

public record MessageResponse(Long id, String body, boolean mine, LocalDateTime createdAt) {
    public static MessageResponse from(ChatMessage message, Long userId) {
        return new MessageResponse(
            message.getId(), message.getBody(), message.getSenderId().equals(userId), message.getCreatedAt()
        );
    }
}
