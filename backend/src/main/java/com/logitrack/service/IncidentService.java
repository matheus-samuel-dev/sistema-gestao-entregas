package com.logitrack.service;

import com.logitrack.domain.Incident;
import com.logitrack.domain.enums.IncidentStatus;
import com.logitrack.domain.enums.IncidentPriority;
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
    private final NotificationService notificationService;
    private final AuditService auditService;

    public IncidentService(
            IncidentRepository incidentRepository,
            DeliveryRepository deliveryRepository,
            OrderRepository orderRepository,
            NotificationService notificationService,
            AuditService auditService
    ) {
        this.incidentRepository = incidentRepository;
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
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
        apply(incident, request, true);
        var saved = incidentRepository.save(incident);
        auditService.record("INCIDENT_CREATED", "INCIDENT", saved.getId(), "Ocorrência " + saved.getType().getLabel() + " registrada.");
        if (saved.getPriority() == IncidentPriority.CRITICAL) {
            notificationService.publish("CRITICAL_INCIDENT", "Ocorrência crítica aberta", saved.getType().getLabel()
                            + " requer tratamento prioritário.", "INCIDENT", saved.getId(),
                    "/incidents?details=" + saved.getId(), "critical-incident-" + saved.getId());
        }
        return DtoMapper.toIncident(saved);
    }

    @Transactional
    public Dtos.IncidentResponse update(Long id, Dtos.IncidentRequest request) {
        var incident = findEntity(id);
        if (incident.getStatus() == IncidentStatus.CANCELED) throw new BusinessException("Ocorrência cancelada não pode ser reaberta.");
        apply(incident, request, false);
        auditService.record("INCIDENT_UPDATED", "INCIDENT", incident.getId(), "Ocorrência atualizada para " + incident.getStatus().getLabel() + ".");
        return DtoMapper.toIncident(incident);
    }

    @Transactional
    public Dtos.IncidentResponse cancel(Long id) {
        var incident = findEntity(id);
        if (incident.getStatus() == IncidentStatus.CANCELED) return DtoMapper.toIncident(incident);
        if (incident.getStatus() == IncidentStatus.RESOLVED) throw new BusinessException("Ocorrência resolvida não pode ser cancelada.");
        incident.setStatus(IncidentStatus.CANCELED);
        auditService.record("INCIDENT_CANCELED", "INCIDENT", incident.getId(), "Ocorrência cancelada.");
        return DtoMapper.toIncident(incident);
    }

    @Transactional
    public Dtos.IncidentResponse resolve(Long id, Dtos.IncidentResolutionRequest request) {
        var incident = findEntity(id);
        if (incident.getStatus() == IncidentStatus.CANCELED) throw new BusinessException("Ocorrência cancelada não pode ser resolvida.");
        if (incident.getStatus() == IncidentStatus.RESOLVED) return DtoMapper.toIncident(incident);
        incident.setResolution(request.resolution().trim());
        incident.setStatus(IncidentStatus.RESOLVED);
        auditService.record("INCIDENT_RESOLVED", "INCIDENT", incident.getId(), "Ocorrência resolvida.");
        notificationService.publish("INCIDENT_RESOLVED", "Ocorrência resolvida", incident.getType().getLabel()
                        + " foi concluída pela equipe.", "INCIDENT", incident.getId(),
                "/incidents?details=" + incident.getId(), "incident-resolved-" + incident.getId());
        return DtoMapper.toIncident(incident);
    }

    @Transactional(readOnly = true)
    public Incident findEntity(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada."));
    }

    private void apply(Incident incident, Dtos.IncidentRequest request, boolean creating) {
        if (request.deliveryId() == null && request.orderId() == null) {
            throw new BusinessException("A ocorrência precisa estar vinculada a uma entrega ou pedido.");
        }

        if (request.deliveryId() != null) {
            var delivery = deliveryRepository.findById(request.deliveryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Entrega vinculada não encontrada."));
            incident.setDelivery(delivery);
            incident.setOrder(delivery.getOrder());
        } else {
            incident.setDelivery(null);
            incident.setOrder(orderRepository.findById(request.orderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pedido vinculado não encontrado.")));
        }

        incident.setType(request.type());
        incident.setPriority(request.priority() == null ? incident.getPriority() : request.priority());
        var status = creating ? IncidentStatus.OPEN : (request.status() == null ? incident.getStatus() : request.status());
        if (status == IncidentStatus.RESOLVED && (request.resolution() == null || request.resolution().isBlank())) {
            throw new BusinessException("Informe a resolução antes de concluir a ocorrência.");
        }
        incident.setStatus(status);
        incident.setResponsible(request.responsible().trim());
        incident.setDescription(request.description().trim());
        incident.setResolution(status == IncidentStatus.RESOLVED ? request.resolution().trim() : null);
    }
}
