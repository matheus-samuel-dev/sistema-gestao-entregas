package com.logitrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logitrack.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlatformEndpointsTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired OrderRepository orderRepository;

    @Test
    void exposesOperationalHeaderDataAndSafePublicTracking() throws Exception {
        var login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin@logitrack.com","password":"Admin@123"}
                                """))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var token = objectMapper.readTree(login).get("token").asText();
        var bearer = "Bearer " + token;

        mockMvc.perform(get("/api/search").param("q", "São").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.groups").isArray());
        mockMvc.perform(get("/api/notifications").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.unreadCount").isNumber());
        mockMvc.perform(get("/api/conversations").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].participantName").isNotEmpty());
        mockMvc.perform(get("/api/calendar").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items").isArray());
        mockMvc.perform(get("/api/audit").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$").isArray());

        var trackingCode = orderRepository.findAll().get(0).getTrackingCode();
        mockMvc.perform(get("/api/tracking/{code}", trackingCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trackingCode").value(trackingCode))
                .andExpect(jsonPath("$.customerName").doesNotExist())
                .andExpect(jsonPath("$.phone").doesNotExist());
    }
}
