package com.logitrack;

import com.logitrack.domain.CustomerOrder;
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
import com.logitrack.repository.DriverRepository;
import com.logitrack.repository.OrderRepository;
import com.logitrack.repository.RouteRepository;
import com.logitrack.repository.VehicleRepository;
import com.logitrack.service.DeliveryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DeliveryServiceTest {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Test
    void rejectsUnavailableDriver() {
        var fixture = fixture(DriverStatus.UNAVAILABLE, VehicleStatus.AVAILABLE);

        assertThatThrownBy(() -> deliveryService.create(request(fixture)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Motorista indisponivel");
    }

    @Test
    void rejectsVehicleInMaintenance() {
        var fixture = fixture(DriverStatus.AVAILABLE, VehicleStatus.MAINTENANCE);

        assertThatThrownBy(() -> deliveryService.create(request(fixture)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("manutencao");
    }

    @Test
    void createsDeliveryAndMarksAsDelivered() {
        var fixture = fixture(DriverStatus.AVAILABLE, VehicleStatus.AVAILABLE);

        var created = deliveryService.create(request(fixture));
        assertThat(created.status()).isEqualTo(DeliveryStatus.IN_PROGRESS);
        assertThat(created.progress()).isEqualTo(25);

        var delivered = deliveryService.markDelivered(created.id());

        assertThat(delivered.status()).isEqualTo(DeliveryStatus.DELIVERED);
        assertThat(delivered.progress()).isEqualTo(100);
        assertThat(driverRepository.findById(fixture.driver().getId()).orElseThrow().getStatus()).isEqualTo(DriverStatus.AVAILABLE);
        assertThat(vehicleRepository.findById(fixture.vehicle().getId()).orElseThrow().getStatus()).isEqualTo(VehicleStatus.AVAILABLE);
    }

    private Dtos.DeliveryRequest request(Fixture fixture) {
        return new Dtos.DeliveryRequest(
                fixture.order().getId(),
                fixture.driver().getId(),
                fixture.vehicle().getId(),
                fixture.route().getId(),
                fixture.route().getOrigin(),
                fixture.route().getDestination(),
                LocalDateTime.now().plusHours(3),
                DeliveryStatus.IN_PROGRESS,
                25
        );
    }

    private Fixture fixture(DriverStatus driverStatus, VehicleStatus vehicleStatus) {
        var suffix = UUID.randomUUID().toString().substring(0, 8);
        var order = new CustomerOrder();
        order.setOrderNumber("#D-" + suffix);
        order.setCustomerName("Cliente Entrega");
        order.setPhone("(11) 98888-0000");
        order.setAddress("Rua Entrega, 200");
        order.setCity("Sao Paulo");
        order.setState("SP");
        order.setValue(BigDecimal.valueOf(240));
        order.setStatus(OrderStatus.PENDING);
        order.setExpectedDeliveryAt(LocalDateTime.now().plusHours(3));

        var driver = new Driver();
        driver.setName("Motorista " + suffix);
        driver.setPhone("(11) 97777-0000");
        driver.setLicenseNumber("CNH-T-" + suffix);
        driver.setStatus(driverStatus);
        driver.setDeliveriesCompleted(0);
        driver.setSuccessRate(BigDecimal.valueOf(98));

        var vehicle = new Vehicle();
        vehicle.setPlate("TST" + suffix.substring(0, 4).toUpperCase());
        vehicle.setModel("Van Teste");
        vehicle.setCapacityKg(BigDecimal.valueOf(900));
        vehicle.setStatus(vehicleStatus);

        var route = new RoutePlan();
        route.setName("Rota Teste " + suffix);
        route.setOrigin("CD Teste");
        route.setDestination("Destino Teste");
        route.setEstimatedDistanceKm(BigDecimal.valueOf(12));
        route.setEstimatedTimeMinutes(30);
        route.setStatus(RouteStatus.ACTIVE);
        route.setOriginLat(-23.529);
        route.setOriginLng(-46.737);
        route.setDestinationLat(-23.55);
        route.setDestinationLng(-46.63);
        route.setColor("#10b981");

        return new Fixture(
                orderRepository.save(order),
                driverRepository.save(driver),
                vehicleRepository.save(vehicle),
                routeRepository.save(route)
        );
    }

    private record Fixture(CustomerOrder order, Driver driver, Vehicle vehicle, RoutePlan route) {
    }
}
