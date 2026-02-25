package com.admin.microservice.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.admin.microservice.client.JobClient;
import com.admin.microservice.client.JobApplicationClient;
import com.admin.microservice.client.UserClient;
import com.admin.microservice.external.Job;
import com.admin.microservice.external.JobApplication;
import com.admin.microservice.external.JOB_APPLICATION_STATUS;
import com.admin.microservice.external.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserClient userClient;

    @Autowired
    private JobClient jobClient;

    @Autowired
    private JobApplicationClient jobApplicationClient;

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userClient.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userClient.findUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userClient.updateUser(id, user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            String response = userClient.deleteUser(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting user with ID {}: {}", id, e.getMessage());
            String errorMessage = "Failed to delete user: ";
            if (e.getMessage() != null && e.getMessage().contains("related data")) {
                errorMessage += "User has related data (profiles, applications, or jobs). Please delete related data first.";
            } else {
                errorMessage += e.getMessage();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
        }
    }

    // Job Management
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        List<Job> jobs = jobClient.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        Job job = jobClient.getJobById(id);
        return ResponseEntity.ok(job);
    }

    @PostMapping("/jobs")
    public ResponseEntity<Job> createJob(@RequestBody Job job, @RequestParam Long companyId) {
        log.info("=== CREATE JOB REQUEST ===");
        log.info("Job Title: {}", job.getTitle());
        log.info("Company Name: {}", job.getCompanyName());
        log.info("Employer Email: {}", job.getEmployerEmail());
        log.info("Company ID: {}", companyId);
        log.info("========================");
        
        Job createdJob = jobClient.createJob(job, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<String> updateJob(@PathVariable Long id, @RequestBody Job job) {
        String response = jobClient.updateJob(id, job);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        String response = jobClient.deleteJob(id);
        return ResponseEntity.ok(response);
    }

    // Job Application Management
    @GetMapping("/applications/job/{jobId}")
    public ResponseEntity<List<JobApplication>> getApplicationsForJob(@PathVariable Long jobId) {
        List<JobApplication> applications = jobApplicationClient.getAllJobApplicationsForJob(jobId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/user/{userId}")
    public ResponseEntity<List<JobApplication>> getApplicationsForUser(@PathVariable Long userId) {
        List<JobApplication> applications = jobApplicationClient.getAllJobApplicationsForUser(userId);
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(@PathVariable Long id, @RequestParam JOB_APPLICATION_STATUS status) {
        JobApplication updated = jobApplicationClient.updateJobApplicationStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // Monitoring and Reports
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            log.info("Fetching dashboard stats...");
            
            List<User> users = null;
            List<Job> jobs = null;
            
            try {
                log.info("Calling User Service...");
                users = userClient.getAllUsers();
                log.info("Got {} users", users != null ? users.size() : 0);
            } catch (Exception e) {
                log.error("Error fetching users from User Service", e);
                users = new ArrayList<>();
            }
            
            try {
                log.info("Calling Job Service...");
                jobs = jobClient.getAllJobs();
                log.info("Got {} jobs", jobs != null ? jobs.size() : 0);
            } catch (Exception e) {
                log.error("Error fetching jobs from Job Service", e);
                jobs = new ArrayList<>();
            }

            Map<String, Object> stats = Map.of(
                "totalUsers", users.size(),
                "totalJobs", jobs.size(),
                "activeJobs", jobs.stream().filter(job -> job.getStatus() == com.admin.microservice.external.JOB_STATUS.OPEN).count()
            );
            
            log.info("Returning stats: {}", stats);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error in getDashboardStats", e);
            Map<String, Object> errorStats = Map.of(
                "totalUsers", 0,
                "totalJobs", 0,
                "activeJobs", 0,
                "error", e.getMessage()
            );
            return ResponseEntity.ok(errorStats);
        }
    }

    @GetMapping("/reports/jobs")
    public ResponseEntity<Map<String, Object>> getJobReport() {
        List<Job> jobs = jobClient.getAllJobs();
        Map<com.admin.microservice.external.JOB_STATUS, Long> statusCount = jobs.stream()
            .collect(Collectors.groupingBy(Job::getStatus, Collectors.counting()));
        Map<String, Object> report = Map.of("jobStatusCounts", statusCount);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/applications")
    public ResponseEntity<Map<String, Object>> getApplicationReport() {
        // Since no all applications endpoint, this is placeholder
        Map<String, Object> report = Map.of("message", "Application report - implement aggregation from all jobs");
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/users")
    public ResponseEntity<Map<String, Object>> getUserReport() {
        List<User> users = userClient.getAllUsers();
        Map<String, Object> report = Map.of("totalUsers", users.size());
        return ResponseEntity.ok(report);
    }

}
















