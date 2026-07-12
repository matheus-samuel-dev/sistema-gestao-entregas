package com.logitrack.service;

import com.logitrack.domain.Conversation;
import com.logitrack.domain.ConversationMessage;
import com.logitrack.dto.PlatformDtos;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.ConversationRepository;
import com.logitrack.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class ConversationService {
    private final ConversationRepository repository;
    private final UserRepository userRepository;

    public ConversationService(ConversationRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<PlatformDtos.ConversationSummary> list(String query) {
        var normalized = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return repository.findAll().stream()
                .filter(item -> normalized.isBlank() || item.getParticipantName().toLowerCase(Locale.ROOT).contains(normalized)
                        || item.getParticipantRole().toLowerCase(Locale.ROOT).contains(normalized))
                .sorted(Comparator.comparing(this::lastMessageAt).reversed())
                .map(this::summary)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlatformDtos.ConversationDetail get(Long id) {
        var conversation = find(id);
        var summary = summary(conversation);
        var messages = conversation.getMessages().stream().map(this::message).toList();
        return new PlatformDtos.ConversationDetail(summary.id(), summary.participantName(), summary.participantRole(),
                summary.contextType(), summary.contextId(), summary.unreadCount(), summary.lastMessageAt(),
                summary.lastMessage(), messages);
    }

    @Transactional
    public void markRead(Long id) {
        find(id).getMessages().stream()
                .filter(message -> !message.getSenderRole().equalsIgnoreCase("ADMIN"))
                .forEach(message -> message.setReadMessage(true));
    }

    @Transactional
    public PlatformDtos.ConversationMessageResponse send(Long id, PlatformDtos.SendMessageRequest request,
                                                          Authentication authentication) {
        var conversation = find(id);
        var user = userRepository.findByEmail(authentication.getName()).orElse(null);
        var message = new ConversationMessage();
        message.setSenderName(user == null ? authentication.getName() : user.getName());
        message.setSenderRole(user == null ? "OPERATOR" : user.getRole().name());
        message.setContent(request.content().trim());
        message.setReadMessage(true);
        message.setAttachmentType(request.attachmentType());
        message.setAttachmentId(request.attachmentId());
        conversation.addMessage(message);
        repository.save(conversation);
        return message(message);
    }

    @Transactional
    public Conversation createDemoConversation(String participantName, String participantRole,
                                                String contextType, Long contextId) {
        var conversation = new Conversation();
        conversation.setParticipantName(participantName);
        conversation.setParticipantRole(participantRole);
        conversation.setContextType(contextType);
        conversation.setContextId(contextId);
        return repository.save(conversation);
    }

    private Conversation find(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Conversa não encontrada."));
    }

    private LocalDateTime lastMessageAt(Conversation conversation) {
        return conversation.getMessages().isEmpty() ? conversation.getCreatedAt()
                : conversation.getMessages().get(conversation.getMessages().size() - 1).getCreatedAt();
    }

    private PlatformDtos.ConversationSummary summary(Conversation conversation) {
        var last = conversation.getMessages().isEmpty() ? null
                : conversation.getMessages().get(conversation.getMessages().size() - 1);
        var unread = conversation.getMessages().stream()
                .filter(message -> !message.isReadMessage() && !message.getSenderRole().equalsIgnoreCase("ADMIN"))
                .count();
        return new PlatformDtos.ConversationSummary(conversation.getId(), conversation.getParticipantName(),
                conversation.getParticipantRole(), conversation.getContextType(), conversation.getContextId(), unread,
                last == null ? conversation.getCreatedAt() : last.getCreatedAt(),
                last == null ? "Conversa iniciada" : last.getContent());
    }

    private PlatformDtos.ConversationMessageResponse message(ConversationMessage item) {
        return new PlatformDtos.ConversationMessageResponse(item.getId(), item.getSenderName(), item.getSenderRole(),
                item.getContent(), item.isReadMessage(), item.getCreatedAt(), item.getAttachmentType(), item.getAttachmentId());
    }
}
