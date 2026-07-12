package com.logitrack.service;

import com.logitrack.domain.Driver;
import com.logitrack.domain.enums.DriverStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.DriverRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final AuditService auditService;

    public DriverService(DriverRepository driverRepository, AuditService auditService) {
        this.driverRepository = driverRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Dtos.DriverResponse> list() {
        return driverRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Driver::getName))
                .map(DtoMapper::toDriver)
                .toList();
    }

    @Transactional(readOnly = true)
    public Dtos.DriverResponse get(Long id) {
        return DtoMapper.toDriver(findEntity(id));
    }

    @Transactional
    public Dtos.DriverResponse create(Dtos.DriverRequest request) {
        driverRepository.findByLicenseNumber(request.licenseNumber())
                .ifPresent(existing -> {
                    throw new BusinessException("Já existe motorista com esta CNH.");
                });
        var driver = new Driver();
        driver.setName(request.name().trim());
        driver.setPhone(request.phone().trim());
        driver.setLicenseNumber(request.licenseNumber().trim());
        driver.setStatus(request.status() == DriverStatus.UNAVAILABLE ? DriverStatus.UNAVAILABLE : DriverStatus.AVAILABLE);
        driver.setCurrentVehicle(null);
        driver.setDeliveriesCompleted(0);
        driver.setSuccessRate(java.math.BigDecimal.valueOf(100));
        var saved = driverRepository.save(driver);
        auditService.record("DRIVER_CREATED", "DRIVER", saved.getId(), "Motorista " + saved.getName() + " adicionado.");
        return DtoMapper.toDriver(saved);
    }

    @Transactional
    public Dtos.DriverResponse update(Long id, Dtos.DriverRequest request) {
        var driver = findEntity(id);
        driverRepository.findByLicenseNumber(request.licenseNumber())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Já existe motorista com esta CNH.");
                });
        driver.setName(request.name().trim());
        driver.setPhone(request.phone().trim());
        driver.setLicenseNumber(request.licenseNumber().trim());
        if (driver.getStatus() != DriverStatus.ON_ROUTE && request.status() != null && request.status() != DriverStatus.ON_ROUTE) {
            driver.setStatus(request.status());
        }
        auditService.record("DRIVER_UPDATED", "DRIVER", driver.getId(), "Cadastro do motorista atualizado.");
        return DtoMapper.toDriver(driver);
    }

    @Transactional
    public Dtos.DriverResponse inactivate(Long id) {
        var driver = findEntity(id);
        if (driver.getStatus() == DriverStatus.ON_ROUTE) {
            throw new BusinessException("Motorista em rota não pode ser inativado.");
        }
        driver.setStatus(DriverStatus.INACTIVE);
        driver.setCurrentVehicle(null);
        auditService.record("DRIVER_INACTIVATED", "DRIVER", driver.getId(), "Motorista inativado.");
        return DtoMapper.toDriver(driver);
    }

    @Transactional(readOnly = true)
    public Driver findEntity(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Motorista não encontrado."));
    }

}
