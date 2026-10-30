package com.example.hireflow.chat.dto;

import java.util.List;

public record MessagePageResponse(List<MessageResponse> items, boolean hasMore) {}
