package com.job.microservice.kafka;

import com.job.microservice.dto.JobEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class JobEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public JobEventProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishJobEvent(JobEvent jobEvent) {
        log.info("Publishing job event to Kafka topic: {}", jobEvent);
        
        Message<JobEvent> message = MessageBuilder
                .withPayload(jobEvent)
                .setHeader(KafkaHeaders.TOPIC, "job-events-topic")
                .setHeader("eventType", jobEvent.getEventType())
                .build();
        
        kafkaTemplate.send(message);
        log.info("Job event published successfully: {}", jobEvent.getEventId());
    }

    public void publishJobCreated(Long jobId, Long companyId, String jobTitle) {
        JobEvent jobEvent = new JobEvent();
        jobEvent.setEventType("JOB_CREATED");
        jobEvent.setJobId(jobId);
        jobEvent.setCompanyId(companyId);
        jobEvent.setJobTitle(jobTitle);
        jobEvent.setAction("CREATE");
        jobEvent.setTimestamp(String.valueOf(System.currentTimeMillis()));
        jobEvent.setStatus("ACTIVE");

        publishJobEvent(jobEvent);
    }

    public void publishJobUpdated(Long jobId, Long companyId, String jobTitle) {
        JobEvent jobEvent = new JobEvent();
        jobEvent.setEventType("JOB_UPDATED");
        jobEvent.setJobId(jobId);
        jobEvent.setCompanyId(companyId);
        jobEvent.setJobTitle(jobTitle);
        jobEvent.setAction("UPDATE");
        jobEvent.setTimestamp(String.valueOf(System.currentTimeMillis()));
        jobEvent.setStatus("UPDATED");

        publishJobEvent(jobEvent);
    }

    public void publishJobDeleted(Long jobId, Long companyId, String jobTitle) {
        JobEvent jobEvent = new JobEvent();
        jobEvent.setEventType("JOB_DELETED");
        jobEvent.setJobId(jobId);
        jobEvent.setCompanyId(companyId);
        jobEvent.setJobTitle(jobTitle);
        jobEvent.setAction("DELETE");
        jobEvent.setTimestamp(String.valueOf(System.currentTimeMillis()));
        jobEvent.setStatus("DELETED");

        publishJobEvent(jobEvent);
    }
}
