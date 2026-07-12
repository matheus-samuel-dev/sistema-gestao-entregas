package com.logitrack.domain;

import com.logitrack.domain.enums.DeliveryStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.Version;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "deliveries", indexes = {
        @Index(name = "idx_deliveries_status", columnList = "status"),
        @Index(name = "idx_deliveries_expected_at", columnList = "expectedAt"),
        @Index(name = "idx_deliveries_order", columnList = "order_id"),
        @Index(name = "idx_deliveries_driver", columnList = "driver_id"),
        @Index(name = "idx_deliveries_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_deliveries_route", columnList = "route_id")
})
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id")
    private CustomerOrder order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private RoutePlan route;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDateTime expectedAt;

    private LocalDateTime deliveredAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.IN_PROGRESS;

    @Column(nullable = false)
    private Integer progress = 0;

    @Column(nullable = false)
    private Double currentLat = -23.55052;

    @Column(nullable = false)
    private Double currentLng = -46.63331;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeliveryTimeline> timeline = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = DeliveryStatus.IN_PROGRESS;
        }
        if (progress == null) {
            progress = 0;
        }
    }

    public void addTimeline(DeliveryTimeline item) {
        item.setDelivery(this);
        timeline.add(item);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVersion() {
        return version;
    }

    public CustomerOrder getOrder() {
        return order;
    }

    public void setOrder(CustomerOrder order) {
        this.order = order;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public RoutePlan getRoute() {
        return route;
    }

    public void setRoute(RoutePlan route) {
        this.route = route;
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

    public LocalDateTime getExpectedAt() {
        return expectedAt;
    }

    public void setExpectedAt(LocalDateTime expectedAt) {
        this.expectedAt = expectedAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Double getCurrentLat() {
        return currentLat;
    }

    public void setCurrentLat(Double currentLat) {
        this.currentLat = currentLat;
    }

    public Double getCurrentLng() {
        return currentLng;
    }

    public void setCurrentLng(Double currentLng) {
        this.currentLng = currentLng;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<DeliveryTimeline> getTimeline() {
        return timeline;
    }

    public void setTimeline(List<DeliveryTimeline> timeline) {
        this.timeline = timeline;
    }
}
