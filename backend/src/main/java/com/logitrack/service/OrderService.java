package com.logitrack.service;

import com.logitrack.domain.CustomerOrder;
import com.logitrack.domain.DeliveryTimeline;
import com.logitrack.domain.enums.DeliveryStatus;
import com.logitrack.domain.enums.DriverStatus;
import com.logitrack.domain.enums.OrderStatus;
import com.logitrack.domain.enums.VehicleStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository, DeliveryRepository deliveryRepository,
                        AuditService auditService, NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.deliveryRepository = deliveryRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
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
        var order = new CustomerOrder();
        order.setOrderNumber(generateOrderNumber());
        applyEditableFields(order, request);
        order.setStatus(OrderStatus.PENDING);
        var saved = orderRepository.save(order);
        auditService.record("ORDER_CREATED", "ORDER", saved.getId(), "Pedido " + saved.getOrderNumber() + " criado.");
        return DtoMapper.toOrder(saved);
    }

    @Transactional
    public Dtos.OrderResponse update(Long id, Dtos.OrderRequest request) {
        var order = findEntity(id);
        if (order.getStatus() == OrderStatus.CANCELED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("Pedidos finalizados não podem ser editados.");
        }
        applyEditableFields(order, request);
        auditService.record("ORDER_UPDATED", "ORDER", order.getId(), "Dados do pedido atualizados.");
        return DtoMapper.toOrder(order);
    }

    @Transactional
    public Dtos.OrderResponse cancel(Long id) {
        var order = orderRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado."));
        if (order.getStatus() == OrderStatus.CANCELED) return DtoMapper.toOrder(order);
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("Pedidos entregues não podem ser cancelados.");
        }
        deliveryRepository.findByOrderId(id).stream()
                .filter(delivery -> ACTIVE_DELIVERY_STATUSES.contains(delivery.getStatus()))
                .forEach(delivery -> {
                    delivery.setStatus(DeliveryStatus.CANCELED);
                    var event = new DeliveryTimeline();
                    event.setTitle("Entrega cancelada");
                    event.setDescription("Cancelamento automático após o encerramento do pedido.");
                    event.setStatus(DeliveryStatus.CANCELED);
                    event.setTimestamp(LocalDateTime.now());
                    delivery.addTimeline(event);
                    delivery.getDriver().setStatus(DriverStatus.AVAILABLE);
                    delivery.getDriver().setCurrentVehicle(null);
                    delivery.getVehicle().setStatus(VehicleStatus.AVAILABLE);
                    delivery.getVehicle().setLinkedDriver(null);
                });
        order.setStatus(OrderStatus.CANCELED);
        notificationService.publish("ORDER_CANCELED", "Pedido cancelado", order.getOrderNumber() + " foi cancelado.",
                "ORDER", order.getId(), "/orders?details=" + order.getId(), "order-canceled-" + order.getId());
        auditService.record("ORDER_CANCELED", "ORDER", order.getId(), "Pedido e entregas ativas vinculadas foram cancelados.");
        return DtoMapper.toOrder(order);
    }

    @Transactional(readOnly = true)
    public CustomerOrder findEntity(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado."));
    }

    private void applyEditableFields(CustomerOrder order, Dtos.OrderRequest request) {
        order.setCustomerName(request.customerName().trim());
        order.setPhone(request.phone().trim());
        order.setAddress(request.address().trim());
        order.setCity(request.city().trim());
        order.setState(request.state().toUpperCase());
        order.setValue(request.value());
        order.setExpectedDeliveryAt(request.expectedDeliveryAt());
        order.setWeightKg(request.weightKg() == null ? java.math.BigDecimal.ZERO : request.weightKg());
    }

    private String generateOrderNumber() {
        return "PED-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd", Locale.ROOT)) + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
    }

    private static final EnumSet<DeliveryStatus> ACTIVE_DELIVERY_STATUSES = EnumSet.of(
            DeliveryStatus.IN_PROGRESS, DeliveryStatus.COLLECTING, DeliveryStatus.ON_THE_WAY, DeliveryStatus.DELAYED);
}
