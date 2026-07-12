package com.logitrack.dto;

import com.logitrack.domain.enums.DeliveryStatus;
import com.logitrack.domain.enums.DriverStatus;
import com.logitrack.domain.enums.IncidentPriority;
import com.logitrack.domain.enums.IncidentStatus;
import com.logitrack.domain.enums.IncidentType;
import com.logitrack.domain.enums.OrderStatus;
import com.logitrack.domain.enums.RouteStatus;
import com.logitrack.domain.enums.UserRole;
import com.logitrack.domain.enums.VehicleStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class Dtos {
    private Dtos() {
    }

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {
    }

    public record UserResponse(
            Long id,
            String name,
            String email,
            UserRole role
    ) {
    }

    public record AuthResponse(
            String token,
            UserResponse user
    ) {
    }

    public record OrderRequest(
            String orderNumber,
            @NotBlank String customerName,
            @NotBlank String phone,
            @NotBlank String address,
            @NotBlank String city,
            @NotBlank @Size(min = 2, max = 2) String state,
            @NotNull @DecimalMin("0.01") BigDecimal value,
            OrderStatus status,
            @NotNull LocalDateTime expectedDeliveryAt,
            @DecimalMin("0.0") BigDecimal weightKg
    ) {
        public OrderRequest(
                String orderNumber,
                String customerName,
                String phone,
                String address,
                String city,
                String state,
                BigDecimal value,
                OrderStatus status,
                LocalDateTime expectedDeliveryAt
        ) {
            this(orderNumber, customerName, phone, address, city, state, value, status, expectedDeliveryAt, null);
        }
    }

    public record OrderResponse(
            Long id,
            String orderNumber,
            String customerName,
            String phone,
            String address,
            String city,
            String state,
            BigDecimal value,
            OrderStatus status,
            String statusLabel,
            LocalDateTime createdAt,
            LocalDateTime expectedDeliveryAt,
            String trackingCode,
            BigDecimal weightKg
    ) {
    }

    public record DriverRequest(
            @NotBlank String name,
            @NotBlank String phone,
            @NotBlank String licenseNumber,
            DriverStatus status,
            String currentVehicle,
            @Min(0) Integer deliveriesCompleted,
            @DecimalMin("0.0") BigDecimal successRate
    ) {
    }

    public record DriverResponse(
            Long id,
            String name,
            String phone,
            String licenseNumber,
            DriverStatus status,
            String statusLabel,
            String currentVehicle,
            Integer deliveriesCompleted,
            BigDecimal successRate
    ) {
    }

    public record VehicleRequest(
            @NotBlank String plate,
            @NotBlank String model,
            @NotNull @DecimalMin("1") BigDecimal capacityKg,
            VehicleStatus status,
            Long linkedDriverId
    ) {
    }

    public record VehicleResponse(
            Long id,
            String plate,
            String model,
            BigDecimal capacityKg,
            VehicleStatus status,
            String statusLabel,
            Long linkedDriverId,
            String linkedDriverName
    ) {
    }

    public record RouteRequest(
            @NotBlank String name,
            @NotBlank String origin,
            @NotBlank String destination,
            @DecimalMin("0.1") BigDecimal estimatedDistanceKm,
            @Min(1) Integer estimatedTimeMinutes,
            RouteStatus status,
            Double originLat,
            Double originLng,
            Double destinationLat,
            Double destinationLng,
            String color
    ) {
    }

    public record RouteResponse(
            Long id,
            String name,
            String origin,
            String destination,
            BigDecimal estimatedDistanceKm,
            Integer estimatedTimeMinutes,
            RouteStatus status,
            String statusLabel,
            Double originLat,
            Double originLng,
            Double destinationLat,
            Double destinationLng,
            String color
    ) {
    }

    public record TimelineResponse(
            Long id,
            String title,
            String description,
            LocalDateTime timestamp,
            DeliveryStatus status,
            String statusLabel
    ) {
    }

    public record DeliveryRequest(
            @NotNull Long orderId,
            @NotNull Long driverId,
            @NotNull Long vehicleId,
            Long routeId,
            @NotBlank String origin,
            @NotBlank String destination,
            @NotNull LocalDateTime expectedAt,
            DeliveryStatus status,
            @Min(0) @Max(100) Integer progress
    ) {
    }

    public record StatusUpdateRequest(
            @NotNull DeliveryStatus status,
            @Min(0) @Max(100) Integer progress
    ) {
    }

    public record RescheduleRequest(@NotNull LocalDateTime expectedAt) {
    }

    public record DeliveryResponse(
            Long id,
            Long orderId,
            String orderNumber,
            String customerName,
            Long driverId,
            String driverName,
            Long vehicleId,
            String vehiclePlate,
            Long routeId,
            String routeName,
            String origin,
            String destination,
            LocalDateTime expectedAt,
            LocalDateTime deliveredAt,
            DeliveryStatus status,
            String statusLabel,
            Integer progress,
            Double currentLat,
            Double currentLng,
            List<TimelineResponse> timeline
    ) {
    }

    public record IncidentRequest(
            Long deliveryId,
            Long orderId,
            @NotNull IncidentType type,
            IncidentPriority priority,
            IncidentStatus status,
            @NotBlank String responsible,
            @NotBlank String description,
            String resolution
    ) {
    }

    public record IncidentResponse(
            Long id,
            Long deliveryId,
            Long orderId,
            String orderNumber,
            IncidentType type,
            String typeLabel,
            IncidentPriority priority,
            String priorityLabel,
            IncidentStatus status,
            String statusLabel,
            String responsible,
            String description,
            String resolution,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }

    public record IncidentResolutionRequest(@NotBlank @Size(max = 1000) String resolution) {
    }

    public record MetricCard(
            String key,
            String title,
            String value,
            String variation,
            String trend
    ) {
    }

    public record ChartSlice(
            String label,
            long value,
            String color
    ) {
    }

    public record PerformancePoint(
            String label,
            long value
    ) {
    }

    public record MapDelivery(
            Long id,
            String orderNumber,
            String customerName,
            String driverName,
            String vehiclePlate,
            String routeName,
            LocalDateTime expectedAt,
            DeliveryStatus status,
            String statusLabel,
            Integer progress,
            Double currentLat,
            Double currentLng,
            Double originLat,
            Double originLng,
            Double destinationLat,
            Double destinationLng,
            String color,
            boolean hasOpenIncident
    ) {
    }

    public record UpcomingDelivery(
            String time,
            String orderNumber,
            String customerName,
            String address,
            DeliveryStatus status,
            String statusLabel
    ) {
    }

    public record RecentIncident(
            Long id,
            String title,
            String orderNumber,
            String timeAgo,
            IncidentStatus status,
            String statusLabel,
            IncidentPriority priority
    ) {
    }

    public record ActiveDeliveryRow(
            Long id,
            String orderNumber,
            String customerName,
            String driverName,
            String routeName,
            DeliveryStatus status,
            String statusLabel,
            Integer progress,
            String expectedTime
    ) {
    }

    public record DashboardResponse(
            List<MetricCard> metrics,
            List<ChartSlice> deliveriesByStatus,
            List<PerformancePoint> dayPerformance,
            List<PerformancePoint> deliveriesByPeriod,
            List<ChartSlice> incidentsByType,
            List<MapDelivery> realtimeDeliveries,
            List<UpcomingDelivery> upcomingDeliveries,
            List<RecentIncident> recentIncidents,
            List<ActiveDeliveryRow> activeDeliveries
    ) {
    }
}
