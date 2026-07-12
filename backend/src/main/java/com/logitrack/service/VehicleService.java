package com.logitrack.service;

import com.logitrack.domain.Vehicle;
import com.logitrack.domain.enums.VehicleStatus;
import com.logitrack.domain.enums.DriverStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.DriverRepository;
import com.logitrack.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final AuditService auditService;

    public VehicleService(VehicleRepository vehicleRepository, DriverRepository driverRepository, AuditService auditService) {
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Dtos.VehicleResponse> list() {
        return vehicleRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Vehicle::getPlate))
                .map(DtoMapper::toVehicle)
                .toList();
    }

    @Transactional(readOnly = true)
    public Dtos.VehicleResponse get(Long id) {
        return DtoMapper.toVehicle(findEntity(id));
    }

    @Transactional
    public Dtos.VehicleResponse create(Dtos.VehicleRequest request) {
        vehicleRepository.findByPlate(normalizePlate(request.plate()))
                .ifPresent(existing -> {
                    throw new BusinessException("Já existe veículo com esta placa.");
                });
        var vehicle = new Vehicle();
        apply(vehicle, request);
        var saved = vehicleRepository.save(vehicle);
        auditService.record("VEHICLE_CREATED", "VEHICLE", saved.getId(), "Veículo " + saved.getPlate() + " adicionado.");
        return DtoMapper.toVehicle(saved);
    }

    @Transactional
    public Dtos.VehicleResponse update(Long id, Dtos.VehicleRequest request) {
        var vehicle = findEntity(id);
        vehicleRepository.findByPlate(normalizePlate(request.plate()))
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Já existe veículo com esta placa.");
                });
        apply(vehicle, request);
        auditService.record("VEHICLE_UPDATED", "VEHICLE", vehicle.getId(), "Cadastro do veículo atualizado.");
        return DtoMapper.toVehicle(vehicle);
    }

    @Transactional
    public Dtos.VehicleResponse inactivate(Long id) {
        var vehicle = findEntity(id);
        if (vehicle.getStatus() == VehicleStatus.ON_ROUTE) {
            throw new BusinessException("Veículo em rota não pode ser inativado.");
        }
        vehicle.setStatus(VehicleStatus.INACTIVE);
        vehicle.setLinkedDriver(null);
        auditService.record("VEHICLE_INACTIVATED", "VEHICLE", vehicle.getId(), "Veículo inativado.");
        return DtoMapper.toVehicle(vehicle);
    }

    @Transactional(readOnly = true)
    public Vehicle findEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado."));
    }

    private void apply(Vehicle vehicle, Dtos.VehicleRequest request) {
        vehicle.setPlate(normalizePlate(request.plate()));
        vehicle.setModel(request.model());
        vehicle.setCapacityKg(request.capacityKg());
        if (vehicle.getStatus() != VehicleStatus.ON_ROUTE) {
            vehicle.setStatus(request.status() == null || request.status() == VehicleStatus.ON_ROUTE
                    ? VehicleStatus.AVAILABLE : request.status());
        }
        if (request.linkedDriverId() == null) {
            vehicle.setLinkedDriver(null);
        } else {
            var driver = driverRepository.findById(request.linkedDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Motorista vinculado não encontrado."));
            if (driver.getStatus() == DriverStatus.INACTIVE || driver.getStatus() == DriverStatus.ON_ROUTE) {
                throw new BusinessException("Apenas motoristas disponíveis podem ser vinculados ao veículo.");
            }
            vehicle.setLinkedDriver(driver);
        }
    }

    private String normalizePlate(String plate) {
        return plate.trim().toUpperCase();
    }
}
