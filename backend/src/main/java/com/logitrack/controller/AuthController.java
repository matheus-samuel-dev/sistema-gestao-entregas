package com.logitrack.controller;

import com.logitrack.dto.Dtos;
import com.logitrack.repository.UserRepository;
import com.logitrack.security.JwtService;
import com.logitrack.security.LoginRateLimiter;
import com.logitrack.service.DtoMapper;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final LoginRateLimiter loginRateLimiter;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            LoginRateLimiter loginRateLimiter
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.loginRateLimiter = loginRateLimiter;
    }

    @PostMapping("/login")
    public Dtos.AuthResponse login(@Valid @RequestBody Dtos.LoginRequest request, HttpServletRequest servletRequest) {
        var email = request.email().trim().toLowerCase(Locale.ROOT);
        var remoteAddress = servletRequest.getRemoteAddr();
        loginRateLimiter.assertAllowed(remoteAddress, email);
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (AuthenticationException ex) {
            loginRateLimiter.recordFailure(remoteAddress, email);
            throw ex;
        }
        loginRateLimiter.recordSuccess(remoteAddress, email);
        var user = userRepository.findByEmail(email).orElseThrow();
        return new Dtos.AuthResponse(jwtService.generateToken(user), DtoMapper.toUser(user));
    }

    @GetMapping("/me")
    public Dtos.UserResponse me(Authentication authentication) {
        var user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return DtoMapper.toUser(user);
    }
}
