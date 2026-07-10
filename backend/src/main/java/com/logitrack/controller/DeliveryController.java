package com.logitrack.controller;

import com.logitrack.dto.Dtos;
import com.logitrack.service.DeliveryService;
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
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping
    public List<Dtos.DeliveryResponse> list() {
        return deliveryService.list();
    }

    @GetMapping("/{id}")
    public Dtos.DeliveryResponse get(@PathVariable Long id) {
        return deliveryService.get(id);
    }

    @PostMapping
    public Dtos.DeliveryResponse create(@Valid @RequestBody Dtos.DeliveryRequest request) {
        return deliveryService.create(request);
    }

    @PutMapping("/{id}")
    public Dtos.DeliveryResponse update(@PathVariable Long id, @Valid @RequestBody Dtos.DeliveryRequest request) {
        return deliveryService.update(id, request);
    }

    @PutMapping("/{id}/status")
    public Dtos.DeliveryResponse changeStatus(@PathVariable Long id, @Valid @RequestBody Dtos.StatusUpdateRequest request) {
        return deliveryService.changeStatus(id, request);
    }

    @PostMapping("/{id}/mark-delivered")
    public Dtos.DeliveryResponse markDelivered(@PathVariable Long id) {
        return deliveryService.markDelivered(id);
    }

    @DeleteMapping("/{id}")
    public Dtos.DeliveryResponse cancel(@PathVariable Long id) {
        return deliveryService.cancel(id);
    }
}
