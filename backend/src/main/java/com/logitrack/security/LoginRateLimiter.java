package com.logitrack.security;

import com.logitrack.exception.TooManyRequestsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private static final int MAX_TRACKED_KEYS = 10_000;

    private final ConcurrentHashMap<String, Deque<Long>> failures = new ConcurrentHashMap<>();
    private final int maxAttempts;
    private final long windowMillis;
    private final Clock clock;

    @Autowired
    public LoginRateLimiter(
            @Value("${app.auth.login-rate-limit.max-attempts:5}") int maxAttempts,
            @Value("${app.auth.login-rate-limit.window-seconds:900}") long windowSeconds
    ) {
        this(maxAttempts, windowSeconds, Clock.systemUTC());
    }

    LoginRateLimiter(int maxAttempts, long windowSeconds, Clock clock) {
        this.maxAttempts = Math.max(1, maxAttempts);
        this.windowMillis = Math.max(1, windowSeconds) * 1_000;
        this.clock = clock;
    }

    public void assertAllowed(String remoteAddress, String email) {
        var key = key(remoteAddress, email);
        var attempts = failures.get(key);
        if (attempts == null) {
            return;
        }
        synchronized (attempts) {
            prune(attempts);
            if (attempts.size() >= maxAttempts) {
                var retryAt = attempts.peekFirst() + windowMillis;
                var retrySeconds = (retryAt - clock.millis() + 999) / 1_000;
                throw new TooManyRequestsException(retrySeconds);
            }
        }
    }

    public void recordFailure(String remoteAddress, String email) {
        if (failures.size() >= MAX_TRACKED_KEYS) {
            failures.entrySet().removeIf(entry -> {
                synchronized (entry.getValue()) {
                    prune(entry.getValue());
                    return entry.getValue().isEmpty();
                }
            });
        }
        var attempts = failures.computeIfAbsent(key(remoteAddress, email), ignored -> new ArrayDeque<>());
        synchronized (attempts) {
            prune(attempts);
            attempts.addLast(clock.millis());
        }
    }

    public void recordSuccess(String remoteAddress, String email) {
        failures.remove(key(remoteAddress, email));
    }

    private void prune(Deque<Long> attempts) {
        var cutoff = clock.millis() - windowMillis;
        while (!attempts.isEmpty() && attempts.peekFirst() <= cutoff) {
            attempts.removeFirst();
        }
    }

    private String key(String remoteAddress, String email) {
        var safeAddress = remoteAddress == null ? "unknown" : remoteAddress;
        var safeEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        return safeAddress + '|' + safeEmail;
    }
}
