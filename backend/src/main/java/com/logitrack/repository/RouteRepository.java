package com.logitrack.repository;

import com.logitrack.domain.RoutePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface RouteRepository extends JpaRepository<RoutePlan, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RoutePlan> findForUpdateById(Long id);
}
