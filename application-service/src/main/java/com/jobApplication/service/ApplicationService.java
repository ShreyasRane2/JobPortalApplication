// src/main/java/com/jobapplication/application_service/service/ApplicationService.java
package com.jobApplication.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jobApplication.model.Application;
import com.jobApplication.repository.ApplicationRepository;
import com.jobApplication.kafka.ApplicationEventProducer;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationService.class);

    @Autowired
    private ApplicationRepository repository;

    @Autowired(required = false)  // CRITICAL: required = false
    private ApplicationEventProducer eventProducer;

    // This method would call User and Job services to verify existence; simplified here
    public Application applyForJob(Application application) {
        application.setApplicationStatus("Applied");
        application.setAppliedDate(LocalDateTime.now());
        
        // Save to database FIRST
        Application savedApplication = repository.save(application);
        
        // Publish event (wrapped in try-catch)
        if (eventProducer != null) {
            try {
                eventProducer.publishJobApplicationEvent(savedApplication);
            } catch (Exception e) {
                logger.warn("⚠️ Event publishing failed: {}", e.getMessage());
                // Continue - application already saved
            }
        }
        
        return savedApplication;
    }

    public Application getApplication(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<Application> getApplicationsByUser(Long userId) {
        return repository.findByApplicantId(userId);
    }

    public List<Application> getApplicationsByJob(Long jobId) {
        return repository.findByJobId(jobId);
    }

    public Application updateApplicationStatus(Long applicationId, String newStatus) {
        Application application = repository.findById(applicationId).orElse(null);
        if (application != null) {
            application.setApplicationStatus(newStatus);
            Application updatedApplication = repository.save(application);
            return updatedApplication;
        }
        return null;
    }
}