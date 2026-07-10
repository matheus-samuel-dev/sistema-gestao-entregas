package com.logitrack.service;

import com.logitrack.domain.Incident;
import com.logitrack.domain.enums.IncidentStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.IncidentRepository;
import com.logitrack.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;

    public IncidentService(
            IncidentRepository incidentRepository,
            DeliveryRepository deliveryRepository,
            OrderRepository orderRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<Dtos.IncidentResponse> list() {
        return incidentRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .map(DtoMapper::toIncident)
                .toList();
    }

    @Transactional(readOnly = true)
    public Dtos.IncidentResponse get(Long id) {
        return DtoMapper.toIncident(findEntity(id));
    }

    @Transactional
    public Dtos.IncidentResponse create(Dtos.IncidentRequest request) {
        var incident = new Incident();
        apply(incident, request);
        return DtoMapper.toIncident(incidentRepository.save(incident));
    }

    @Transactional
    public Dtos.IncidentResponse update(Long id, Dtos.IncidentRequest request) {
        var incident = findEntity(id);
        apply(incident, request);
        return DtoMapper.toIncident(incident);
    }

    @Transactional
    public Dtos.IncidentResponse cancel(Long id) {
        var incident = findEntity(id);
        incident.setStatus(IncidentStatus.CANCELED);
        return DtoMapper.toIncident(incident);
    }

    @Transactional(readOnly = true)
    public Incident findEntity(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrencia nao encontrada."));
    }

    private void apply(Incident incident, Dtos.IncidentRequest request) {
        if (request.deliveryId() == null && request.orderId() == null) {
            throw new BusinessException("A ocorrencia precisa estar vinculada a uma entrega ou pedido.");
        }

        if (request.deliveryId() != null) {
            var delivery = deliveryRepository.findById(request.deliveryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Entrega vinculada nao encontrada."));
            incident.setDelivery(delivery);
            incident.setOrder(delivery.getOrder());
        } else {
            incident.setDelivery(null);
            incident.setOrder(orderRepository.findById(request.orderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pedido vinculado nao encontrado.")));
        }

        incident.setType(request.type());
        incident.setPriority(request.priority() == null ? incident.getPriority() : request.priority());
        incident.setStatus(request.status() == null ? IncidentStatus.OPEN : request.status());
        incident.setResponsible(request.responsible());
        incident.setDescription(request.description());
        incident.setResolution(request.resolution());
    }
}
