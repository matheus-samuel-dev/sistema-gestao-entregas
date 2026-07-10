package com.logitrack.controller;

import com.logitrack.dto.Dtos;
import com.logitrack.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public List<Dtos.IncidentResponse> list() {
        return incidentService.list();
    }

    @GetMapping("/{id}")
    public Dtos.IncidentResponse get(@PathVariable Long id) {
        return incidentService.get(id);
    }

    @PostMapping
    public Dtos.IncidentResponse create(@Valid @RequestBody Dtos.IncidentRequest request) {
        return incidentService.create(request);
    }

    @PutMapping("/{id}")
    public Dtos.IncidentResponse update(@PathVariable Long id, @Valid @RequestBody Dtos.IncidentRequest request) {
        return incidentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Dtos.IncidentResponse cancel(@PathVariable Long id) {
        return incidentService.cancel(id);
    }
}
