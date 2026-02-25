package com.job.microservice.mapper;

import java.util.List;
import com.job.microservice.entity.Job;
import com.job.microservice.dto.JobDTO;
import com.job.microservice.external.Company;

public class JobMapper {

    public static JobDTO mapToJobWithCompanyDTO(Job job, Company company)
    {
        JobDTO jobWithCompanyDTO = new JobDTO();
        jobWithCompanyDTO.setId(job.getId());
        jobWithCompanyDTO.setTitle(job.getTitle());
        jobWithCompanyDTO.setCompanyName(job.getCompanyName());
        jobWithCompanyDTO.setDescription(job.getDescription());
        jobWithCompanyDTO.setExperience(job.getExperience());
        jobWithCompanyDTO.setLocation(job.getLocation());
        jobWithCompanyDTO.setMinSalary(job.getMinSalary());
        jobWithCompanyDTO.setMaxSalary(job.getMaxSalary());
        jobWithCompanyDTO.setKeySkills(job.getKeySkills());
        jobWithCompanyDTO.setStatus(job.getStatus() != null ? job.getStatus().toString() : null);
        jobWithCompanyDTO.setWorkMode(job.getWorkMode() != null ? job.getWorkMode().toString() : null);
        jobWithCompanyDTO.setJobType(job.getJobType() != null ? job.getJobType().toString() : null);
        jobWithCompanyDTO.setCompanyId(job.getCompanyId());
        return jobWithCompanyDTO;
    }

}