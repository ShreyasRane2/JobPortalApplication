package com.admin.microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private String email;
    private String userId;
    private String status;

    public AuthResponse(String message, String status) {
        this.message = message;
        this.status = status;
    }
}
