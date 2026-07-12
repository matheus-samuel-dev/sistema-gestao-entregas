package com.logitrack.repository;

import com.logitrack.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop100ByOrderByCreatedAtDesc();
    List<Notification> findTop100ByReadAtIsNullOrderByCreatedAtDesc();
    long countByReadAtIsNull();
    Optional<Notification> findByDeduplicationKey(String deduplicationKey);
}
