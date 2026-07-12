package com.logitrack.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String participantName;

    @Column(nullable = false, length = 80)
    private String participantRole;

    @Column(length = 40)
    private String contextType;

    private Long contextId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ConversationMessage> messages = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public void addMessage(ConversationMessage message) {
        message.setConversation(this);
        messages.add(message);
    }

    public Long getId() { return id; }
    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }
    public String getParticipantRole() { return participantRole; }
    public void setParticipantRole(String participantRole) { this.participantRole = participantRole; }
    public String getContextType() { return contextType; }
    public void setContextType(String contextType) { this.contextType = contextType; }
    public Long getContextId() { return contextId; }
    public void setContextId(Long contextId) { this.contextId = contextId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<ConversationMessage> getMessages() { return messages; }
}
