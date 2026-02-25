package com.job.microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for JWT authentication login request
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    private String userId;
    private String email;
    private String password;
}
