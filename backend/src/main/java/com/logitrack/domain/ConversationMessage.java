package com.logitrack.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_messages", indexes = {
        @Index(name = "idx_messages_conversation_created", columnList = "conversation_id,created_at")
})
public class ConversationMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(nullable = false, length = 120)
    private String senderName;

    @Column(nullable = false, length = 80)
    private String senderRole;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false)
    private boolean readMessage;

    @Column(length = 32)
    private String attachmentType;

    private Long attachmentId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public boolean isReadMessage() { return readMessage; }
    public void setReadMessage(boolean readMessage) { this.readMessage = readMessage; }
    public String getAttachmentType() { return attachmentType; }
    public void setAttachmentType(String attachmentType) { this.attachmentType = attachmentType; }
    public Long getAttachmentId() { return attachmentId; }
    public void setAttachmentId(Long attachmentId) { this.attachmentId = attachmentId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
