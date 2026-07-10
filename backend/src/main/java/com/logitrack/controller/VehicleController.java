package com.logitrack.controller;

import com.logitrack.dto.Dtos;
import com.logitrack.service.VehicleService;
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
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<Dtos.VehicleResponse> list() {
        return vehicleService.list();
    }

    @GetMapping("/{id}")
    public Dtos.VehicleResponse get(@PathVariable Long id) {
        return vehicleService.get(id);
    }

    @PostMapping
    public Dtos.VehicleResponse create(@Valid @RequestBody Dtos.VehicleRequest request) {
        return vehicleService.create(request);
    }

    @PutMapping("/{id}")
    public Dtos.VehicleResponse update(@PathVariable Long id, @Valid @RequestBody Dtos.VehicleRequest request) {
        return vehicleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Dtos.VehicleResponse inactivate(@PathVariable Long id) {
        return vehicleService.inactivate(id);
    }
}
