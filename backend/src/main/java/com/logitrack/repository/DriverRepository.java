package com.logitrack.repository;

import com.logitrack.domain.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByLicenseNumber(String licenseNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Driver> findForUpdateById(Long id);
}
