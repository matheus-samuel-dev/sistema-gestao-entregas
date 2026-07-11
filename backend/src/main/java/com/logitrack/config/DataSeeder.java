package com.logitrack.config;

import com.logitrack.domain.CustomerOrder;
import com.logitrack.domain.Delivery;
import com.logitrack.domain.DeliveryTimeline;
import com.logitrack.domain.Driver;
import com.logitrack.domain.Incident;
import com.logitrack.domain.RoutePlan;
import com.logitrack.domain.UserAccount;
import com.logitrack.domain.Vehicle;
import com.logitrack.domain.enums.DeliveryStatus;
import com.logitrack.domain.enums.DriverStatus;
import com.logitrack.domain.enums.IncidentPriority;
import com.logitrack.domain.enums.IncidentStatus;
import com.logitrack.domain.enums.IncidentType;
import com.logitrack.domain.enums.OrderStatus;
import com.logitrack.domain.enums.RouteStatus;
import com.logitrack.domain.enums.UserRole;
import com.logitrack.domain.enums.VehicleStatus;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.DriverRepository;
import com.logitrack.repository.IncidentRepository;
import com.logitrack.repository.OrderRepository;
import com.logitrack.repository.RouteRepository;
import com.logitrack.repository.UserRepository;
import com.logitrack.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    @Transactional
    CommandLineRunner seedData(
            UserRepository userRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            OrderRepository orderRepository,
            RouteRepository routeRepository,
            DeliveryRepository deliveryRepository,
            IncidentRepository incidentRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (!userRepository.existsByEmail("admin@logitrack.com")) {
                var admin = new UserAccount();
                admin.setName("João Silva");
                admin.setEmail("admin@logitrack.com");
                admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);
            }

            if (orderRepository.findByOrderNumber("#10451").isPresent()) {
                return;
            }

            var today = LocalDate.now();
            var now = LocalDateTime.now();

            var drivers = driverRepository.saveAll(List.of(
                    driver("Carlos Pereira", "(11) 98811-2345", "CNH-438921", DriverStatus.ON_ROUTE, "FRT-2A31", 168, "98.4"),
                    driver("Mariana Costa", "(11) 97722-3456", "CNH-774120", DriverStatus.ON_ROUTE, "VAN-7B52", 142, "97.8"),
                    driver("Roberto Lima", "(11) 96633-4567", "CNH-661204", DriverStatus.ON_ROUTE, "TRK-9C10", 195, "96.9"),
                    driver("Juliana Martins", "(11) 95544-5678", "CNH-881230", DriverStatus.ON_ROUTE, "UTIL-4D88", 121, "99.1"),
                    driver("Fernando Souza", "(11) 94455-6789", "CNH-904411", DriverStatus.ON_ROUTE, "SPR-5E76", 188, "98.7")
            ));

            var vehicles = vehicleRepository.saveAll(List.of(
                    vehicle("FRT-2A31", "Mercedes-Benz Sprinter", "1400.00", VehicleStatus.ON_ROUTE, drivers.get(0)),
                    vehicle("VAN-7B52", "Renault Master", "1300.00", VehicleStatus.ON_ROUTE, drivers.get(1)),
                    vehicle("TRK-9C10", "Volkswagen Delivery 6.160", "3200.00", VehicleStatus.ON_ROUTE, drivers.get(2)),
                    vehicle("UTIL-4D88", "Fiat Fiorino", "650.00", VehicleStatus.ON_ROUTE, drivers.get(3)),
                    vehicle("SPR-5E76", "Iveco Daily", "1800.00", VehicleStatus.ON_ROUTE, drivers.get(4))
            ));

            var orders = orderRepository.saveAll(List.of(
                    order("#10451", "Mercado Nova Safra", "(11) 3001-1001", "Rua Clodomiro Amazonas, 98", "São Paulo", "SP", "1450.90", OrderStatus.DELIVERED, today.atTime(8, 20), today.atTime(11, 40)),
                    order("#10452", "Clube Bela Vista", "(11) 3001-1002", "Rua Treze de Maio, 540", "São Paulo", "SP", "890.20", OrderStatus.DELAYED, today.atTime(8, 35), today.atTime(13, 10)),
                    order("#10453", "Condomínio Atlas", "(11) 3001-1003", "Alameda Santos, 1100", "São Paulo", "SP", "2320.00", OrderStatus.DELIVERED, today.atTime(8, 45), today.atTime(12, 20)),
                    order("#10454", "Farmácia Horizonte", "(11) 3001-1004", "Rua Vergueiro, 2020", "São Paulo", "SP", "560.75", OrderStatus.PICKING, today.atTime(9, 0), today.atTime(15, 20)),
                    order("#10455", "Padaria Central", "(11) 3001-1005", "Rua Augusta, 450", "São Paulo", "SP", "410.00", OrderStatus.PENDING, today.atTime(9, 10), today.atTime(16, 15)),
                    order("#10456", "TechNova Solutions", "(11) 3001-1006", "Av. Paulista, 1000", "São Paulo", "SP", "3180.50", OrderStatus.ON_THE_WAY, today.atTime(9, 25), today.atTime(14, 30)),
                    order("#10457", "Grupo Aurora", "(11) 3001-1007", "Rua Augusta, 500", "São Paulo", "SP", "1275.30", OrderStatus.COLLECTING, today.atTime(9, 30), today.atTime(15, 0)),
                    order("#10458", "Clínica Vida+", "(11) 3001-1008", "Av. Brigadeiro Luís Antônio, 1500", "São Paulo", "SP", "760.80", OrderStatus.ON_THE_WAY, today.atTime(9, 40), today.atTime(15, 30)),
                    order("#10459", "Studio Prime", "(11) 3001-1009", "Rua Oscar Freire, 200", "São Paulo", "SP", "985.00", OrderStatus.ON_THE_WAY, today.atTime(9, 45), today.atTime(16, 0)),
                    order("#10460", "Oliveira Contabilidade", "(11) 3001-1010", "Rua XV de Novembro, 300", "São Paulo", "SP", "640.10", OrderStatus.COLLECTING, today.atTime(9, 55), today.atTime(16, 30)),
                    order("#10461", "TechNova Solutions", "(11) 3001-1011", "Av. Paulista, 1200", "São Paulo", "SP", "1500.00", OrderStatus.ON_THE_WAY, today.atTime(10, 10), today.atTime(14, 30)),
                    order("#10462", "Grupo Aurora", "(11) 3001-1012", "Rua Augusta, 560", "São Paulo", "SP", "2120.45", OrderStatus.COLLECTING, today.atTime(10, 15), today.atTime(15, 0)),
                    order("#10463", "Clínica Vida+", "(11) 3001-1013", "Av. Brigadeiro, 1500", "São Paulo", "SP", "880.00", OrderStatus.ON_THE_WAY, today.atTime(10, 20), today.atTime(15, 30)),
                    order("#10464", "Studio Prime", "(11) 3001-1014", "Rua Oscar Freire, 220", "São Paulo", "SP", "1180.90", OrderStatus.ON_THE_WAY, today.atTime(10, 25), today.atTime(16, 0)),
                    order("#10465", "Oliveira Contabilidade", "(11) 3001-1015", "Rua XV de Novembro, 330", "São Paulo", "SP", "720.35", OrderStatus.COLLECTING, today.atTime(10, 30), today.atTime(16, 30))
            ));

            var routes = routeRepository.saveAll(List.of(
                    route("Rota 01 - Zona Sul", "CD LogiTrack - Vila Leopoldina", "Av. Paulista - Bela Vista", "18.4", 46, RouteStatus.ACTIVE, -23.5290, -46.7370, -23.5617, -46.6559, "#10b981"),
                    route("Rota 02 - Centro", "CD LogiTrack - Vila Leopoldina", "Se - Centro", "14.2", 38, RouteStatus.ACTIVE, -23.5290, -46.7370, -23.5505, -46.6333, "#2563eb"),
                    route("Rota 03 - Zona Leste", "CD LogiTrack - Vila Leopoldina", "Tatuape - Zona Leste", "28.7", 68, RouteStatus.ACTIVE, -23.5290, -46.7370, -23.5400, -46.5760, "#f59e0b"),
                    route("Rota 04 - Zona Oeste", "CD LogiTrack - Vila Leopoldina", "Pinheiros - Zona Oeste", "9.6", 24, RouteStatus.ACTIVE, -23.5290, -46.7370, -23.5614, -46.7016, "#8b5cf6"),
                    route("Rota 05 - ABC", "CD LogiTrack - Vila Leopoldina", "Santo Andre - ABC", "34.5", 72, RouteStatus.ACTIVE, -23.5290, -46.7370, -23.6639, -46.5383, "#ef4444")
            ));

            var deliveries = deliveryRepository.saveAll(List.of(
                    delivery(orders.get(0), drivers.get(0), vehicles.get(0), routes.get(0), DeliveryStatus.DELIVERED, 100, today.atTime(11, 40), today.atTime(11, 30), "Av. Paulista, 1000 - SP", now.minusHours(6)),
                    delivery(orders.get(1), drivers.get(1), vehicles.get(1), routes.get(1), DeliveryStatus.DELAYED, 82, today.atTime(13, 10), null, "Rua Treze de Maio, 540 - SP", now.minusHours(5)),
                    delivery(orders.get(2), drivers.get(2), vehicles.get(2), routes.get(2), DeliveryStatus.DELIVERED, 100, today.atTime(12, 20), today.atTime(12, 5), "Alameda Santos, 1100 - SP", now.minusHours(5)),
                    delivery(orders.get(5), drivers.get(0), vehicles.get(0), routes.get(0), DeliveryStatus.ON_THE_WAY, 65, today.atTime(14, 30), null, "Av. Paulista, 1000 - SP", now.minusHours(3)),
                    delivery(orders.get(6), drivers.get(1), vehicles.get(1), routes.get(1), DeliveryStatus.COLLECTING, 30, today.atTime(15, 0), null, "Rua Augusta, 500 - SP", now.minusHours(2)),
                    delivery(orders.get(7), drivers.get(2), vehicles.get(2), routes.get(2), DeliveryStatus.IN_PROGRESS, 80, today.atTime(15, 30), null, "Av. Brigadeiro Luis Antonio, 1500 - SP", now.minusHours(2)),
                    delivery(orders.get(8), drivers.get(3), vehicles.get(3), routes.get(3), DeliveryStatus.ON_THE_WAY, 45, today.atTime(16, 0), null, "Rua Oscar Freire, 200 - SP", now.minusHours(1)),
                    delivery(orders.get(9), drivers.get(4), vehicles.get(4), routes.get(4), DeliveryStatus.COLLECTING, 20, today.atTime(16, 30), null, "Rua XV de Novembro, 300 - SP", now.minusMinutes(50)),
                    delivery(orders.get(10), drivers.get(0), vehicles.get(0), routes.get(0), DeliveryStatus.ON_THE_WAY, 65, today.atTime(14, 30), null, "Av. Paulista, 1200 - SP", now.minusMinutes(45)),
                    delivery(orders.get(11), drivers.get(1), vehicles.get(1), routes.get(1), DeliveryStatus.COLLECTING, 30, today.atTime(15, 0), null, "Rua Augusta, 560 - SP", now.minusMinutes(35))
            ));

            incidentRepository.saveAll(List.of(
                    incident(deliveries.get(1), IncidentType.DELIVERY_DELAY, IncidentPriority.HIGH, IncidentStatus.OPEN, "Operacoes", "Entrega impactada por congestionamento na regiao central.", null, now.minusMinutes(15)),
                    incident(deliveries.get(4), IncidentType.CUSTOMER_NOT_FOUND, IncidentPriority.MEDIUM, IncidentStatus.OPEN, "Central de Atendimento", "Motorista não localizou o responsável no endereço.", null, now.minusHours(1)),
                    incident(deliveries.get(5), IncidentType.WRONG_ADDRESS, IncidentPriority.MEDIUM, IncidentStatus.IN_REVIEW, "Suporte Logistico", "Numero informado diverge da fachada do cliente.", null, now.minusHours(2)),
                    incident(deliveries.get(0), IncidentType.PROBLEM_SOLVED, IncidentPriority.LOW, IncidentStatus.RESOLVED, "Operacoes", "Contato confirmado e entrega finalizada.", "Cliente recebeu a mercadoria.", now.minusHours(3)),
                    incident(deliveries.get(6), IncidentType.VEHICLE_PROBLEM, IncidentPriority.HIGH, IncidentStatus.IN_REVIEW, "Frota", "Alerta preventivo de temperatura do motor.", null, now.minusHours(4)),
                    incident(deliveries.get(7), IncidentType.DAMAGED_PRODUCT, IncidentPriority.CRITICAL, IncidentStatus.OPEN, "Qualidade", "Volume sinalizado para conferencia na chegada.", null, now.minusHours(5)),
                    incident(deliveries.get(2), IncidentType.PROBLEM_SOLVED, IncidentPriority.LOW, IncidentStatus.RESOLVED, "Operacoes", "Divergencia de nota fiscal resolvida.", "Documento reemitido.", now.minusHours(6)),
                    incident(deliveries.get(8), IncidentType.DELIVERY_DELAY, IncidentPriority.MEDIUM, IncidentStatus.OPEN, "Monitoramento", "Chuva forte reduziu velocidade media da rota.", null, now.minusMinutes(40))
            ));
        };
    }

    private Driver driver(String name, String phone, String license, DriverStatus status, String vehicle, int completed, String successRate) {
        var driver = new Driver();
        driver.setName(name);
        driver.setPhone(phone);
        driver.setLicenseNumber(license);
        driver.setStatus(status);
        driver.setCurrentVehicle(vehicle);
        driver.setDeliveriesCompleted(completed);
        driver.setSuccessRate(new BigDecimal(successRate));
        return driver;
    }

    private Vehicle vehicle(String plate, String model, String capacity, VehicleStatus status, Driver driver) {
        var vehicle = new Vehicle();
        vehicle.setPlate(plate);
        vehicle.setModel(model);
        vehicle.setCapacityKg(new BigDecimal(capacity));
        vehicle.setStatus(status);
        vehicle.setLinkedDriver(driver);
        return vehicle;
    }

    private CustomerOrder order(
            String number,
            String customer,
            String phone,
            String address,
            String city,
            String state,
            String value,
            OrderStatus status,
            LocalDateTime createdAt,
            LocalDateTime expectedAt
    ) {
        var order = new CustomerOrder();
        order.setOrderNumber(number);
        order.setCustomerName(customer);
        order.setPhone(phone);
        order.setAddress(address);
        order.setCity(city);
        order.setState(state);
        order.setValue(new BigDecimal(value));
        order.setStatus(status);
        order.setCreatedAt(createdAt);
        order.setExpectedDeliveryAt(expectedAt);
        return order;
    }

    private RoutePlan route(
            String name,
            String origin,
            String destination,
            String distance,
            int minutes,
            RouteStatus status,
            double originLat,
            double originLng,
            double destinationLat,
            double destinationLng,
            String color
    ) {
        var route = new RoutePlan();
        route.setName(name);
        route.setOrigin(origin);
        route.setDestination(destination);
        route.setEstimatedDistanceKm(new BigDecimal(distance));
        route.setEstimatedTimeMinutes(minutes);
        route.setStatus(status);
        route.setOriginLat(originLat);
        route.setOriginLng(originLng);
        route.setDestinationLat(destinationLat);
        route.setDestinationLng(destinationLng);
        route.setColor(color);
        return route;
    }

    private Delivery delivery(
            CustomerOrder order,
            Driver driver,
            Vehicle vehicle,
            RoutePlan route,
            DeliveryStatus status,
            int progress,
            LocalDateTime expectedAt,
            LocalDateTime deliveredAt,
            String destination,
            LocalDateTime createdAt
    ) {
        var delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setDriver(driver);
        delivery.setVehicle(vehicle);
        delivery.setRoute(route);
        delivery.setOrigin(route.getOrigin());
        delivery.setDestination(destination);
        delivery.setExpectedAt(expectedAt);
        delivery.setDeliveredAt(deliveredAt);
        delivery.setStatus(status);
        delivery.setProgress(progress);
        delivery.setCreatedAt(createdAt);
        var ratio = progress / 100.0;
        delivery.setCurrentLat(route.getOriginLat() + ((route.getDestinationLat() - route.getOriginLat()) * ratio));
        delivery.setCurrentLng(route.getOriginLng() + ((route.getDestinationLng() - route.getOriginLng()) * ratio));
        delivery.addTimeline(timeline("Pedido recebido", "Pedido entrou na fila operacional.", DeliveryStatus.IN_PROGRESS, createdAt.minusMinutes(20)));
        delivery.addTimeline(timeline("Rota definida", "Motorista e veiculo vinculados a rota.", DeliveryStatus.COLLECTING, createdAt.minusMinutes(5)));
        delivery.addTimeline(timeline(status.getLabel(), "Atualizacao operacional registrada.", status, createdAt.plusMinutes(15)));
        return delivery;
    }

    private DeliveryTimeline timeline(String title, String description, DeliveryStatus status, LocalDateTime timestamp) {
        var timeline = new DeliveryTimeline();
        timeline.setTitle(title);
        timeline.setDescription(description);
        timeline.setStatus(status);
        timeline.setTimestamp(timestamp);
        return timeline;
    }

    private Incident incident(
            Delivery delivery,
            IncidentType type,
            IncidentPriority priority,
            IncidentStatus status,
            String responsible,
            String description,
            String resolution,
            LocalDateTime createdAt
    ) {
        var incident = new Incident();
        incident.setDelivery(delivery);
        incident.setOrder(delivery.getOrder());
        incident.setType(type);
        incident.setPriority(priority);
        incident.setStatus(status);
        incident.setResponsible(responsible);
        incident.setDescription(description);
        incident.setResolution(resolution);
        incident.setCreatedAt(createdAt);
        incident.setUpdatedAt(createdAt);
        return incident;
    }
}
