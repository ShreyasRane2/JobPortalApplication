package com.job.microservice.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ProfileServiceClient {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${profile-service.url}")
    private String profileServiceUrl;
    
    public EmployerProfileDTO getEmployerProfile(String email, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<EmployerProfileDTO> response = restTemplate.exchange(
                profileServiceUrl + "/profile/employer/" + email,
                HttpMethod.GET,
                entity,
                EmployerProfileDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch employer profile from Profile Service: " + e.getMessage());
        }
    }
    
    public EmployerProfileDTO getEmployerProfileById(Long profileId, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<EmployerProfileDTO> response = restTemplate.exchange(
                profileServiceUrl + "/profile/employer/id/" + profileId,
                HttpMethod.GET,
                entity,
                EmployerProfileDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch employer profile from Profile Service: " + e.getMessage());
        }
    }
}
