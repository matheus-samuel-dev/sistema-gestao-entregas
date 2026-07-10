package com.logitrack.repository;

import com.logitrack.domain.RoutePlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<RoutePlan, Long> {
}
