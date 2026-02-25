package com.admin.microservice.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.admin.microservice.external.JobApplication;
import com.admin.microservice.external.JOB_APPLICATION_STATUS;

import java.util.List;

@Component
public class JobApplicationClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${job-application-service.url:http://localhost:8087}")
    private String applicationServiceUrl;

    public List<JobApplication> getAllJobApplicationsForJob(Long jobId) {
        String url = applicationServiceUrl + "/applications/job/" + jobId;
        ResponseEntity<List<JobApplication>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<JobApplication>>() {}
        );
        return response.getBody();
    }

    public List<JobApplication> getAllJobApplicationsForUser(Long userId) {
        String url = applicationServiceUrl + "/applications/user/" + userId;
        ResponseEntity<List<JobApplication>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<JobApplication>>() {}
        );
        return response.getBody();
    }

    public JobApplication getJobApplicationById(Long jobApplicationId) {
        String url = applicationServiceUrl + "/applications/" + jobApplicationId;
        return restTemplate.getForObject(url, JobApplication.class);
    }

    public JobApplication updateJobApplicationStatus(Long jobApplicationId, JOB_APPLICATION_STATUS status) {
        String url = applicationServiceUrl + "/api/admin/applications/" + jobApplicationId + "/status?status=" + status;
        ResponseEntity<JobApplication> response = restTemplate.exchange(
            url,
            HttpMethod.PUT,
            null,
            JobApplication.class
        );
        return response.getBody();
    }
}
















