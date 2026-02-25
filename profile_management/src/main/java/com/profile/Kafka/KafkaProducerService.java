//package com.profile.Kafka;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.kafka.core.KafkaTemplate;
//import org.springframework.stereotype.Service;
//
//@Service
//public class KafkaProducerService {
//
//    private static final String TOPIC = "profile-topic";
//
//    @Autowired
//    private KafkaTemplate<String, String> kafkaTemplate;
//
//    public void sendProfileCreatedEvent(String email) {
//
//        String message = "{ \"event\":\"PROFILE_CREATED\", \"email\":\"" 
//                        + email + "\" }";
//
//        kafkaTemplate.send(TOPIC, message);
//
//        System.out.println("Event sent to Kafka: " + message);
//    }
//}
//

package com.profile.Kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final String RESUME_TOPIC = "resume-events"; // Kafka topic name

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public void sendResumeEvent(String message) {
        kafkaTemplate.send(RESUME_TOPIC, message);
        System.out.println("Sent event to Kafka: " + message);
    }
}
