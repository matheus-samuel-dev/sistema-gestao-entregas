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

    public DeliveryService(
            DeliveryRepository deliveryRepository,
            OrderRepository orderRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            RouteRepository routeRepository
    ) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.routeRepository = routeRepository;
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
        var order = findOrder(request.orderId());
        var driver = findDriver(request.driverId());
        var vehicle = findVehicle(request.vehicleId());
        var route = request.routeId() == null ? null : findRoute(request.routeId());
        var status = request.status() == null ? DeliveryStatus.IN_PROGRESS : request.status();

        validateOrderForDelivery(order);
        validateDriverAvailable(driver);
        validateVehicleAvailable(vehicle);

        var delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setDriver(driver);
        delivery.setVehicle(vehicle);
        delivery.setRoute(route);
        delivery.setOrigin(request.origin());
        delivery.setDestination(request.destination());
        delivery.setExpectedAt(request.expectedAt());
        delivery.setStatus(status);
        delivery.setProgress(normalizeProgress(request.progress(), status));
        moveMarker(delivery);
        delivery.addTimeline(timeline("Entrega criada", "Pedido vinculado e recursos alocados.", status));

        syncOrderStatus(order, delivery);
        syncResources(delivery);

        return DtoMapper.toDelivery(deliveryRepository.save(delivery));
    }

    @Transactional
    public Dtos.DeliveryResponse update(Long id, Dtos.DeliveryRequest request) {
        var delivery = findEntity(id);
        var oldDriver = delivery.getDriver();
        var oldVehicle = delivery.getVehicle();
        var order = findOrder(request.orderId());
        var driver = findDriver(request.driverId());
        var vehicle = findVehicle(request.vehicleId());
        var route = request.routeId() == null ? null : findRoute(request.routeId());
        var status = request.status() == null ? delivery.getStatus() : request.status();

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

        delivery.setOrder(order);
        delivery.setDriver(driver);
        delivery.setVehicle(vehicle);
        delivery.setRoute(route);
        delivery.setOrigin(request.origin());
        delivery.setDestination(request.destination());
        delivery.setExpectedAt(request.expectedAt());
        delivery.setStatus(status);
        delivery.setProgress(normalizeProgress(request.progress(), status));
        moveMarker(delivery);
        delivery.addTimeline(timeline("Entrega atualizada", "Dados operacionais revisados.", status));

        syncOrderStatus(order, delivery);
        syncResources(delivery);
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional
    public Dtos.DeliveryResponse changeStatus(Long id, Dtos.StatusUpdateRequest request) {
        var delivery = findEntity(id);
        if (request.status() == DeliveryStatus.DELIVERED) {
            return markDelivered(id);
        }
        delivery.setStatus(request.status());
        delivery.setProgress(normalizeProgress(request.progress(), request.status()));
        moveMarker(delivery);
        delivery.addTimeline(timeline("Status alterado", "Entrega marcada como " + request.status().getLabel() + ".", request.status()));
        syncOrderStatus(delivery.getOrder(), delivery);
        syncResources(delivery);
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional
    public Dtos.DeliveryResponse markDelivered(Long id) {
        var delivery = findEntity(id);
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
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional
    public Dtos.DeliveryResponse cancel(Long id) {
        var delivery = findEntity(id);
        delivery.setStatus(DeliveryStatus.CANCELED);
        delivery.addTimeline(timeline("Entrega cancelada", "Operação encerrada antes da conclusão.", DeliveryStatus.CANCELED));
        releaseDriver(delivery.getDriver());
        releaseVehicle(delivery.getVehicle());
        return DtoMapper.toDelivery(delivery);
    }

    @Transactional(readOnly = true)
    public Delivery findEntity(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega não encontrada."));
    }

    private CustomerOrder findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido vinculado não encontrado."));
    }

    private Driver findDriver(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Motorista vinculado não encontrado."));
    }

    private Vehicle findVehicle(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo vinculado não encontrado."));
    }

    private RoutePlan findRoute(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rota vinculada não encontrada."));
    }

    private void validateOrderForDelivery(CustomerOrder order) {
        if (order.getStatus() == OrderStatus.CANCELED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("A entrega precisa estar vinculada a um pedido ativo.");
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
    }

    private DeliveryTimeline timeline(String title, String description, DeliveryStatus status) {
        var item = new DeliveryTimeline();
        item.setTitle(title);
        item.setDescription(description);
        item.setStatus(status);
        item.setTimestamp(LocalDateTime.now());
        return item;
    }

    private Integer normalizeProgress(Integer progress, DeliveryStatus status) {
        if (status == DeliveryStatus.DELIVERED) {
            return 100;
        }
        if (status == DeliveryStatus.CANCELED) {
            return progress == null ? 0 : Math.max(0, Math.min(100, progress));
        }
        return progress == null ? 10 : Math.max(0, Math.min(99, progress));
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
