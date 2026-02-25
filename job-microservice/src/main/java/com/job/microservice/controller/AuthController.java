package com.job.microservice.controller;

import com.job.microservice.client.UserClient;
import com.job.microservice.dto.AuthRequest;
import com.job.microservice.dto.AuthResponse;
import com.job.microservice.security.JwtProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller for Job Microservice
 * Delegates user registration/authentication to user-ms
 * Generates JWT tokens for job-ms protected endpoints
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @Autowired
    private JwtProvider jwtProvider;
    
    @Autowired
    private UserClient userClient;

    /**
     * Register a new user (delegates to user-ms)
     * 
     * @param authRequest containing email, password, fullName
     * @return AuthResponse with JWT token for job-ms
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest authRequest) {
        try {
            log.info("Register request for user: {}", authRequest.getEmail());
            
            // Validate input
            if (authRequest.getEmail() == null || authRequest.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponse("", "Email is required"));
            }
            if (authRequest.getPassword() == null || authRequest.getPassword().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponse("", "Password is required"));
            }
            
            // Call user-ms to register user
            ResponseEntity<AuthResponse> userMsResponse = userClient.register(authRequest);
            
            if (!userMsResponse.getStatusCode().is2xxSuccessful()) {
                log.warn("User registration failed in user-ms");
                return userMsResponse;
            }
            
            AuthResponse userResponse = userMsResponse.getBody();
            
            // Generate JWT token for job-ms with user info
            String token = jwtProvider.generateToken(userResponse.getUserId(), userResponse.getEmail());
            
            AuthResponse jobMsResponse = new AuthResponse();
            jobMsResponse.setToken(token);
            jobMsResponse.setType("Bearer");
            jobMsResponse.setMessage("User registered successfully");
            jobMsResponse.setEmail(userResponse.getEmail());
            jobMsResponse.setUserId(userResponse.getUserId());
            
            log.info("User registered and job-ms token generated: {}", authRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(jobMsResponse);
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("", "Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Login user (delegates to user-ms for authentication)
     * 
     * @param authRequest containing email and password
     * @return AuthResponse with JWT token for job-ms
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest) {
        try {
            log.info("Login request for user: {}", authRequest.getEmail());
            
            // Validate input
            if (authRequest.getEmail() == null || authRequest.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponse("", "Email is required"));
            }
            if (authRequest.getPassword() == null || authRequest.getPassword().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponse("", "Password is required"));
            }
            
            // Call user-ms to authenticate user
            ResponseEntity<AuthResponse> userMsResponse = userClient.login(authRequest);
            
            if (!userMsResponse.getStatusCode().is2xxSuccessful()) {
                log.warn("User authentication failed in user-ms");
                return userMsResponse;
            }
            
            AuthResponse userResponse = userMsResponse.getBody();
            
            // Generate JWT token for job-ms with user info
            String token = jwtProvider.generateToken(userResponse.getUserId(), userResponse.getEmail());
            
            AuthResponse jobMsResponse = new AuthResponse();
            jobMsResponse.setToken(token);
            jobMsResponse.setType("Bearer");
            jobMsResponse.setMessage("Login successful");
            jobMsResponse.setEmail(userResponse.getEmail());
            jobMsResponse.setUserId(userResponse.getUserId());
            
            log.info("User logged in and job-ms token generated: {}", authRequest.getEmail());
            return ResponseEntity.ok(jobMsResponse);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("", "Login failed: " + e.getMessage()));
        }
    }

    /**
     * Validate JWT token
     * 
     * @param bearerToken Authorization header with Bearer token
     * @return true if token is valid, false otherwise
     */
    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String bearerToken) {
        try {
            log.info("Token validation request");
            
            String token = jwtProvider.getTokenFromHeader(bearerToken);
            if (token != null && jwtProvider.validateToken(token)) {
                log.info("Token is valid");
                return ResponseEntity.ok(true);
            }
            log.warn("Token is invalid");
            return ResponseEntity.ok(false);
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return ResponseEntity.ok(false);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/public/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Job Service is running");
    }
}
