package com.job.microservice.kafka;

import com.job.microservice.dto.JobEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class JobEventConsumer {

    @KafkaListener(
        topics = "job-events-topic",
        groupId = "job-service-group"
    )
    public void consumeJobEvent(JobEvent jobEvent) {
        log.info("Consuming job event from Kafka topic: {}", jobEvent);
        
        // Process job event based on event type
        switch (jobEvent.getEventType()) {
            case "JOB_CREATED":
                handleJobCreated(jobEvent);
                break;
            case "JOB_UPDATED":
                handleJobUpdated(jobEvent);
                break;
            case "JOB_DELETED":
                handleJobDeleted(jobEvent);
                break;
            case "JOB_PUBLISHED":
                handleJobPublished(jobEvent);
                break;
            case "JOB_CLOSED":
                handleJobClosed(jobEvent);
                break;
            default:
                log.warn("Unknown job event type: {}", jobEvent.getEventType());
        }
        
        log.info("Job event processed successfully: {}", jobEvent.getEventId());
    }

    private void handleJobCreated(JobEvent event) {
        log.info("Job Created - JobId: {}, CompanyId: {}, Title: {}", 
            event.getJobId(), event.getCompanyId(), event.getJobTitle());
        // Add job creation notification or logging logic here
    }

    private void handleJobUpdated(JobEvent event) {
        log.info("Job Updated - JobId: {}, Title: {}", 
            event.getJobId(), event.getJobTitle());
        // Add job update notification or logging logic here
    }

    private void handleJobDeleted(JobEvent event) {
        log.info("Job Deleted - JobId: {}, CompanyId: {}", 
            event.getJobId(), event.getCompanyId());
        // Add job deletion logging logic here
    }

    private void handleJobPublished(JobEvent event) {
        log.info("Job Published - JobId: {}, Title: {}, Status: {}", 
            event.getJobId(), event.getJobTitle(), event.getStatus());
        // Add job publication logic here
    }

    private void handleJobClosed(JobEvent event) {
        log.info("Job Closed - JobId: {}, Title: {}", 
            event.getJobId(), event.getJobTitle());
        // Add job closing logic here
    }
}
