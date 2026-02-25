package com.admin.microservice.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.admin.microservice.external.Job;

import java.util.List;

@Component
public class JobClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${job-service.url:http://localhost:8082}")
    private String jobServiceUrl;

    public List<Job> getAllJobs() {
        String url = jobServiceUrl + "/api/jobs/simple";
        ResponseEntity<List<Job>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<Job>>() {}
        );
        return response.getBody();
    }

    public Job getJobById(Long id) {
        String url = jobServiceUrl + "/api/jobs/" + id;
        return restTemplate.getForObject(url, Job.class);
    }

    public Job createJob(Job job, Long companyId) {
        String url = jobServiceUrl + "/api/admin/jobs?companyId=" + companyId;
        return restTemplate.postForObject(url, job, Job.class);
    }

    public String updateJob(Long id, Job job) {
        String url = jobServiceUrl + "/api/admin/jobs/" + id;
        HttpEntity<Job> request = new HttpEntity<>(job);
        restTemplate.exchange(url, HttpMethod.PUT, request, String.class);
        return "Job updated successfully";
    }

    public String deleteJob(Long id) {
        String url = jobServiceUrl + "/api/admin/jobs/" + id;
        restTemplate.delete(url);
        return "Job deleted successfully";
    }
}
















