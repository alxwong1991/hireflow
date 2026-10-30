package com.example.hireflow.chat;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.hireflow.chat.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Newest-first cursor paging supports loading older messages without rescanning earlier offsets.
    @Query("""
        select m from ChatMessage m where m.applicationId = :applicationId
        and (:beforeId is null or m.id < :beforeId) order by m.id desc
        """)
    Slice<ChatMessage> findMessages(Long applicationId, Long beforeId, Pageable pageable);

    Optional<ChatMessage> findByIdAndApplicationId(Long id, Long applicationId);
}
