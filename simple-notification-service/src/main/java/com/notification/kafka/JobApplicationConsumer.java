package com.notification.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.notification.dto.events.JobApplicationEvent;
import com.notification.entity.Notification;
import com.notification.service.NotificationService;

import java.time.LocalDateTime;

@Service
public class JobApplicationConsumer {
    
    private static final Logger logger = LoggerFactory.getLogger(JobApplicationConsumer.class);
    
    @Autowired
    private NotificationService notificationService;
    
    @KafkaListener(
        topics = "job-application-events",
        groupId = "notification-group"
    )
    public void handleJobApplication(JobApplicationEvent event) {
        try {
            logger.info("========================================");
            logger.info("📨 KAFKA EVENT RECEIVED!");
            logger.info("   From Topic: job-application-events");
            logger.info("   User: {} (ID: {})", event.getUserName(), event.getUserId());
            logger.info("   Job: {} (ID: {})", event.getJobTitle(), event.getJobId());
            logger.info("   Company: {}", event.getCompanyName());
            logger.info("========================================");
            
            // Create notification with correct mapping
            Notification notification = new Notification();
            notification.setRecipientId(event.getUserId());
            notification.setRecipientEmail(event.getCompanyName()); // or event.getUserEmail() if needed
            notification.setNotificationType("JOB_APPLICATION");
            notification.setSubject("Job Application Submitted");
            notification.setMessage(event.getMessage());
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            
            // Save to database
            notificationService.createNotification(notification);
            
            logger.info("✅ Notification created via KAFKA for user: {}", event.getUserId());
            logger.info("========================================");
            
        } catch (Exception e) {
            logger.error("❌ Error processing event: {}", e.getMessage());
            // Don't throw - prevents consumer crash
        }
    }
}
