package com.logitrack.controller;

import com.logitrack.dto.Dtos;
import com.logitrack.service.OrderService;
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
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Dtos.OrderResponse> list() {
        return orderService.list();
    }

    @GetMapping("/{id}")
    public Dtos.OrderResponse get(@PathVariable Long id) {
        return orderService.get(id);
    }

    @PostMapping
    public Dtos.OrderResponse create(@Valid @RequestBody Dtos.OrderRequest request) {
        return orderService.create(request);
    }

    @PutMapping("/{id}")
    public Dtos.OrderResponse update(@PathVariable Long id, @Valid @RequestBody Dtos.OrderRequest request) {
        return orderService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Dtos.OrderResponse cancel(@PathVariable Long id) {
        return orderService.cancel(id);
    }
}
