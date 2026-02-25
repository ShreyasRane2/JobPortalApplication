package com.resume.Kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    @KafkaListener(topics = "resume-events", groupId = "resume-group")
    public void consume(String message) {

        System.out.println("Received event from Profile Service: " + message);

        // Future logic:
        // - Create resume metadata
        // - Initialize resume folder
        // - Store default resume record
    }
}
