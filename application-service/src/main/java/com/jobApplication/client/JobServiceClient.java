package com.jobApplication.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class JobServiceClient {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${job-service.url:http://localhost:8082}")
    private String jobServiceUrl;
    
    // Method without JWT for internal service-to-service calls
    public JobDTO getJobById(Long jobId) {
        try {
            ResponseEntity<JobDTO> response = restTemplate.getForEntity(
                jobServiceUrl + "/job/" + jobId,
                JobDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("⚠️ Failed to fetch job " + jobId + ": " + e.getMessage());
            // Return minimal job data to prevent notification failure
            JobDTO fallback = new JobDTO();
            fallback.setId(jobId);
            fallback.setTitle("Job #" + jobId);
            fallback.setEmployerEmail("employer@company.com");
            fallback.setLocation("Location");
            fallback.setDescription("Job description");
            return fallback;
        }
    }
    
    // Method with JWT for authenticated calls
    public JobDTO getJobById(Long jobId, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<JobDTO> response = restTemplate.exchange(
                jobServiceUrl + "/job/" + jobId,
                HttpMethod.GET,
                entity,
                JobDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch job from Job Service: " + e.getMessage());
        }
    }
    
    public JobDTO[] getAllJobs(String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<JobDTO[]> response = restTemplate.exchange(
                jobServiceUrl + "/job",
                HttpMethod.GET,
                entity,
                JobDTO[].class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch jobs from Job Service: " + e.getMessage());
        }
    }
}
