package com.logitrack.domain;

import com.logitrack.domain.enums.RouteStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Index;

import java.math.BigDecimal;

@Entity
@Table(name = "route_plans", indexes = {
        @Index(name = "idx_routes_status", columnList = "status"),
        @Index(name = "idx_routes_name", columnList = "name")
})
public class RoutePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal estimatedDistanceKm;

    @Column(nullable = false)
    private Integer estimatedTimeMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteStatus status = RouteStatus.PLANNED;

    @Column(nullable = false)
    private Double originLat;

    @Column(nullable = false)
    private Double originLng;

    @Column(nullable = false)
    private Double destinationLat;

    @Column(nullable = false)
    private Double destinationLng;

    @Column(nullable = false, length = 16)
    private String color = "#10b981";

    @PrePersist
    void prePersist() {
        if (status == null) {
            status = RouteStatus.PLANNED;
        }
        if (color == null || color.isBlank()) {
            color = "#10b981";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public BigDecimal getEstimatedDistanceKm() {
        return estimatedDistanceKm;
    }

    public void setEstimatedDistanceKm(BigDecimal estimatedDistanceKm) {
        this.estimatedDistanceKm = estimatedDistanceKm;
    }

    public Integer getEstimatedTimeMinutes() {
        return estimatedTimeMinutes;
    }

    public void setEstimatedTimeMinutes(Integer estimatedTimeMinutes) {
        this.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    public RouteStatus getStatus() {
        return status;
    }

    public void setStatus(RouteStatus status) {
        this.status = status;
    }

    public Double getOriginLat() {
        return originLat;
    }

    public void setOriginLat(Double originLat) {
        this.originLat = originLat;
    }

    public Double getOriginLng() {
        return originLng;
    }

    public void setOriginLng(Double originLng) {
        this.originLng = originLng;
    }

    public Double getDestinationLat() {
        return destinationLat;
    }

    public void setDestinationLat(Double destinationLat) {
        this.destinationLat = destinationLat;
    }

    public Double getDestinationLng() {
        return destinationLng;
    }

    public void setDestinationLng(Double destinationLng) {
        this.destinationLng = destinationLng;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
