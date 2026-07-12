package com.logitrack.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final SecurityErrorWriter errorWriter;

    public RestAuthenticationEntryPoint(SecurityErrorWriter errorWriter) {
        this.errorWriter = errorWriter;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        var invalidToken = Boolean.TRUE.equals(request.getAttribute("invalidJwt"));
        errorWriter.write(
                request,
                response,
                HttpServletResponse.SC_UNAUTHORIZED,
                invalidToken ? "INVALID_TOKEN" : "AUTHENTICATION_REQUIRED",
                invalidToken ? "Token de acesso inválido ou expirado." : "Autenticação necessária para acessar este recurso."
        );
    }
}
