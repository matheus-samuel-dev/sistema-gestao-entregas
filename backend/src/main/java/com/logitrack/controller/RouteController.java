package com.logitrack.controller;

import com.logitrack.dto.Dtos;
import com.logitrack.service.RouteService;
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
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public List<Dtos.RouteResponse> list() {
        return routeService.list();
    }

    @GetMapping("/{id}")
    public Dtos.RouteResponse get(@PathVariable Long id) {
        return routeService.get(id);
    }

    @PostMapping
    public Dtos.RouteResponse create(@Valid @RequestBody Dtos.RouteRequest request) {
        return routeService.create(request);
    }

    @PutMapping("/{id}")
    public Dtos.RouteResponse update(@PathVariable Long id, @Valid @RequestBody Dtos.RouteRequest request) {
        return routeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Dtos.RouteResponse cancel(@PathVariable Long id) {
        return routeService.cancel(id);
    }
}
