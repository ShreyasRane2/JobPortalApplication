package com.admin.microservice.controller;

import com.admin.microservice.dto.AuthRequest;
import com.admin.microservice.dto.AuthResponse;
import com.admin.microservice.security.JwtProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private JwtProvider jwtProvider;

    /**
     * Generate JWT token for admin user
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest) {
        log.info("Login request for user: {}", authRequest.getEmail());
        
        // In a real scenario, you would validate credentials against database
        // For now, we'll generate token for any valid request
        if (authRequest.getEmail() == null || authRequest.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String token = jwtProvider.generateToken(authRequest.getUserId(), authRequest.getEmail());
        
        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(token);
        authResponse.setMessage("Login successful");
        authResponse.setEmail(authRequest.getEmail());
        authResponse.setUserId(authRequest.getUserId());

        return ResponseEntity.ok(authResponse);
    }

    /**
     * Validate JWT token
     */
    @PostMapping("/validate")
    public ResponseEntity<AuthResponse> validateToken(@RequestHeader("Authorization") String bearerToken) {
        log.info("Token validation request");
        
        String token = jwtProvider.getTokenFromHeader(bearerToken);
        if (token == null || !jwtProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Invalid token", "error"));
        }

        String userId = jwtProvider.getUserIdFromToken(token);
        String email = jwtProvider.getEmailFromToken(token);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(token);
        authResponse.setMessage("Token is valid");
        authResponse.setEmail(email);
        authResponse.setUserId(userId);

        return ResponseEntity.ok(authResponse);
    }

    /**
     * Get current user info from JWT token
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        log.info("Get current user request");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = authentication.getName();
        String email = (String) authentication.getDetails();

        AuthResponse authResponse = new AuthResponse();
        authResponse.setUserId(userId);
        authResponse.setEmail(email);
        authResponse.setMessage("User details retrieved");

        return ResponseEntity.ok(authResponse);
    }
}
