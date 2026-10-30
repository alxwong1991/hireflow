package com.example.hireflow.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
    @NotBlank(message = "Message must not be blank")
    @Size(max = 5000, message = "Message must not exceed 5000 characters") String body
) {}
