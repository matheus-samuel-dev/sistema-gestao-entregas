package com.logitrack.repository;

import com.logitrack.domain.Delivery;
import com.logitrack.domain.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    long countByStatus(DeliveryStatus status);

    long countByStatusIn(Collection<DeliveryStatus> statuses);

    long countByExpectedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Delivery> findByStatusIn(Collection<DeliveryStatus> statuses);
}
