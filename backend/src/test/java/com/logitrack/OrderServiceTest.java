package com.logitrack;

import com.logitrack.domain.enums.OrderStatus;
import com.logitrack.dto.Dtos;
import com.logitrack.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Test
    void createsOrderWithRequiredFields() {
        var request = request("#T-" + UUID.randomUUID().toString().substring(0, 8));

        var response = orderService.create(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.status()).isEqualTo(OrderStatus.PENDING);
        assertThat(response.customerName()).isEqualTo("Cliente Teste");
        assertThat(response.orderNumber()).startsWith("PED-").isNotEqualTo(request.orderNumber());
        assertThat(response.trackingCode()).startsWith("LT-");
    }

    @Test
    void keepsGeneratedNumberImmutableOnUpdate() {
        var created = orderService.create(request("manual-number"));
        var updated = orderService.update(created.id(), request("attempted-change"));

        assertThat(updated.orderNumber()).isEqualTo(created.orderNumber());
    }

    private Dtos.OrderRequest request(String number) {
        return new Dtos.OrderRequest(
                number,
                "Cliente Teste",
                "(11) 99999-0000",
                "Rua Teste, 100",
                "São Paulo",
                "SP",
                BigDecimal.valueOf(150.75),
                OrderStatus.PENDING,
                LocalDateTime.now().plusHours(4)
        );
    }
}
