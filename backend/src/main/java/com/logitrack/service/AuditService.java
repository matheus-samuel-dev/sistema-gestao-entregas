package com.logitrack.service;

import com.logitrack.domain.AuditLog;
import com.logitrack.dto.PlatformDtos;
import com.logitrack.repository.AuditLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {
    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) { this.repository = repository; }

    @Transactional
    public void record(String action, String entityType, Long entityId, String description) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        var log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setActor(authentication != null && authentication.isAuthenticated() ? authentication.getName() : "system");
        log.setDescription(description);
        repository.save(log);
    }

    @Transactional(readOnly = true)
    public List<PlatformDtos.AuditItem> list() {
        return repository.findTop200ByOrderByCreatedAtDesc().stream()
                .map(item -> new PlatformDtos.AuditItem(item.getId(), item.getAction(), item.getEntityType(),
                        item.getEntityId(), item.getActor(), item.getDescription(), item.getCreatedAt()))
                .toList();
    }
}
