package com.logitrack.service;

import com.logitrack.domain.Driver;
import com.logitrack.domain.enums.DriverStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.exception.BusinessException;
import com.logitrack.exception.ResourceNotFoundException;
import com.logitrack.repository.DriverRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
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
                    throw new BusinessException("Ja existe motorista com esta CNH.");
                });
        var driver = new Driver();
        apply(driver, request);
        return DtoMapper.toDriver(driverRepository.save(driver));
    }

    @Transactional
    public Dtos.DriverResponse update(Long id, Dtos.DriverRequest request) {
        var driver = findEntity(id);
        driverRepository.findByLicenseNumber(request.licenseNumber())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Ja existe motorista com esta CNH.");
                });
        apply(driver, request);
        return DtoMapper.toDriver(driver);
    }

    @Transactional
    public Dtos.DriverResponse inactivate(Long id) {
        var driver = findEntity(id);
        if (driver.getStatus() == DriverStatus.ON_ROUTE) {
            throw new BusinessException("Motorista em rota nao pode ser inativado.");
        }
        driver.setStatus(DriverStatus.INACTIVE);
        driver.setCurrentVehicle(null);
        return DtoMapper.toDriver(driver);
    }

    @Transactional(readOnly = true)
    public Driver findEntity(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Motorista nao encontrado."));
    }

    private void apply(Driver driver, Dtos.DriverRequest request) {
        driver.setName(request.name());
        driver.setPhone(request.phone());
        driver.setLicenseNumber(request.licenseNumber());
        driver.setStatus(request.status() == null ? DriverStatus.AVAILABLE : request.status());
        driver.setCurrentVehicle(request.currentVehicle());
        driver.setDeliveriesCompleted(request.deliveriesCompleted() == null ? 0 : request.deliveriesCompleted());
        driver.setSuccessRate(request.successRate() == null ? BigDecimal.valueOf(98.0) : request.successRate());
    }
}
