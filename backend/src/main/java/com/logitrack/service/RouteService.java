package com.logitrack.service;

import com.logitrack.domain.RoutePlan;
import com.logitrack.domain.enums.RouteStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.RouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;
    private final AuditService auditService;

    public RouteService(RouteRepository routeRepository, AuditService auditService) {
        this.routeRepository = routeRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Dtos.RouteResponse> list() {
        return routeRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(RoutePlan::getName))
                .map(DtoMapper::toRoute)
                .toList();
    }

    @Transactional(readOnly = true)
    public Dtos.RouteResponse get(Long id) {
        return DtoMapper.toRoute(findEntity(id));
    }

    @Transactional
    public Dtos.RouteResponse create(Dtos.RouteRequest request) {
        var route = new RoutePlan();
        apply(route, request);
        var saved = routeRepository.save(route);
        auditService.record("ROUTE_CREATED", "ROUTE", saved.getId(), "Rota " + saved.getName() + " criada com cálculo automático.");
        return DtoMapper.toRoute(saved);
    }

    @Transactional
    public Dtos.RouteResponse update(Long id, Dtos.RouteRequest request) {
        var route = findEntity(id);
        if (route.getStatus() == RouteStatus.COMPLETED || route.getStatus() == RouteStatus.CANCELED) {
            throw new BusinessException("Rotas finalizadas não podem ser editadas.");
        }
        apply(route, request);
        auditService.record("ROUTE_UPDATED", "ROUTE", route.getId(), "Rota recalculada.");
        return DtoMapper.toRoute(route);
    }

    @Transactional
    public Dtos.RouteResponse cancel(Long id) {
        var route = findEntity(id);
        route.setStatus(RouteStatus.CANCELED);
        auditService.record("ROUTE_CANCELED", "ROUTE", route.getId(), "Rota cancelada.");
        return DtoMapper.toRoute(route);
    }

    @Transactional(readOnly = true)
    public RoutePlan findEntity(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rota não encontrada."));
    }

    private void apply(RoutePlan route, Dtos.RouteRequest request) {
        route.setName(request.name());
        route.setOrigin(request.origin());
        route.setDestination(request.destination());
        route.setStatus(request.status() == null ? RouteStatus.PLANNED : request.status());
        var origin = geocode(request.origin());
        var destination = geocode(request.destination());
        route.setOriginLat(origin[0]);
        route.setOriginLng(origin[1]);
        route.setDestinationLat(destination[0]);
        route.setDestinationLng(destination[1]);
        var distance = haversine(origin[0], origin[1], destination[0], destination[1]);
        route.setEstimatedDistanceKm(BigDecimal.valueOf(Math.max(0.5, distance)).setScale(2, RoundingMode.HALF_UP));
        route.setEstimatedTimeMinutes(Math.max(5, (int) Math.ceil((distance / 32.0) * 60)));
        route.setColor(validColor(request.color()) ? request.color().toLowerCase() : colorFor(request.name()));
    }

    private double[] geocode(String address) {
        long hash = Integer.toUnsignedLong(address.trim().toLowerCase().hashCode());
        double lat = -23.55052 + (((hash % 1001) - 500) / 10_000.0);
        double lng = -46.63331 + ((((hash / 1001) % 1001) - 500) / 10_000.0);
        return new double[]{lat, lng};
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private boolean validColor(String value) { return value != null && value.matches("^#[0-9a-fA-F]{6}$"); }

    private String colorFor(String name) {
        var palette = List.of("#0f9f6e", "#2563eb", "#7c3aed", "#ea580c", "#0891b2", "#db2777");
        return palette.get(Math.floorMod(name.hashCode(), palette.size()));
    }
}
