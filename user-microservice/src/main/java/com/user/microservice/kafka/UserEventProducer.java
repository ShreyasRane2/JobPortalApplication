package com.user.microservice.kafka;

import com.user.microservice.dto.UserRegistrationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class UserEventProducer {
    
    private static final Logger logger = LoggerFactory.getLogger(UserEventProducer.class);
    private static final String TOPIC = "user-registration-email";

    @Autowired(required = false)
    private KafkaTemplate<String, UserRegistrationEvent> kafkaTemplate;

    public void sendUserRegistrationEvent(UserRegistrationEvent event) {
        if (kafkaTemplate == null) {
            logger.warn("⚠️ Kafka is not configured. Skipping user registration event for: {}", event.getEmail());
            return;
        }

        try {
            logger.info("📤 Sending user registration event for: {} to topic: {}", event.getEmail(), TOPIC);
            kafkaTemplate.send(TOPIC, event);
            logger.info("✅ User registration event sent successfully for: {}", event.getEmail());
        } catch (Exception e) {
            logger.error("❌ Failed to send user registration event for {}: {}", event.getEmail(), e.getMessage());
            e.printStackTrace();
            // Don't throw exception - registration should succeed even if notification fails
        }
    }
}
