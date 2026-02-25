package com.job.microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobEvent {

    private String eventId;
    private String eventType;
    private String description;
    private Long jobId;
    private Long companyId;
    private String timestamp;
    private String action;
    private String jobTitle;
    private String status;
}
