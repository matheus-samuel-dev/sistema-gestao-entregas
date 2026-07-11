package com.logitrack.service;

import com.logitrack.domain.Delivery;
import com.logitrack.domain.Incident;
import com.logitrack.domain.enums.DeliveryStatus;
import com.logitrack.domain.enums.DriverStatus;
import com.logitrack.domain.enums.IncidentStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.DriverRepository;
import com.logitrack.repository.IncidentRepository;
import com.logitrack.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class DashboardService {

    private static final Map<DeliveryStatus, String> DELIVERY_COLORS = Map.of(
            DeliveryStatus.IN_PROGRESS, "#10b981",
            DeliveryStatus.ON_THE_WAY, "#2563eb",
            DeliveryStatus.COLLECTING, "#f59e0b",
            DeliveryStatus.DELIVERED, "#8b5cf6",
            DeliveryStatus.DELAYED, "#ef4444",
            DeliveryStatus.CANCELED, "#64748b"
    );

    private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;
    private final IncidentRepository incidentRepository;
    private final DriverRepository driverRepository;

    public DashboardService(
            OrderRepository orderRepository,
            DeliveryRepository deliveryRepository,
            IncidentRepository incidentRepository,
            DriverRepository driverRepository
    ) {
        this.orderRepository = orderRepository;
        this.deliveryRepository = deliveryRepository;
        this.incidentRepository = incidentRepository;
        this.driverRepository = driverRepository;
    }

    @Transactional(readOnly = true)
    public Dtos.DashboardResponse dashboard() {
        var today = LocalDate.now();
        var start = today.atStartOfDay();
        var end = start.plusDays(1);
        var deliveries = deliveryRepository.findAll();
        var incidents = incidentRepository.findAll();
        var orders = orderRepository.findAll();
        var drivers = driverRepository.findAll();
        var activeStatuses = EnumSet.of(DeliveryStatus.IN_PROGRESS, DeliveryStatus.COLLECTING, DeliveryStatus.ON_THE_WAY, DeliveryStatus.DELAYED);
        var totalDeliveries = Math.max(deliveries.size(), 1);
        var delivered = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.DELIVERED).count();
        var delayed = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.DELAYED).count();
        var activeDrivers = drivers.stream()
                .filter(driver -> driver.getStatus() == DriverStatus.ON_ROUTE || driver.getStatus() == DriverStatus.AVAILABLE)
                .count();
        var successRate = (delivered * 100.0) / totalDeliveries;
        var monthRevenue = orders.stream()
                .filter(order -> order.getCreatedAt().getYear() == today.getYear())
                .filter(order -> order.getCreatedAt().getMonth() == today.getMonth())
                .map(order -> order.getValue() == null ? BigDecimal.ZERO : order.getValue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        var averageMinutes = deliveries.stream()
                .filter(delivery -> delivery.getDeliveredAt() != null)
                .mapToLong(delivery -> Duration.between(delivery.getCreatedAt(), delivery.getDeliveredAt()).toMinutes())
                .filter(minutes -> minutes > 0)
                .average()
                .orElse(0);

        var metrics = List.of(
                new Dtos.MetricCard("activeDeliveries", "Entregas em andamento", String.valueOf(deliveryRepository.countByStatusIn(activeStatuses)), "monitoradas agora", "up"),
                new Dtos.MetricCard("delayedDeliveries", "Entregas atrasadas", String.valueOf(delayed), "requer ação", "down"),
                new Dtos.MetricCard("completedDeliveries", "Entregas concluídas", String.valueOf(delivered), "finalizadas hoje", "up"),
                new Dtos.MetricCard("successRate", "Taxa de sucesso", String.format(Locale.forLanguageTag("pt-BR"), "%.1f%%", successRate), "base total", "up"),
                new Dtos.MetricCard("averageDeliveryTime", "Tempo médio", formatDuration(Math.round(averageMinutes)), "entregas concluídas", "up"),
                new Dtos.MetricCard("monthRevenue", "Receita do mês", formatCurrency(monthRevenue), "pedidos faturados", "up"),
                new Dtos.MetricCard("activeDrivers", "Motoristas ativos", String.valueOf(activeDrivers), "disponíveis ou em rota", "up"),
                new Dtos.MetricCard("ordersToday", "Pedidos hoje", String.valueOf(orderRepository.countByCreatedAtBetween(start, end)), "entrada operacional", "up")
        );

        return new Dtos.DashboardResponse(
                metrics,
                deliveriesByStatus(deliveries),
                dayPerformance(deliveries, start),
                deliveriesByPeriod(start),
                incidentsByType(incidents),
                realtimeDeliveries(deliveries, activeStatuses),
                upcomingDeliveries(deliveries),
                recentIncidents(incidents),
                activeDeliveryRows(deliveries, activeStatuses)
        );
    }

    private List<Dtos.ChartSlice> deliveriesByStatus(List<Delivery> deliveries) {
        var grouped = deliveries.stream().collect(Collectors.groupingBy(Delivery::getStatus, Collectors.counting()));
        return DELIVERY_COLORS.keySet()
                .stream()
                .map(status -> new Dtos.ChartSlice(status.getLabel(), grouped.getOrDefault(status, 0L), DELIVERY_COLORS.get(status)))
                .filter(slice -> slice.value() > 0)
                .toList();
    }

    private List<Dtos.PerformancePoint> dayPerformance(List<Delivery> deliveries, LocalDateTime start) {
        return IntStream.range(0, 6)
                .mapToObj(index -> {
                    var bucketStart = start.plusHours(index * 4L);
                    var bucketEnd = bucketStart.plusHours(4);
                    var count = deliveries.stream()
                            .filter(delivery -> !delivery.getExpectedAt().isBefore(bucketStart))
                            .filter(delivery -> delivery.getExpectedAt().isBefore(bucketEnd))
                            .count();
                    return new Dtos.PerformancePoint(bucketStart.format(DateTimeFormatter.ofPattern("HH'h'")), count);
                })
                .toList();
    }

    private List<Dtos.PerformancePoint> deliveriesByPeriod(LocalDateTime start) {
        return IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> start.minusDays(6L - offset))
                .map(day -> new Dtos.PerformancePoint(
                        day.format(DateTimeFormatter.ofPattern("dd/MM")),
                        deliveryRepository.countByExpectedAtBetween(day, day.plusDays(1))
                ))
                .toList();
    }

    private List<Dtos.ChartSlice> incidentsByType(List<Incident> incidents) {
        var colors = List.of("#ef4444", "#f59e0b", "#2563eb", "#8b5cf6", "#14b8a6", "#10b981");
        var grouped = incidents.stream().collect(Collectors.groupingBy(i -> i.getType().getLabel(), Collectors.counting()));
        var index = new int[]{0};
        return grouped.entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> new Dtos.ChartSlice(entry.getKey(), entry.getValue(), colors.get(index[0]++ % colors.size())))
                .toList();
    }

    private List<Dtos.MapDelivery> realtimeDeliveries(List<Delivery> deliveries, EnumSet<DeliveryStatus> activeStatuses) {
        return deliveries.stream()
                .filter(delivery -> activeStatuses.contains(delivery.getStatus()))
                .sorted(Comparator.comparing(Delivery::getExpectedAt))
                .map(delivery -> {
                    var route = delivery.getRoute();
                    return new Dtos.MapDelivery(
                            delivery.getId(),
                            delivery.getOrder().getOrderNumber(),
                            delivery.getOrder().getCustomerName(),
                            delivery.getDriver().getName(),
                            delivery.getStatus(),
                            delivery.getStatus().getLabel(),
                            delivery.getProgress(),
                            delivery.getCurrentLat(),
                            delivery.getCurrentLng(),
                            route == null ? delivery.getCurrentLat() : route.getOriginLat(),
                            route == null ? delivery.getCurrentLng() : route.getOriginLng(),
                            route == null ? delivery.getCurrentLat() : route.getDestinationLat(),
                            route == null ? delivery.getCurrentLng() : route.getDestinationLng(),
                            route == null ? DELIVERY_COLORS.get(delivery.getStatus()) : route.getColor()
                    );
                })
                .toList();
    }

    private List<Dtos.UpcomingDelivery> upcomingDeliveries(List<Delivery> deliveries) {
        return deliveries.stream()
                .filter(delivery -> delivery.getStatus() != DeliveryStatus.CANCELED && delivery.getStatus() != DeliveryStatus.DELIVERED)
                .sorted(Comparator.comparing(Delivery::getExpectedAt))
                .limit(5)
                .map(delivery -> new Dtos.UpcomingDelivery(
                        delivery.getExpectedAt().format(DateTimeFormatter.ofPattern("HH:mm")),
                        delivery.getOrder().getOrderNumber(),
                        delivery.getOrder().getCustomerName(),
                        delivery.getDestination(),
                        delivery.getStatus(),
                        delivery.getStatus().getLabel()
                ))
                .toList();
    }

    private List<Dtos.RecentIncident> recentIncidents(List<Incident> incidents) {
        return incidents.stream()
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .limit(5)
                .map(incident -> new Dtos.RecentIncident(
                        incident.getId(),
                        incident.getType().getLabel(),
                        incident.getOrder() == null ? "-" : incident.getOrder().getOrderNumber(),
                        timeAgo(incident.getCreatedAt()),
                        incident.getStatus(),
                        incident.getStatus().getLabel(),
                        incident.getPriority()
                ))
                .toList();
    }

    private List<Dtos.ActiveDeliveryRow> activeDeliveryRows(List<Delivery> deliveries, EnumSet<DeliveryStatus> activeStatuses) {
        return deliveries.stream()
                .filter(delivery -> activeStatuses.contains(delivery.getStatus()))
                .sorted(Comparator.comparing(Delivery::getExpectedAt))
                .limit(8)
                .map(delivery -> new Dtos.ActiveDeliveryRow(
                        delivery.getId(),
                        delivery.getOrder().getOrderNumber(),
                        delivery.getOrder().getCustomerName(),
                        delivery.getDriver().getName(),
                        delivery.getRoute() == null ? "Sem rota" : delivery.getRoute().getName(),
                        delivery.getStatus(),
                        delivery.getStatus().getLabel(),
                        delivery.getProgress(),
                        delivery.getExpectedAt().format(DateTimeFormatter.ofPattern("HH:mm"))
                ))
                .toList();
    }

    private String timeAgo(LocalDateTime createdAt) {
        var duration = Duration.between(createdAt, LocalDateTime.now());
        if (duration.toMinutes() < 60) {
            return "há " + Math.max(1, duration.toMinutes()) + " min";
        }
        if (duration.toHours() < 24) {
            return "há " + duration.toHours() + " h";
        }
        return "há " + duration.toDays() + " d";
    }

    private String formatCurrency(BigDecimal value) {
        return NumberFormat.getCurrencyInstance(new Locale("pt", "BR")).format(value);
    }

    private String formatDuration(long minutes) {
        if (minutes <= 0) {
            return "0min";
        }
        var hours = minutes / 60;
        var rest = minutes % 60;
        if (hours == 0) {
            return rest + "min";
        }
        return rest == 0 ? hours + "h" : hours + "h " + rest + "min";
    }
}
