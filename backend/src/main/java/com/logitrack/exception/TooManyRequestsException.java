package com.logitrack.exception;

import org.springframework.http.HttpStatus;

public class TooManyRequestsException extends BusinessException {
    private final long retryAfterSeconds;

    public TooManyRequestsException(long retryAfterSeconds) {
        super(HttpStatus.TOO_MANY_REQUESTS, "LOGIN_RATE_LIMITED",
                "Muitas tentativas de acesso. Aguarde antes de tentar novamente.");
        this.retryAfterSeconds = Math.max(1, retryAfterSeconds);
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
