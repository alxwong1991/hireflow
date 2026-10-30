package com.example.hireflow.chat;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.hireflow.auth.CurrentUserService;
import com.example.hireflow.chat.dto.ChatResponse;
import com.example.hireflow.chat.dto.MessagePageResponse;
import com.example.hireflow.chat.dto.MessageResponse;
import com.example.hireflow.chat.dto.SendMessageRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chats")
public class ChatController {
    private final ChatService chats;
    private final CurrentUserService users;

    public ChatController(ChatService chats, CurrentUserService users) {
        this.chats = chats;
        this.users = users;
    }

    @GetMapping
    public List<ChatResponse> list(Authentication authentication) {
        return chats.list(users.requireUser(authentication).getId());
    }

    @GetMapping("/{applicationId}")
    public ChatResponse get(Authentication authentication, @PathVariable Long applicationId) {
        return chats.get(users.requireUser(authentication).getId(), applicationId);
    }

    @GetMapping("/{applicationId}/messages")
    public MessagePageResponse messages(Authentication authentication, @PathVariable Long applicationId,
            @RequestParam(required = false) Long beforeId) {
        return chats.getMessages(users.requireUser(authentication).getId(), applicationId, beforeId);
    }

    @PostMapping("/{applicationId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse send(Authentication authentication, @PathVariable Long applicationId,
            @Valid @RequestBody SendMessageRequest request) {
        return chats.send(users.requireUser(authentication).getId(), applicationId, request);
    }

    @PatchMapping("/{applicationId}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void read(Authentication authentication, @PathVariable Long applicationId,
            @RequestParam Long throughMessageId) {
        chats.markRead(users.requireUser(authentication).getId(), applicationId, throughMessageId);
    }
}
