package com.logitrack.security;

import com.logitrack.exception.TooManyRequestsException;
import org.junit.jupiter.api.Test;

import java.time.Clock;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginRateLimiterTest {

    @Test
    void blocksRepeatedFailuresAndClearsCounterAfterSuccess() {
        var limiter = new LoginRateLimiter(2, 900, Clock.systemUTC());

        limiter.recordFailure("127.0.0.1", "operator@logitrack.com");
        limiter.recordFailure("127.0.0.1", "operator@logitrack.com");

        assertThatThrownBy(() -> limiter.assertAllowed("127.0.0.1", "operator@logitrack.com"))
                .isInstanceOf(TooManyRequestsException.class);

        limiter.recordSuccess("127.0.0.1", "operator@logitrack.com");
        assertThatCode(() -> limiter.assertAllowed("127.0.0.1", "operator@logitrack.com"))
                .doesNotThrowAnyException();
    }
}
