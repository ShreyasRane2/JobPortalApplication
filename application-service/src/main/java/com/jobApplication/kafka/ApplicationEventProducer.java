package com.jobApplication.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.jobApplication.dto.JobApplicationEvent;
import com.jobApplication.model.Application;
import com.jobApplication.client.UserDTO;
import com.jobApplication.client.JobDTO;
import com.jobApplication.client.UserServiceClient;
import com.jobApplication.client.JobServiceClient;

@Service
public class ApplicationEventProducer {
    
    private static final Logger logger = LoggerFactory.getLogger(ApplicationEventProducer.class);
    private static final String TOPIC = "job-application-events";
    
    @Autowired// CRITICAL: required = false
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    @Autowired
    private JobServiceClient jobServiceClient;
    
    public void publishJobApplicationEvent(Application application) {
        if (kafkaTemplate == null) {
            logger.warn("⚠️ Kafka not available - skipping event");
            return;
        }
        
        try {
            // Fetch user and job details
            UserDTO user = userServiceClient.getUserById(application.getApplicantId());
            JobDTO job = jobServiceClient.getJobById(application.getJobId());
            
            // Build event
            JobApplicationEvent event = new JobApplicationEvent();
            event.setUserId(application.getApplicantId());
            event.setJobId(application.getJobId());
            event.setUserName(user.getFullName());  // Use fullName!
            event.setJobTitle(job.getTitle());
            event.setCompanyName(job.getEmployerEmail());  // Use employerEmail as company identifier
            event.setMessage("Your application for " + job.getTitle() + 
                           " has been submitted successfully!");
            
            // Send to Kafka
            kafkaTemplate.send(TOPIC, event);
            logger.info("========================================");
            logger.info("✅ KAFKA EVENT PUBLISHED!");
            logger.info("   Topic: {}", TOPIC);
            logger.info("   User: {} (ID: {})", event.getUserName(), event.getUserId());
            logger.info("   Job: {} (ID: {})", event.getJobTitle(), event.getJobId());
            logger.info("   Message: {}", event.getMessage());
            logger.info("========================================");
            
        } catch (Exception e) {
            logger.warn("⚠️ Failed to publish event: {}", e.getMessage());
            // Don't throw - let application continue
        }
    }
}
