package com.logitrack.service;

import com.logitrack.dto.PlatformDtos;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.DriverRepository;
import com.logitrack.repository.IncidentRepository;
import com.logitrack.repository.OrderRepository;
import com.logitrack.repository.RouteRepository;
import com.logitrack.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.function.Function;

@Service
public class GlobalSearchService {
    private final OrderRepository orders;
    private final DeliveryRepository deliveries;
    private final DriverRepository drivers;
    private final VehicleRepository vehicles;
    private final RouteRepository routes;
    private final IncidentRepository incidents;

    public GlobalSearchService(OrderRepository orders, DeliveryRepository deliveries, DriverRepository drivers,
                               VehicleRepository vehicles, RouteRepository routes, IncidentRepository incidents) {
        this.orders = orders;
        this.deliveries = deliveries;
        this.drivers = drivers;
        this.vehicles = vehicles;
        this.routes = routes;
        this.incidents = incidents;
    }

    @Transactional(readOnly = true)
    public PlatformDtos.SearchResponse search(String query, int limit) {
        var needle = normalize(query);
        var groups = new ArrayList<PlatformDtos.SearchGroup>();

        addGroup(groups, "ORDER", "Pedidos", orders.findAll().stream()
                .filter(item -> matches(needle, item.getOrderNumber(), item.getCustomerName(), item.getCity(), item.getTrackingCode()))
                .map(item -> new PlatformDtos.SearchItem(item.getId(), "ORDER", item.getOrderNumber(),
                        item.getCustomerName() + " • " + item.getCity(), item.getStatus().getLabel(),
                        "/orders?details=" + item.getId())).toList(), limit);

        addGroup(groups, "DELIVERY", "Entregas", deliveries.findAll().stream()
                .filter(item -> matches(needle, item.getOrder().getOrderNumber(), item.getOrder().getCustomerName(),
                        item.getDriver().getName(), item.getVehicle().getPlate(), item.getDestination()))
                .map(item -> new PlatformDtos.SearchItem(item.getId(), "DELIVERY", "Entrega " + item.getOrder().getOrderNumber(),
                        item.getDriver().getName() + " • " + item.getVehicle().getPlate(), item.getStatus().getLabel(),
                        "/deliveries?details=" + item.getId())).toList(), limit);

        addGroup(groups, "DRIVER", "Motoristas", drivers.findAll().stream()
                .filter(item -> matches(needle, item.getName(), item.getPhone(), item.getLicenseNumber(), item.getCurrentVehicle()))
                .map(item -> new PlatformDtos.SearchItem(item.getId(), "DRIVER", item.getName(),
                        "CNH " + item.getLicenseNumber(), item.getStatus().getLabel(),
                        "/drivers?details=" + item.getId())).toList(), limit);

        addGroup(groups, "VEHICLE", "Veículos", vehicles.findAll().stream()
                .filter(item -> matches(needle, item.getPlate(), item.getModel()))
                .map(item -> new PlatformDtos.SearchItem(item.getId(), "VEHICLE", item.getPlate(), item.getModel(),
                        item.getStatus().getLabel(), "/vehicles?details=" + item.getId())).toList(), limit);

        addGroup(groups, "ROUTE", "Rotas", routes.findAll().stream()
                .filter(item -> matches(needle, item.getName(), item.getOrigin(), item.getDestination()))
                .map(item -> new PlatformDtos.SearchItem(item.getId(), "ROUTE", item.getName(),
                        item.getOrigin() + " → " + item.getDestination(), item.getStatus().getLabel(),
                        "/routes?details=" + item.getId())).toList(), limit);

        addGroup(groups, "INCIDENT", "Ocorrências", incidents.findAll().stream()
                .filter(item -> matches(needle, item.getType().getLabel(), item.getDescription(), item.getResponsible(),
                        item.getOrder() == null ? null : item.getOrder().getOrderNumber()))
                .map(item -> new PlatformDtos.SearchItem(item.getId(), "INCIDENT", item.getType().getLabel(),
                        (item.getOrder() == null ? "Sem pedido" : item.getOrder().getOrderNumber()) + " • " + item.getResponsible(),
                        item.getStatus().getLabel(), "/incidents?details=" + item.getId())).toList(), limit);

        var total = groups.stream().mapToLong(PlatformDtos.SearchGroup::total).sum();
        return new PlatformDtos.SearchResponse(query.trim(), total, groups);
    }

    private void addGroup(List<PlatformDtos.SearchGroup> groups, String type, String label,
                          List<PlatformDtos.SearchItem> results, int limit) {
        if (!results.isEmpty()) groups.add(new PlatformDtos.SearchGroup(type, label, results.size(),
                results.stream().limit(limit).toList()));
    }

    private boolean matches(String needle, String... values) {
        for (String value : values) if (value != null && normalize(value).contains(needle)) return true;
        return false;
    }

    private String normalize(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).trim();
    }
}
