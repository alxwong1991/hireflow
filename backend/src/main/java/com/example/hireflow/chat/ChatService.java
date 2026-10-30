package com.example.hireflow.chat;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hireflow.chat.dto.ChatResponse;
import com.example.hireflow.chat.dto.MessagePageResponse;
import com.example.hireflow.chat.dto.MessageResponse;
import com.example.hireflow.chat.dto.SendMessageRequest;
import com.example.hireflow.chat.entity.ChatMessage;
import com.example.hireflow.job.JobApplicationRepository;
import com.example.hireflow.job.entity.JobApplication;
import com.example.hireflow.notification.NotificationService;

@Service
@Transactional
public class ChatService {
    private final JobApplicationRepository applications;
    private final ChatMessageRepository messages;
    private final NotificationService notifications;

    public ChatService(JobApplicationRepository applications, ChatMessageRepository messages,
            NotificationService notifications) {
        this.applications = applications;
        this.messages = messages;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> list(Long userId) {
        return applications.findChatsForUser(userId).stream().map(ChatResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ChatResponse get(Long userId, Long applicationId) {
        return ChatResponse.from(requireChat(userId, applicationId));
    }

    @Transactional(readOnly = true)
    public MessagePageResponse getMessages(Long userId, Long applicationId, Long beforeId) {
        // Verify access before fetching a page; the ID cursor lets clients load older messages without offset paging.
        requireChat(userId, applicationId);
        if (beforeId != null && beforeId <= 0) {
            throw new IllegalArgumentException("Message cursor must be positive");
        }
        var page = messages.findMessages(applicationId, beforeId, PageRequest.of(0, 50));
        return new MessagePageResponse(
            page.stream().map(message -> MessageResponse.from(message, userId)).toList(), page.hasNext()
        );
    }

    public MessageResponse send(Long userId, Long applicationId, SendMessageRequest request) {
        // Serialize sending with status changes so a completed rejection cannot accept a new message.
        var application = applications.findByIdForUpdate(applicationId)
            .orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        // A chat is private to the employee and employer attached to this application.
        requireParticipant(userId, application);
        if (!application.canSendChatMessages()) {
            throw new IllegalArgumentException(
                "This application was rejected. You can view previous messages, but messaging is disabled."
            );
        }
        String body = request.body().strip();
        if (body.isBlank() || body.length() > 5000) {
            throw new IllegalArgumentException("Message must contain between 1 and 5000 characters");
        }
        var message = messages.save(new ChatMessage(applicationId, userId, body));
        notifications.chatMessageReceived(application, message);
        return MessageResponse.from(message, userId);
    }

    public void markRead(Long userId, Long applicationId, Long throughMessageId) {
        requireChat(userId, applicationId);
        // Bound the read receipt to a real message in this chat; newer messages remain unread.
        messages.findByIdAndApplicationId(throughMessageId, applicationId)
            .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        notifications.markChatRead(userId, applicationId, throughMessageId);
    }

    private JobApplication requireChat(Long userId, Long applicationId) {
        var application = applications.findById(applicationId)
            .orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        requireParticipant(userId, application);
        return application;
    }

    private void requireParticipant(Long userId, JobApplication application) {
        // Use the authenticated account ID rather than trusting a participant ID from the request.
        boolean participant = application.getEmployeeProfile().getUser().getId().equals(userId)
            || application.getJob().getEmployerProfile().getUser().getId().equals(userId);
        if (!participant || !application.isChatEnabled()) {
            throw new IllegalArgumentException("Chat not found or not yet available");
        }
    }
}
