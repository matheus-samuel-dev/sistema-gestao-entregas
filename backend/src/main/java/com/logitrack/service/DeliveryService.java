package com.logitrack.service;

import com.logitrack.domain.CustomerOrder;
import com.logitrack.domain.Delivery;
import com.logitrack.domain.DeliveryTimeline;
import com.logitrack.domain.Driver;
import com.logitrack.domain.RoutePlan;
import com.logitrack.domain.Vehicle;
import com.logitrack.domain.enums.DeliveryStatus;
import com.logitrack.domain.enums.DriverStatus;
import com.logitrack.domain.enums.OrderStatus;
import com.logitrack.domain.enums.RouteStatus;
import com.logitrack.domain.enums.VehicleStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.DriverRepository;
import com.logitrack.repository.OrderRepository;
import com.logitrack.repository.RouteRepository;
import com.logitrack.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;

@Service
public class DeliveryService {

    private static final EnumSet<DeliveryStatus> ACTIVE_STATUSES = EnumSet.of(
            DeliveryStatus.IN_PROGRESS,
            DeliveryStatus.COLLECTING,
            DeliveryStatus.ON_THE_WAY,
            DeliveryStatus.DELAYED
    );

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public DeliveryService(
            DeliveryRepository deliveryRepository,
            OrderRepository orderRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            RouteRepository routeRepository,
            AuditService auditService,
            NotificationService notificationService
    ) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeRepository = routeRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<Dtos.DeliveryResponse> list() {
        return deliveryRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Delivery::getExpectedAt))
                .map(DtoMapper::toDelivery)
                .toList();
    }

    @Transactional(readOnly = true)
    public Dtos.DeliveryResponse get(Long id) {
        return DtoMapper.toDelivery(findEntity(id));
    }

    @Transactional
    public Dtos.DeliveryResponse create(Dtos.DeliveryRequest request) {
        var order = findOrderForUpdate(request.orderId());
        var driver = findDriverForUpdate(request.driverId());
        var vehicle = findVehicleForUpdate(request.vehicleId());
        var route = request.routeId() == null ? null : findRouteForUpdate(request.routeId());
        var status = DeliveryStatus.IN_PROGRESS;

        validateOrderForDelivery(order);
        validateDriverAvailable(driver);
        validateVehicleAvailable(vehicle);
        validateRoute(route);
        validateCapacity(order, vehicle);
        validateConflicts(null, order, driver, vehicle);

        var delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setDriver(driver);
        delivery.setVehicle(vehicle);
        delivery.setRoute(route);
        delivery.setOrigin(request.origin());
        delivery.setDestination(request.destination());
        delivery.setExpectedAt(request.expectedAt());
        delivery.setStatus(status);
        delivery.setProgress(progressFor(status, 0));
        moveMarker(delivery);
        delivery.addTimeline(timeline("Entrega criada", "Pedido vinculado e recursos alocados.", status));

        syncOrderStatus(order, delivery);
        syncResources(delivery);

        var saved = deliveryRepository.save(delivery);
        auditService.record("DELIVERY_CREATED", "DELIVERY", saved.getId(), "Entrega criada para " + order.getOrderNumber() + ".");
        notificationService.publish("DELIVERY_ASSIGNED", "Entrega atribuída", order.getOrderNumber()
                        + " foi atribuído a " + driver.getName() + ".", "DELIVERY", saved.getId(),
                "/deliveries?details=" + saved.getId(), "delivery-assigned-" + saved.getId());
        return DtoMapper.toDelivery(saved);
    }

    @Transactional
    public Dtos.DeliveryResponse update(Long id, Dtos.DeliveryRequest request) {
        var delivery = findForUpdate(id);
        ensureNotTerminal(delivery);
        var oldDriver = delivery.getDriver();
        var oldVehicle = delivery.getVehicle();
        var oldOrder = delivery.getOrder();
        var order = findOrderForUpdate(request.orderId());
        var driver = findDriverForUpdate(request.driverId());
        var vehicle = findVehicleForUpdate(request.vehicleId());
        var route = request.routeId() == null ? null : findRouteForUpdate(request.routeId());
        var status = delivery.getStatus();

        if (!delivery.getOrder().getId().equals(order.getId())) {
            validateOrderForDelivery(order);
        }
        if (!oldDriver.getId().equals(driver.getId())) {
            validateDriverAvailable(driver);
            releaseDriver(oldDriver);
        }
        if (!oldVehicle.getId().equals(vehicle.getId())) {
            validateVehicleAvailable(vehicle);
            releaseVehicle(oldVehicle);
        }
        validateRoute(route);
        validateCapacity(order, vehicle);
        validateConflicts(id, order, driver, vehicle);

        delivery.setOrder(order);
        delivery.setDriver(driver);
        delivery.setVehicle(vehicle);
        delivery.setRoute(route);
        delivery.setOrigin(request.origin());
        delivery.setDestination(request.destination());
        delivery.setExpectedAt(request.expectedAt());
        delivery.setStatus(status);
        delivery.setProgress(progressFor(status, delivery.getProgress()));
        moveMarker(delivery);
        delivery.addTimeline(timeline("Entrega atualizada", "Dados operacionais revisados.", status));

        syncOrderStatus(order, delivery);
        if (!oldOrder.getId().equals(order.getId()) && oldOrder.getStatus() != OrderStatus.CANCELED) {
            oldOrder.setStatus(OrderStatus.PENDING);
        }
        syncResources(delivery);
        auditService.record("DELIVERY_UPDATED", "DELIVERY", delivery.getId(), "Recursos e previsão da entrega atualizados.");
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional
    public Dtos.DeliveryResponse changeStatus(Long id, Dtos.StatusUpdateRequest request) {
        var delivery = findForUpdate(id);
        if (delivery.getStatus() == request.status()) return DtoMapper.toDelivery(delivery);
        if (request.status() == DeliveryStatus.DELIVERED) {
            return markDelivered(id);
        }
        validateTransition(delivery.getStatus(), request.status());
        delivery.setStatus(request.status());
        delivery.setProgress(progressFor(request.status(), delivery.getProgress()));
        moveMarker(delivery);
        delivery.addTimeline(timeline("Status alterado", "Entrega marcada como " + request.status().getLabel() + ".", request.status()));
        syncOrderStatus(delivery.getOrder(), delivery);
        syncResources(delivery);
        auditService.record("DELIVERY_STATUS_CHANGED", "DELIVERY", delivery.getId(), "Status alterado para " + request.status().getLabel() + ".");
        notificationService.publish("DELIVERY_STATUS", "Entrega atualizada", delivery.getOrder().getOrderNumber()
                        + " agora está " + request.status().getLabel().toLowerCase() + ".", "DELIVERY", delivery.getId(),
                "/deliveries?details=" + delivery.getId(), "delivery-status-" + delivery.getId() + "-" + request.status());
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional
    public Dtos.DeliveryResponse markDelivered(Long id) {
        var delivery = findForUpdate(id);
        if (delivery.getStatus() == DeliveryStatus.DELIVERED) return DtoMapper.toDelivery(delivery);
        if (delivery.getStatus() == DeliveryStatus.CANCELED) {
            throw new BusinessException("Entrega cancelada não pode ser concluída.");
        }
        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setProgress(100);
        delivery.setDeliveredAt(LocalDateTime.now());
        moveMarker(delivery);
        delivery.addTimeline(timeline("Entrega concluída", "Cliente confirmou o recebimento.", DeliveryStatus.DELIVERED));
        delivery.getOrder().setStatus(OrderStatus.DELIVERED);
        var driver = delivery.getDriver();
        driver.setDeliveriesCompleted(driver.getDeliveriesCompleted() + 1);
        releaseDriver(driver);
        releaseVehicle(delivery.getVehicle());
        auditService.record("DELIVERY_COMPLETED", "DELIVERY", delivery.getId(), "Entrega concluída com sucesso.");
        notificationService.publish("DELIVERY_COMPLETED", "Entrega concluída", delivery.getOrder().getOrderNumber()
                        + " foi entregue com sucesso.", "DELIVERY", delivery.getId(),
                "/deliveries?details=" + delivery.getId(), "delivery-completed-" + delivery.getId());
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional
    public Dtos.DeliveryResponse cancel(Long id) {
        var delivery = findForUpdate(id);
        if (delivery.getStatus() == DeliveryStatus.CANCELED) return DtoMapper.toDelivery(delivery);
        if (delivery.getStatus() == DeliveryStatus.DELIVERED) {
            throw new BusinessException("Entrega concluída não pode ser cancelada.");
        }
        delivery.setStatus(DeliveryStatus.CANCELED);
        delivery.setProgress(progressFor(DeliveryStatus.CANCELED, delivery.getProgress()));
        delivery.addTimeline(timeline("Entrega cancelada", "Operação encerrada antes da conclusão.", DeliveryStatus.CANCELED));
        releaseDriver(delivery.getDriver());
        releaseVehicle(delivery.getVehicle());
        syncOrderStatus(delivery.getOrder(), delivery);
        auditService.record("DELIVERY_CANCELED", "DELIVERY", delivery.getId(), "Entrega cancelada.");
        notificationService.publish("DELIVERY_CANCELED", "Entrega cancelada", delivery.getOrder().getOrderNumber()
                        + " foi retirada da operação.", "DELIVERY", delivery.getId(),
                "/deliveries?details=" + delivery.getId(), "delivery-canceled-" + delivery.getId());
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional
    public Dtos.DeliveryResponse reschedule(Long id, Dtos.RescheduleRequest request) {
        var delivery = findForUpdate(id);
        ensureNotTerminal(delivery);
        delivery.setExpectedAt(request.expectedAt());
        delivery.addTimeline(timeline("Entrega reagendada", "Nova previsão registrada para a operação.", delivery.getStatus()));
        auditService.record("DELIVERY_RESCHEDULED", "DELIVERY", delivery.getId(), "Entrega reagendada.");
        notificationService.publish("DELIVERY_RESCHEDULED", "Entrega reagendada", delivery.getOrder().getOrderNumber()
                        + " recebeu uma nova previsão.", "DELIVERY", delivery.getId(),
                "/deliveries?details=" + delivery.getId(), "delivery-rescheduled-" + delivery.getId() + "-" + request.expectedAt());
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional
    public int markOverdueDeliveries() {
        var overdue = deliveryRepository.findByExpectedAtBeforeAndStatusIn(LocalDateTime.now(), ACTIVE_STATUSES);
        overdue.stream().filter(item -> item.getStatus() != DeliveryStatus.DELAYED).forEach(item -> {
            item.setStatus(DeliveryStatus.DELAYED);
            item.addTimeline(timeline("SLA excedido", "A entrega ultrapassou a previsão calculada.", DeliveryStatus.DELAYED));
            item.getOrder().setStatus(OrderStatus.DELAYED);
            notificationService.publish("SLA_DELAY", "Entrega atrasada", item.getOrder().getOrderNumber()
                            + " ultrapassou o SLA planejado.", "DELIVERY", item.getId(),
                    "/deliveries?details=" + item.getId(), "delivery-delay-" + item.getId());
        });
        return overdue.size();
    }

    @Transactional(readOnly = true)
    public Delivery findEntity(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega não encontrada."));
    }

    private Delivery findForUpdate(Long id) {
        return deliveryRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega não encontrada."));
    }

    private CustomerOrder findOrderForUpdate(Long id) {
        return orderRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido vinculado não encontrado."));
    }

    private Driver findDriverForUpdate(Long id) {
        return driverRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Motorista vinculado não encontrado."));
    }

    private Vehicle findVehicleForUpdate(Long id) {
        return vehicleRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo vinculado não encontrado."));
    }

    private RoutePlan findRouteForUpdate(Long id) {
        return routeRepository.findForUpdateById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rota vinculada não encontrada."));
    }

    private void validateOrderForDelivery(CustomerOrder order) {
        if (order.getStatus() == OrderStatus.CANCELED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("A entrega precisa estar vinculada a um pedido ativo.");
        }
        if (deliveryRepository.existsByOrderIdAndStatusIn(order.getId(), ACTIVE_STATUSES)) {
            throw new BusinessException("O pedido já possui uma entrega ativa.");
        }
    }

    private void validateDriverAvailable(Driver driver) {
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new BusinessException("Motorista indisponível não pode receber nova entrega.");
        }
    }

    private void validateVehicleAvailable(Vehicle vehicle) {
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new BusinessException("Veículo em manutenção não pode ser atribuído.");
        }
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BusinessException("Veículo indisponível não pode ser atribuído.");
        }
    }

    private void validateRoute(RoutePlan route) {
        if (route != null && route.getStatus() != RouteStatus.ACTIVE) {
            throw new BusinessException("Apenas rotas ativas podem ser atribuídas a uma entrega.");
        }
    }

    private void validateCapacity(CustomerOrder order, Vehicle vehicle) {
        if (order.getWeightKg() != null && vehicle.getCapacityKg() != null
                && order.getWeightKg().compareTo(vehicle.getCapacityKg()) > 0) {
            throw new BusinessException("O peso do pedido excede a capacidade do veículo selecionado.");
        }
    }

    private void validateConflicts(Long deliveryId, CustomerOrder order, Driver driver, Vehicle vehicle) {
        boolean orderConflict = deliveryId == null
                ? deliveryRepository.existsByOrderIdAndStatusIn(order.getId(), ACTIVE_STATUSES)
                : deliveryRepository.existsByOrderIdAndStatusInAndIdNot(order.getId(), ACTIVE_STATUSES, deliveryId);
        boolean driverConflict = deliveryId == null
                ? deliveryRepository.existsByDriverIdAndStatusIn(driver.getId(), ACTIVE_STATUSES)
                : deliveryRepository.existsByDriverIdAndStatusInAndIdNot(driver.getId(), ACTIVE_STATUSES, deliveryId);
        boolean vehicleConflict = deliveryId == null
                ? deliveryRepository.existsByVehicleIdAndStatusIn(vehicle.getId(), ACTIVE_STATUSES)
                : deliveryRepository.existsByVehicleIdAndStatusInAndIdNot(vehicle.getId(), ACTIVE_STATUSES, deliveryId);
        if (orderConflict) throw new BusinessException("O pedido já possui uma entrega ativa.");
        if (driverConflict) throw new BusinessException("O motorista já está alocado em outra entrega ativa.");
        if (vehicleConflict) throw new BusinessException("O veículo já está alocado em outra entrega ativa.");
    }

    private void syncResources(Delivery delivery) {
        if (ACTIVE_STATUSES.contains(delivery.getStatus())) {
            delivery.getDriver().setStatus(DriverStatus.ON_ROUTE);
            delivery.getDriver().setCurrentVehicle(delivery.getVehicle().getPlate());
            delivery.getVehicle().setStatus(VehicleStatus.ON_ROUTE);
            delivery.getVehicle().setLinkedDriver(delivery.getDriver());
        } else {
            releaseDriver(delivery.getDriver());
            releaseVehicle(delivery.getVehicle());
        }
    }

    private void syncOrderStatus(CustomerOrder order, Delivery delivery) {
        switch (delivery.getStatus()) {
            case COLLECTING -> order.setStatus(OrderStatus.COLLECTING);
            case ON_THE_WAY, IN_PROGRESS -> order.setStatus(OrderStatus.ON_THE_WAY);
            case DELAYED -> order.setStatus(OrderStatus.DELAYED);
            case DELIVERED -> order.setStatus(OrderStatus.DELIVERED);
            case CANCELED -> {
                if (order.getStatus() != OrderStatus.CANCELED) {
                    order.setStatus(OrderStatus.PENDING);
                }
            }
        }
    }

    private void releaseDriver(Driver driver) {
        driver.setStatus(DriverStatus.AVAILABLE);
        driver.setCurrentVehicle(null);
    }

    private void releaseVehicle(Vehicle vehicle) {
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setLinkedDriver(null);
    }

    private DeliveryTimeline timeline(String title, String description, DeliveryStatus status) {
        var item = new DeliveryTimeline();
        item.setTitle(title);
        item.setDescription(description);
        item.setStatus(status);
        item.setTimestamp(LocalDateTime.now());
        return item;
    }

    private Integer progressFor(DeliveryStatus status, Integer current) {
        return switch (status) {
            case IN_PROGRESS -> 10;
            case COLLECTING -> 25;
            case ON_THE_WAY -> 70;
            case DELIVERED -> 100;
            case DELAYED -> Math.max(10, Math.min(95, current == null ? 50 : current));
            case CANCELED -> Math.max(0, Math.min(99, current == null ? 0 : current));
        };
    }

    private void ensureNotTerminal(Delivery delivery) {
        if (delivery.getStatus() == DeliveryStatus.DELIVERED || delivery.getStatus() == DeliveryStatus.CANCELED) {
            throw new BusinessException("Entregas finalizadas não podem ser alteradas.");
        }
    }

    private void validateTransition(DeliveryStatus from, DeliveryStatus to) {
        if (to == null) throw new BusinessException("Informe o novo status da entrega.");
        if (from == DeliveryStatus.DELIVERED || from == DeliveryStatus.CANCELED) {
            throw new BusinessException("Entregas finalizadas não podem mudar de status.");
        }
        var allowed = switch (from) {
            case IN_PROGRESS -> EnumSet.of(DeliveryStatus.COLLECTING, DeliveryStatus.DELAYED, DeliveryStatus.CANCELED);
            case COLLECTING -> EnumSet.of(DeliveryStatus.ON_THE_WAY, DeliveryStatus.DELAYED, DeliveryStatus.CANCELED);
            case ON_THE_WAY -> EnumSet.of(DeliveryStatus.DELIVERED, DeliveryStatus.DELAYED, DeliveryStatus.CANCELED);
            case DELAYED -> EnumSet.of(DeliveryStatus.IN_PROGRESS, DeliveryStatus.COLLECTING, DeliveryStatus.ON_THE_WAY,
                    DeliveryStatus.DELIVERED, DeliveryStatus.CANCELED);
            case DELIVERED, CANCELED -> EnumSet.noneOf(DeliveryStatus.class);
        };
        if (!allowed.contains(to)) throw new BusinessException("Transição de status inválida para esta entrega.");
    }

    private void moveMarker(Delivery delivery) {
        var route = delivery.getRoute();
        if (route == null) {
            return;
        }
        var ratio = delivery.getProgress() / 100.0;
        delivery.setCurrentLat(route.getOriginLat() + ((route.getDestinationLat() - route.getOriginLat()) * ratio));
        delivery.setCurrentLng(route.getOriginLng() + ((route.getDestinationLng() - route.getOriginLng()) * ratio));
    }
}
