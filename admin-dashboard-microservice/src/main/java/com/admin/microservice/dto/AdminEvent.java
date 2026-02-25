package com.admin.microservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminEvent {

    private String eventId;
    private String eventType;
    private String description;
    private String userId;
    private String timestamp;
    private String action;
    private String targetResource;
    private String status;
}
