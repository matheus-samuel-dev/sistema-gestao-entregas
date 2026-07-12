package com.logitrack.controller;

import com.logitrack.dto.PlatformDtos;
import com.logitrack.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public PlatformDtos.NotificationResponse list(@RequestParam(defaultValue = "false") boolean unreadOnly) {
        return service.list(unreadOnly);
    }

    @PatchMapping("/{id}/read")
    public PlatformDtos.NotificationItem markRead(@PathVariable Long id) { return service.markRead(id); }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead() { service.markAllRead(); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
