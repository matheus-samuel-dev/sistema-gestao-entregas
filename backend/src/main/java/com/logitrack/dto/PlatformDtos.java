package com.logitrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class PlatformDtos {
    private PlatformDtos() {}

    public record SearchItem(Long id, String type, String title, String subtitle, String status, String path) {}
    public record SearchGroup(String type, String label, long total, List<SearchItem> items) {}
    public record SearchResponse(String query, long total, List<SearchGroup> groups) {}

    public record NotificationItem(Long id, String type, String title, String message, String entityType,
                                   Long entityId, String path, boolean read, LocalDateTime createdAt) {}
    public record NotificationResponse(List<NotificationItem> items, long unreadCount) {}

    public record ConversationSummary(Long id, String participantName, String participantRole,
                                      String contextType, Long contextId, long unreadCount,
                                      LocalDateTime lastMessageAt, String lastMessage) {}
    public record ConversationMessageResponse(Long id, String senderName, String senderRole, String content,
                                              boolean read, LocalDateTime createdAt, String attachmentType,
                                              Long attachmentId) {}
    public record ConversationDetail(Long id, String participantName, String participantRole, String contextType,
                                     Long contextId, long unreadCount, LocalDateTime lastMessageAt,
                                     String lastMessage, List<ConversationMessageResponse> messages) {}
    public record SendMessageRequest(@NotBlank @Size(max = 2000) String content,
                                     String attachmentType, Long attachmentId) {}

    public record CalendarItem(Long id, String type, String title, String subtitle, LocalDateTime startAt,
                               String status, String entityType, Long entityId, String path) {}
    public record CalendarResponse(LocalDate date, List<CalendarItem> items) {}

    public record AuditItem(Long id, String action, String entityType, Long entityId, String actor,
                            String description, LocalDateTime createdAt) {}

    public record TrackingTimeline(String title, String description, LocalDateTime timestamp, String status) {}
    public record PublicTracking(String trackingCode, String orderNumber, String status, String statusLabel,
                                 LocalDateTime expectedAt, Integer progress, String city, String state,
                                 Double approximateLat, Double approximateLng, List<TrackingTimeline> timeline) {}
}
