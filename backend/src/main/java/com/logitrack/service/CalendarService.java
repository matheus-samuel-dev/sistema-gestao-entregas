package com.logitrack.service;

import com.logitrack.domain.enums.IncidentPriority;
import com.logitrack.dto.PlatformDtos;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.stream.Stream;

@Service
public class CalendarService {
    private final DeliveryRepository deliveries;
    private final IncidentRepository incidents;

    public CalendarService(DeliveryRepository deliveries, IncidentRepository incidents) {
        this.deliveries = deliveries;
        this.incidents = incidents;
    }

    @Transactional(readOnly = true)
    public PlatformDtos.CalendarResponse get(LocalDate date) {
        var deliveryItems = deliveries.findAll().stream()
                .filter(item -> item.getExpectedAt().toLocalDate().equals(date))
                .map(item -> new PlatformDtos.CalendarItem(item.getId(), "DELIVERY",
                        "Entrega " + item.getOrder().getOrderNumber(),
                        item.getOrder().getCustomerName() + " • " + item.getDestination(), item.getExpectedAt(),
                        item.getStatus().getLabel(), "DELIVERY", item.getId(), "/deliveries?details=" + item.getId()));
        var incidentItems = incidents.findAll().stream()
                .filter(item -> item.getCreatedAt().toLocalDate().equals(date))
                .filter(item -> item.getPriority() == IncidentPriority.HIGH || item.getPriority() == IncidentPriority.CRITICAL)
                .map(item -> new PlatformDtos.CalendarItem(item.getId(), "INCIDENT", item.getType().getLabel(),
                        item.getDescription(), item.getCreatedAt(), item.getStatus().getLabel(), "INCIDENT", item.getId(),
                        "/incidents?details=" + item.getId()));
        var items = Stream.concat(deliveryItems, incidentItems)
                .sorted(Comparator.comparing(PlatformDtos.CalendarItem::startAt)).toList();
        return new PlatformDtos.CalendarResponse(date, items);
    }
}
