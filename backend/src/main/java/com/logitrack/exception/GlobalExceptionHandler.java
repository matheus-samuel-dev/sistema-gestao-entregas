package com.logitrack.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return body(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage(), request, null);
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimit(TooManyRequestsException ex, HttpServletRequest request) {
        return ResponseEntity.status(ex.getStatus())
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(ex.getRetryAfterSeconds()))
                .body(payload(ex.getStatus(), ex.getCode(), ex.getMessage(), request, null));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException ex, HttpServletRequest request) {
        return body(ex.getStatus(), ex.getCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(HttpServletRequest request) {
        return body(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "E-mail ou senha inválidos.", request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        var fields = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() == null ? "Valor inválido" : error.getDefaultMessage(),
                        (first, second) -> first,
                        LinkedHashMap::new
                ));
        return body(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Revise os campos destacados.", request, fields);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraint(ConstraintViolationException ex, HttpServletRequest request) {
        var fields = ex.getConstraintViolations().stream().collect(Collectors.toMap(
                violation -> violation.getPropertyPath().toString(),
                violation -> violation.getMessage(),
                (first, second) -> first,
                LinkedHashMap::new
        ));
        return body(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Revise os campos informados.", request, fields);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpServletRequest request) {
        return body(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", "O corpo da requisição é inválido.", request, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("Conflito de integridade em {}", request.getRequestURI());
        return body(HttpStatus.CONFLICT, "DATA_CONFLICT", "A operação conflita com dados já existentes.", request, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResource(NoResourceFoundException ex, HttpServletRequest request) {
        return body(HttpStatus.NOT_FOUND, "ENDPOINT_NOT_FOUND", "Recurso não encontrado.", request, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethod(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        return body(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "Método HTTP não permitido para este recurso.", request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Falha inesperada em {}", request.getRequestURI(), ex);
        return body(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Não foi possível concluir a operação.", request, null);
    }

    private ResponseEntity<Map<String, Object>> body(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request,
            Map<String, String> errors
    ) {
        return ResponseEntity.status(status).body(payload(status, code, message, request, errors));
    }

    private Map<String, Object> payload(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request,
            Map<String, String> errors
    ) {
        var body = new LinkedHashMap<String, Object>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("code", code);
        body.put("message", message);
        body.put("path", request.getRequestURI());
        var requestId = MDC.get("requestId");
        if (requestId != null) {
            body.put("requestId", requestId);
        }
        if (errors != null && !errors.isEmpty()) {
            body.put("errors", errors);
        }
        return body;
    }
}
