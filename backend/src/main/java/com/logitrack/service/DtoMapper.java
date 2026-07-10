package com.logitrack.service;

import com.logitrack.domain.CustomerOrder;
import com.logitrack.domain.Delivery;
import com.logitrack.domain.DeliveryTimeline;
import com.logitrack.domain.Driver;
import com.logitrack.domain.Incident;
import com.logitrack.domain.RoutePlan;
import com.logitrack.domain.UserAccount;
import com.logitrack.domain.Vehicle;
import com.logitrack.dto.Dtos;

import java.util.Comparator;

public final class DtoMapper {
    private DtoMapper() {
    }

    public static Dtos.UserResponse toUser(UserAccount user) {
        return new Dtos.UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public static Dtos.OrderResponse toOrder(CustomerOrder order) {
        return new Dtos.OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerName(),
                order.getPhone(),
                order.getAddress(),
                order.getCity(),
                order.getState(),
                order.getValue(),
                order.getStatus(),
                order.getStatus().getLabel(),
                order.getCreatedAt(),
                order.getExpectedDeliveryAt()
        );
    }

    public static Dtos.DriverResponse toDriver(Driver driver) {
        return new Dtos.DriverResponse(
                driver.getId(),
                driver.getName(),
                driver.getPhone(),
                driver.getLicenseNumber(),
                driver.getStatus(),
                driver.getStatus().getLabel(),
                driver.getCurrentVehicle(),
                driver.getDeliveriesCompleted(),
                driver.getSuccessRate()
        );
    }

    public static Dtos.VehicleResponse toVehicle(Vehicle vehicle) {
        var linkedDriver = vehicle.getLinkedDriver();
        return new Dtos.VehicleResponse(
                vehicle.getId(),
                vehicle.getPlate(),
                vehicle.getModel(),
                vehicle.getCapacityKg(),
                vehicle.getStatus(),
                vehicle.getStatus().getLabel(),
                linkedDriver == null ? null : linkedDriver.getId(),
                linkedDriver == null ? null : linkedDriver.getName()
        );
    }

    public static Dtos.RouteResponse toRoute(RoutePlan route) {
        return new Dtos.RouteResponse(
                route.getId(),
                route.getName(),
                route.getOrigin(),
                route.getDestination(),
                route.getEstimatedDistanceKm(),
                route.getEstimatedTimeMinutes(),
                route.getStatus(),
                route.getStatus().getLabel(),
                route.getOriginLat(),
                route.getOriginLng(),
                route.getDestinationLat(),
                route.getDestinationLng(),
                route.getColor()
        );
    }

    public static Dtos.TimelineResponse toTimeline(DeliveryTimeline item) {
        return new Dtos.TimelineResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getTimestamp(),
                item.getStatus(),
                item.getStatus().getLabel()
        );
    }

    public static Dtos.DeliveryResponse toDelivery(Delivery delivery) {
        var order = delivery.getOrder();
        var driver = delivery.getDriver();
        var vehicle = delivery.getVehicle();
        var route = delivery.getRoute();
        var timeline = delivery.getTimeline()
                .stream()
                .sorted(Comparator.comparing(DeliveryTimeline::getTimestamp).reversed())
                .map(DtoMapper::toTimeline)
                .toList();

        return new Dtos.DeliveryResponse(
                delivery.getId(),
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerName(),
                driver.getId(),
                driver.getName(),
                vehicle.getId(),
                vehicle.getPlate(),
                route == null ? null : route.getId(),
                route == null ? null : route.getName(),
                delivery.getOrigin(),
                delivery.getDestination(),
                delivery.getExpectedAt(),
                delivery.getDeliveredAt(),
                delivery.getStatus(),
                delivery.getStatus().getLabel(),
                delivery.getProgress(),
                delivery.getCurrentLat(),
                delivery.getCurrentLng(),
                timeline
        );
    }

    public static Dtos.IncidentResponse toIncident(Incident incident) {
        var delivery = incident.getDelivery();
        var order = incident.getOrder();
        return new Dtos.IncidentResponse(
                incident.getId(),
                delivery == null ? null : delivery.getId(),
                order == null ? null : order.getId(),
                order == null ? null : order.getOrderNumber(),
                incident.getType(),
                incident.getType().getLabel(),
                incident.getPriority(),
                incident.getPriority().getLabel(),
                incident.getStatus(),
                incident.getStatus().getLabel(),
                incident.getResponsible(),
                incident.getDescription(),
                incident.getResolution(),
                incident.getCreatedAt(),
                incident.getUpdatedAt()
        );
    }
}
