package com.logitrack.service;

import com.logitrack.domain.Notification;
import com.logitrack.dto.PlatformDtos;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class NotificationService {
    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public PlatformDtos.NotificationResponse list(boolean unreadOnly) {
        var items = (unreadOnly
                ? repository.findTop100ByReadAtIsNullOrderByCreatedAtDesc()
                : repository.findTop100ByOrderByCreatedAtDesc()).stream().map(this::map).toList();
        return new PlatformDtos.NotificationResponse(items, repository.countByReadAtIsNull());
    }

    @Transactional
    public PlatformDtos.NotificationItem markRead(Long id) {
        var notification = find(id);
        if (notification.getReadAt() == null) notification.setReadAt(LocalDateTime.now());
        return map(notification);
    }

    @Transactional
    public void markAllRead() {
        var now = LocalDateTime.now();
        repository.findTop100ByReadAtIsNullOrderByCreatedAtDesc()
                .forEach(item -> item.setReadAt(now));
    }

    @Transactional
    public void delete(Long id) { repository.delete(find(id)); }

    @Transactional
    public Notification publish(String type, String title, String message, String entityType, Long entityId,
                                String path, String deduplicationKey) {
        return repository.findByDeduplicationKey(deduplicationKey).orElseGet(() -> {
            var notification = new Notification();
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setEntityType(entityType);
            notification.setEntityId(entityId);
            notification.setPath(path);
            notification.setDeduplicationKey(deduplicationKey);
            return repository.save(notification);
        });
    }

    private Notification find(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada."));
    }

    private PlatformDtos.NotificationItem map(Notification item) {
        return new PlatformDtos.NotificationItem(item.getId(), item.getType(), item.getTitle(), item.getMessage(),
                item.getEntityType(), item.getEntityId(), item.getPath(), item.getReadAt() != null, item.getCreatedAt());
    }
}
