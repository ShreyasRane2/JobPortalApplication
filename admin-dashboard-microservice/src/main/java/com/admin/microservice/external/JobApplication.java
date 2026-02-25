package com.admin.microservice.external;

import java.time.LocalDateTime;

public class JobApplication {

    private Long jobApplicationId;
    private Long userId;

    private Long jobId;
    private Long companyId;
   
    private JOB_APPLICATION_STATUS status;
    private LocalDateTime appliedDate;

    public Long getJobApplicationId() {
        return jobApplicationId;
    }

    public void setJobApplicationId(Long jobApplicationId) {
        this.jobApplicationId = jobApplicationId;
    }

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

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public JOB_APPLICATION_STATUS getStatus() {
        return status;
    }

    public void setStatus(JOB_APPLICATION_STATUS status) {
        this.status = status;
    }

    public LocalDateTime getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDateTime appliedDate) {
        this.appliedDate = appliedDate;
    }

}
















