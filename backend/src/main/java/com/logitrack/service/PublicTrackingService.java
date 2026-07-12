package com.logitrack.service;

import com.logitrack.domain.CustomerOrder;
import com.logitrack.dto.PlatformDtos;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;

@Service
public class PublicTrackingService {
    private final OrderRepository orders;
    private final DeliveryRepository deliveries;
    private final int decimals;

    public PublicTrackingService(OrderRepository orders, DeliveryRepository deliveries,
                                 @Value("${app.tracking.location-decimals:2}") int decimals) {
        this.orders = orders;
        this.deliveries = deliveries;
        this.decimals = Math.max(0, Math.min(3, decimals));
    }

    @Transactional(readOnly = true)
    public PlatformDtos.PublicTracking track(String code) {
        CustomerOrder order = orders.findByTrackingCode(code.trim().toUpperCase())
                .or(() -> orders.findByOrderNumber(code.trim()))
                .orElseThrow(() -> new ResourceNotFoundException("Código de rastreamento não encontrado."));
        var delivery = deliveries.findByOrderId(order.getId()).stream()
                .max(Comparator.comparing(item -> item.getCreatedAt())).orElse(null);
        if (delivery == null) {
            return new PlatformDtos.PublicTracking(order.getTrackingCode(), order.getOrderNumber(), order.getStatus().name(),
                    order.getStatus().getLabel(), order.getExpectedDeliveryAt(), 0, order.getCity(), order.getState(),
                    null, null, java.util.List.of());
        }
        var timeline = delivery.getTimeline().stream().map(item -> new PlatformDtos.TrackingTimeline(item.getTitle(),
                item.getDescription(), item.getTimestamp(), item.getStatus().getLabel())).toList();
        return new PlatformDtos.PublicTracking(order.getTrackingCode(), order.getOrderNumber(), delivery.getStatus().name(),
                delivery.getStatus().getLabel(), delivery.getExpectedAt(), delivery.getProgress(), order.getCity(), order.getState(),
                round(delivery.getCurrentLat()), round(delivery.getCurrentLng()), timeline);
    }

    private Double round(Double value) {
        return value == null ? null : BigDecimal.valueOf(value).setScale(decimals, RoundingMode.HALF_UP).doubleValue();
    }
}
