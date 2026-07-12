package com.logitrack.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;

@Component
public class SecurityErrorWriter {

    private final ObjectMapper objectMapper;

    public SecurityErrorWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void write(HttpServletRequest request, HttpServletResponse response, int status, String code, String message)
            throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        var body = new LinkedHashMap<String, Object>();
        body.put("timestamp", Instant.now());
        body.put("status", status);
        body.put("code", code);
        body.put("message", message);
        body.put("path", request.getRequestURI());
        var requestId = MDC.get("requestId");
        if (requestId != null) {
            body.put("requestId", requestId);
        }
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
