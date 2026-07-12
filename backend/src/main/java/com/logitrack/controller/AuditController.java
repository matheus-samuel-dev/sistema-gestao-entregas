package com.logitrack.controller;

import com.logitrack.dto.PlatformDtos;
import com.logitrack.service.AuditService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {
    private final AuditService service;
    public AuditController(AuditService service) { this.service = service; }
    @GetMapping
    public List<PlatformDtos.AuditItem> list() { return service.list(); }
}
