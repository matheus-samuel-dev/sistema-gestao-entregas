package com.logitrack.repository;

import com.logitrack.domain.Incident;
import com.logitrack.domain.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    long countByStatusIn(Collection<IncidentStatus> statuses);
}
