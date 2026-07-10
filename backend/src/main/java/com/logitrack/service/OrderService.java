package com.logitrack.service;

import com.logitrack.domain.CustomerOrder;
import com.logitrack.domain.enums.OrderStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<Dtos.OrderResponse> list() {
        return orderRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(CustomerOrder::getCreatedAt).reversed())
                .map(DtoMapper::toOrder)
                .toList();
    }

    @Transactional(readOnly = true)
    public Dtos.OrderResponse get(Long id) {
        return DtoMapper.toOrder(findEntity(id));
    }

    @Transactional
    public Dtos.OrderResponse create(Dtos.OrderRequest request) {
        orderRepository.findByOrderNumber(request.orderNumber())
                .ifPresent(existing -> {
                    throw new BusinessException("Ja existe um pedido com este numero.");
                });
        var order = new CustomerOrder();
        apply(order, request);
        return DtoMapper.toOrder(orderRepository.save(order));
    }

    @Transactional
    public Dtos.OrderResponse update(Long id, Dtos.OrderRequest request) {
        var order = findEntity(id);
        orderRepository.findByOrderNumber(request.orderNumber())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Ja existe um pedido com este numero.");
                });
        apply(order, request);
        return DtoMapper.toOrder(order);
    }

    @Transactional
    public Dtos.OrderResponse cancel(Long id) {
        var order = findEntity(id);
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("Pedidos entregues nao podem ser cancelados.");
        }
        order.setStatus(OrderStatus.CANCELED);
        return DtoMapper.toOrder(order);
    }

    @Transactional(readOnly = true)
    public CustomerOrder findEntity(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido nao encontrado."));
    }

    private void apply(CustomerOrder order, Dtos.OrderRequest request) {
        order.setOrderNumber(request.orderNumber());
        order.setCustomerName(request.customerName());
        order.setPhone(request.phone());
        order.setAddress(request.address());
        order.setCity(request.city());
        order.setState(request.state().toUpperCase());
        order.setValue(request.value());
        order.setStatus(request.status() == null ? OrderStatus.PENDING : request.status());
        order.setExpectedDeliveryAt(request.expectedDeliveryAt());
    }
}
