package com.example.hireflow.notification;

import java.util.Optional;

import com.example.hireflow.notification.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Slice<Notification> findByRecipientIdOrderByCreatedAtDescIdDesc(Long recipientId, Pageable pageable);

    long countByRecipientIdAndReadAtIsNull(Long recipientId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        update Notification n set n.readAt = CURRENT_TIMESTAMP
        where n.recipientId = :recipientId and n.readAt is null
        and n.chatMessageId in (
            select m.id from ChatMessage m
            where m.applicationId = :applicationId and m.id <= :throughMessageId
        )
        """)
    int markChatRead(Long recipientId, Long applicationId, Long throughMessageId);
}
