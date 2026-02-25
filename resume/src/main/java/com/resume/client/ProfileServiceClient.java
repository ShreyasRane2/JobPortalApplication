package com.resume.client;

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
    
    public ProfileDTO getCandidateProfile(String email, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<ProfileDTO> response = restTemplate.exchange(
                profileServiceUrl + "/profile/candidate/" + email,
                HttpMethod.GET,
                entity,
                ProfileDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch candidate profile from Profile Service: " + e.getMessage());
        }
    }
    
    public ProfileDTO getProfileByUserId(Long userId, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<ProfileDTO> response = restTemplate.exchange(
                profileServiceUrl + "/profile/user/" + userId,
                HttpMethod.GET,
                entity,
                ProfileDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch profile from Profile Service: " + e.getMessage());
        }
    }
}
