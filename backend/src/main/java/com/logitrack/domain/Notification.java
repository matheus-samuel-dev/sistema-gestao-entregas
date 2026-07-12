package com.logitrack.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_created_at", columnList = "created_at"),
        @Index(name = "idx_notifications_read_at", columnList = "read_at")
})
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String type;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 40)
    private String entityType;

    private Long entityId;

    @Column(length = 240)
    private String path;

    private LocalDateTime readAt;

    @Column(nullable = false, unique = true, length = 180)
    private String deduplicationKey;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public String getDeduplicationKey() { return deduplicationKey; }
    public void setDeduplicationKey(String deduplicationKey) { this.deduplicationKey = deduplicationKey; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
