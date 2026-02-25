package com.job.microservice.client;

import com.job.microservice.dto.AuthRequest;
import com.job.microservice.dto.AuthResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Feign Client to communicate with User Microservice
 * This client handles all user-related operations like registration and authentication
 */
@FeignClient(name = "user-service", url = "${user-service.url:http://localhost:5454}")
public interface UserClient {

    /**
     * Register a new user via user-ms
     * 
     * @param authRequest containing email, password, fullName
     * @return AuthResponse from user-ms
     */
    @PostMapping("/api/auth/register")
    ResponseEntity<AuthResponse> register(@RequestBody AuthRequest authRequest);

    /**
     * Login user via user-ms
     * 
     * @param authRequest containing email and password
     * @return AuthResponse from user-ms
     */
    @PostMapping("/api/auth/login")
    ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest);

    /**
     * Validate token via user-ms
     * 
     * @param bearerToken Authorization header with Bearer token
     * @return true if token is valid
     */
    @PostMapping("/api/auth/validate")
    ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String bearerToken);
}
