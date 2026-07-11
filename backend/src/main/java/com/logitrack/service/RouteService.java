package com.logitrack.service;

import com.logitrack.domain.RoutePlan;
import com.logitrack.domain.enums.RouteStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.RouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
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
        return DtoMapper.toRoute(routeRepository.save(route));
    }

    @Transactional
    public Dtos.RouteResponse update(Long id, Dtos.RouteRequest request) {
        var route = findEntity(id);
        apply(route, request);
        return DtoMapper.toRoute(route);
    }

    @Transactional
    public Dtos.RouteResponse cancel(Long id) {
        var route = findEntity(id);
        route.setStatus(RouteStatus.CANCELED);
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
        route.setEstimatedDistanceKm(request.estimatedDistanceKm());
        route.setEstimatedTimeMinutes(request.estimatedTimeMinutes());
        route.setStatus(request.status() == null ? RouteStatus.PLANNED : request.status());
        route.setOriginLat(request.originLat());
        route.setOriginLng(request.originLng());
        route.setDestinationLat(request.destinationLat());
        route.setDestinationLng(request.destinationLng());
        route.setColor(request.color());
    }
}
