package com.logitrack.controller;

import com.logitrack.dto.PlatformDtos;
import com.logitrack.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {
    private final ConversationService service;

    public ConversationController(ConversationService service) { this.service = service; }

    @GetMapping
    public List<PlatformDtos.ConversationSummary> list(@RequestParam(defaultValue = "") String query) {
        return service.list(query);
    }

    @GetMapping("/{id}")
    public PlatformDtos.ConversationDetail get(@PathVariable Long id) { return service.get(id); }

    @PatchMapping("/{id}/read")
    public void markRead(@PathVariable Long id) { service.markRead(id); }

    @PostMapping("/{id}/messages")
    public PlatformDtos.ConversationMessageResponse send(@PathVariable Long id,
                                                          @Valid @RequestBody PlatformDtos.SendMessageRequest request,
                                                          Authentication authentication) {
        return service.send(id, request, authentication);
    }
}
