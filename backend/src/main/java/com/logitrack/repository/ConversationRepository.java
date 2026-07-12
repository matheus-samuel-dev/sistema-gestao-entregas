package com.logitrack.repository;

import com.logitrack.domain.Conversation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Override
    @EntityGraph(attributePaths = "messages")
    List<Conversation> findAll();

    @Override
    @EntityGraph(attributePaths = "messages")
    Optional<Conversation> findById(Long id);
}
