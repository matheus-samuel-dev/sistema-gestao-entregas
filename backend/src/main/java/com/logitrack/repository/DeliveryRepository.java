package com.logitrack.repository;

import com.logitrack.domain.Delivery;
import com.logitrack.domain.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    long countByStatus(DeliveryStatus status);

    long countByStatusIn(Collection<DeliveryStatus> statuses);

    long countByExpectedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Delivery> findByStatusIn(Collection<DeliveryStatus> statuses);

    List<Delivery> findByOrderId(Long orderId);

    List<Delivery> findByDriverId(Long driverId);

    List<Delivery> findByExpectedAtBeforeAndStatusIn(LocalDateTime expectedAt, Collection<DeliveryStatus> statuses);

    boolean existsByOrderIdAndStatusIn(Long orderId, Collection<DeliveryStatus> statuses);

    boolean existsByOrderIdAndStatusInAndIdNot(Long orderId, Collection<DeliveryStatus> statuses, Long id);

    boolean existsByDriverIdAndStatusIn(Long driverId, Collection<DeliveryStatus> statuses);

    boolean existsByDriverIdAndStatusInAndIdNot(Long driverId, Collection<DeliveryStatus> statuses, Long id);

    boolean existsByVehicleIdAndStatusIn(Long vehicleId, Collection<DeliveryStatus> statuses);

    boolean existsByVehicleIdAndStatusInAndIdNot(Long vehicleId, Collection<DeliveryStatus> statuses, Long id);

    boolean existsByRouteIdAndStatusIn(Long routeId, Collection<DeliveryStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Delivery> findForUpdateById(Long id);
}
