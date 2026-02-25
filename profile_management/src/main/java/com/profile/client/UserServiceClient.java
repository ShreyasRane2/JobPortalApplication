package com.profile.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UserServiceClient {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${user-service.url}")        
//    reading userservice url from application properties
    private String userServiceUrl;
    
    public UserDTO getUserByEmail(String email, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<UserDTO> response = restTemplate.exchange(
                userServiceUrl + "/api/users/email/" + email,
                HttpMethod.GET,
                entity,
                UserDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user from User Service: " + e.getMessage());
        }
    }
    
    public UserDTO getUserById(Long userId, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<UserDTO> response = restTemplate.exchange(
                userServiceUrl + "/api/users/" + userId,
                HttpMethod.GET,
                entity,
                UserDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user from User Service: " + e.getMessage());
        }
    }
}
