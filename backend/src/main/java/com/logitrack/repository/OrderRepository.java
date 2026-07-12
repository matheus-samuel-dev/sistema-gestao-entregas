package com.logitrack.repository;

import com.logitrack.domain.CustomerOrder;
import com.logitrack.domain.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    Optional<CustomerOrder> findByTrackingCode(String trackingCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CustomerOrder> findForUpdateById(Long id);

    long countByStatus(OrderStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
