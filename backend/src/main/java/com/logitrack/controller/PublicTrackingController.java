package com.logitrack.controller;

import com.logitrack.dto.PlatformDtos;
import com.logitrack.service.PublicTrackingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tracking")
public class PublicTrackingController {
    private final PublicTrackingService service;
    public PublicTrackingController(PublicTrackingService service) { this.service = service; }
    @GetMapping("/{code}")
    public PlatformDtos.PublicTracking track(@PathVariable String code) { return service.track(code); }
}
