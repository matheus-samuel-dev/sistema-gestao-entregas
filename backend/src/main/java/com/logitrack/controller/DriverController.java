package com.logitrack.controller;

import com.logitrack.dto.Dtos;
import com.logitrack.service.DriverService;
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
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping
    public List<Dtos.DriverResponse> list() {
        return driverService.list();
    }

    @GetMapping("/{id}")
    public Dtos.DriverResponse get(@PathVariable Long id) {
        return driverService.get(id);
    }

    @PostMapping
    public Dtos.DriverResponse create(@Valid @RequestBody Dtos.DriverRequest request) {
        return driverService.create(request);
    }

    @PutMapping("/{id}")
    public Dtos.DriverResponse update(@PathVariable Long id, @Valid @RequestBody Dtos.DriverRequest request) {
        return driverService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Dtos.DriverResponse inactivate(@PathVariable Long id) {
        return driverService.inactivate(id);
    }
}
