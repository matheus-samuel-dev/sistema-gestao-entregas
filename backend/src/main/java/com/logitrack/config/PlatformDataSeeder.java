package com.logitrack.config;

import com.logitrack.domain.Conversation;
import com.logitrack.domain.ConversationMessage;
import com.logitrack.repository.ConversationRepository;
import com.logitrack.repository.DeliveryRepository;
import com.logitrack.repository.IncidentRepository;
import com.logitrack.repository.NotificationRepository;
import com.logitrack.service.AuditService;
import com.logitrack.service.NotificationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;

import java.util.List;

@Configuration
@Profile({"demo", "test"})
public class PlatformDataSeeder {
    @Bean
    @Order(2)
    CommandLineRunner seedPlatformData(NotificationRepository notifications,
                                       ConversationRepository conversations,
                                       DeliveryRepository deliveries,
                                       IncidentRepository incidents,
                                       NotificationService notificationService,
                                       AuditService auditService) {
        return args -> {
            if (notifications.count() == 0) {
                deliveries.findAll().stream().findFirst().ifPresent(delivery ->
                        notificationService.publish("DELIVERY_STARTED", "Rota em acompanhamento",
                                "Uma entrega ativa está sendo monitorada pela central.",
                                "DELIVERY", delivery.getId(), "/deliveries?details=" + delivery.getId(),
                                "demo-delivery-" + delivery.getId()));
                incidents.findAll().stream().filter(item -> item.getPriority().name().equals("CRITICAL")).findFirst()
                        .ifPresent(incident -> notificationService.publish("CRITICAL_INCIDENT", "Ocorrência crítica aberta",
                                incident.getType().getLabel() + " requer tratamento prioritário.", "INCIDENT", incident.getId(),
                                "/incidents?details=" + incident.getId(), "demo-incident-" + incident.getId()));
                notificationService.publish("SLA_WARNING", "SLA próximo do limite",
                        "Uma entrega prevista para hoje exige atenção da operação.", "DELIVERY", null,
                        "/deliveries?risk=true", "demo-sla-warning");
            }

            if (conversations.count() == 0) {
                var routeDelivery = deliveries.findAll().stream().findFirst().orElse(null);
                var first = conversation("Marcos Oliveira", "Motorista", "DELIVERY",
                        routeDelivery == null ? null : routeDelivery.getId());
                first.addMessage(message("Marcos Oliveira", "DRIVER",
                        "Coleta concluída. Sigo para o próximo ponto da rota.", false));
                first.addMessage(message("João Silva", "ADMIN",
                        "Recebido. Mantenha a central informada sobre o trânsito.", true));

                var second = conversation("Equipe de Frota", "Gestão de frota", "VEHICLE", null);
                second.addMessage(message("Equipe de Frota", "FLEET_MANAGER",
                        "Revisão preventiva confirmada para amanhã às 08h.", false));
                conversations.saveAll(List.of(first, second));
            }

            if (auditService.list().isEmpty()) {
                auditService.record("DEMO_INITIALIZED", "SYSTEM", null, "Ambiente demonstrativo inicializado.");
            }
        };
    }

    private Conversation conversation(String name, String role, String contextType, Long contextId) {
        var conversation = new Conversation();
        conversation.setParticipantName(name);
        conversation.setParticipantRole(role);
        conversation.setContextType(contextType);
        conversation.setContextId(contextId);
        return conversation;
    }

    private ConversationMessage message(String sender, String role, String content, boolean read) {
        var message = new ConversationMessage();
        message.setSenderName(sender);
        message.setSenderRole(role);
        message.setContent(content);
        message.setReadMessage(read);
        return message;
    }
}
