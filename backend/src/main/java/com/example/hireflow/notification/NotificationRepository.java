package com.example.hireflow.notification;

import java.util.Optional;

import com.example.hireflow.notification.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Slice<Notification> findByRecipientIdOrderByCreatedAtDescIdDesc(Long recipientId, Pageable pageable);

    long countByRecipientIdAndReadAtIsNull(Long recipientId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);
}
