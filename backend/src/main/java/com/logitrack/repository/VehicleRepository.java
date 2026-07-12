package com.logitrack.repository;

import com.logitrack.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByPlate(String plate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Vehicle> findForUpdateById(Long id);
}
