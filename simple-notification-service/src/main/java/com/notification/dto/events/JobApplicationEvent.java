package com.notification.dto.events;

public class JobApplicationEvent {
    private Long userId;
    private Long jobId;
    private String userName;
    private String jobTitle;
    private String companyName;
    private String message;
    
    // No-arg constructor (REQUIRED for Kafka deserialization)
    public JobApplicationEvent() {}
    
    // Getters and Setters
    public Long getUserId() { 
        return userId; 
    }
    
    public void setUserId(Long userId) { 
        this.userId = userId; 
    }
    
    public Long getJobId() { 
        return jobId; 
    }
    
    public void setJobId(Long jobId) { 
        this.jobId = jobId; 
    }
    
    public String getUserName() { 
        return userName; 
    }
    
    public void setUserName(String userName) { 
        this.userName = userName; 
    }
    
    public String getJobTitle() { 
        return jobTitle; 
    }
    
    public void setJobTitle(String jobTitle) { 
        this.jobTitle = jobTitle; 
    }
    
    public String getCompanyName() { 
        return companyName; 
    }
    
    public void setCompanyName(String companyName) { 
        this.companyName = companyName; 
    }
    
    public String getMessage() { 
        return message; 
    }
    
    public void setMessage(String message) { 
        this.message = message; 
    }
}
