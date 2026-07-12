package com.logitrack.controller;

import com.logitrack.dto.PlatformDtos;
import com.logitrack.service.CalendarService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {
    private final CalendarService service;

    public CalendarController(CalendarService service) { this.service = service; }

    @GetMapping
    public PlatformDtos.CalendarResponse get(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.get(date == null ? LocalDate.now() : date);
    }
}
