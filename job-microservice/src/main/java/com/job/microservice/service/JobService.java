package com.job.microservice.service;

import java.util.List;

import com.job.microservice.dto.JobDTO;
import com.job.microservice.entity.Job;
import com.job.microservice.entity.JobResult;
import com.job.microservice.dto.JOB_STATUS;

public interface JobService {
    List<JobDTO> findAll();
    List<Job> findAllSimple(); // New method without company service dependency
    Job createJob(Job job, Long companyId);
    JobResult findJobById(Long id);
    boolean deleteJobById(Long id);
    boolean updateJobById(Long id, Job updatedJob);
    List<JobDTO> getSpecificJobs(Long companyId, boolean isFullTime, boolean isPartTime, boolean isInternship);
    List<JobDTO> searchJob(String keyword);
    boolean updateJobStatus(Long id, JOB_STATUS status);

}


