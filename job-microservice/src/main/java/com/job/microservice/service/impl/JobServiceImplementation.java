package com.job.microservice.service.impl;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.job.microservice.dto.JOB_STATUS;
import com.job.microservice.entity.Job;
import com.job.microservice.repository.JobRepository;
import com.job.microservice.entity.JobResult;
import com.job.microservice.service.JobService;
import com.job.microservice.client.CompanyClient;
import com.job.microservice.dto.JobDTO;
import com.job.microservice.external.Company;
import com.job.microservice.mapper.JobMapper;
 
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
 
@Service
public class JobServiceImplementation implements JobService {

   private JobRepository jobRepository;

   private CompanyClient companyClient;

    public JobServiceImplementation(JobRepository jobRepository, CompanyClient companyClient) {
    this.jobRepository = jobRepository;
    this.companyClient = companyClient;
}
 
    @Override
    @Retry(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    @CircuitBreaker(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    @RateLimiter(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    public List<JobDTO> findAll() {
        List<Job> jobs = jobRepository.findAll();
        return jobs.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Job> findAllSimple() {
        // Simple method without circuit breaker or company service dependency
        return jobRepository.findAll();
    }
 
    public List<String> companyBreakerFallBack(Throwable throwable) {
        List<String> errList = new ArrayList<>();
        errList.add("😥 Uh-oh! We ran into an issue...The service is currently unavailable. Our team is working on resolving the issue as quickly as possible. Please try again later. 🛠️");
        return errList;
    }
   
    private JobDTO convertToDto(Job job)
    {
        Company company = companyClient.getCompany(job.getCompanyId());
        JobDTO jobWithCompanyDTO = JobMapper.mapToJobWithCompanyDTO(job, company);
        return jobWithCompanyDTO;
    }
 
    @Override
    public boolean deleteJobById(Long id) {
        if(jobRepository.existsById(id))
        {
            jobRepository.deleteById(id);
            return true;
        }
        else{
            return false;
        }
    }
 
    @Override
    public boolean updateJobById(Long id, Job updatedJob) {
        Optional<Job> jobOptional = jobRepository.findById(id);
        {
            if(jobOptional.isPresent())
            {
                Job job = jobOptional.get();
                if(updatedJob.getTitle()!=null)
                {
                    job.setTitle(updatedJob.getTitle());
                }
                if(updatedJob.getDescription()!=null)
                {
                    job.setDescription(updatedJob.getDescription());
                }
                if(updatedJob.getMinSalary()!=null)
                {
                job.setMinSalary(updatedJob.getMinSalary());
                }
                if(updatedJob.getMaxSalary()!=null)
                {
                    job.setMaxSalary(updatedJob.getMaxSalary());
                }
                if(updatedJob.getLocation()!=null)
                {
                    job.setLocation(updatedJob.getLocation());
                }
                if(updatedJob.getExperience()!=null)
                {
                    job.setExperience(updatedJob.getExperience());
                }
                if(updatedJob.getWorkMode()!=null)
                {
                    job.setWorkMode(updatedJob.getWorkMode());
                }
                if(updatedJob.getKeySkills()!=null)
                {
                    job.setKeySkills(updatedJob.getKeySkills());
                }
                if(updatedJob.getJobType()!=null)
                {
                    job.setJobType(updatedJob.getJobType());
                }
                jobRepository.save(job);
                return true;
            }  
        }
       return false;
    }
 
    @Override
    public Job createJob(Job job,Long companyId) {
        job.setCompanyId(companyId);
        
        // Validate that employerEmail is set
        if (job.getEmployerEmail() == null || job.getEmployerEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Employer email is required when creating a job");
        }
        
        jobRepository.save(job);
        return job;
    }
 
    @Override
    @Retry(name = "companyBreaker", fallbackMethod = "companyBreakerFallBackForId")
    @CircuitBreaker(name = "companyBreaker", fallbackMethod = "companyBreakerFallBackForId")
    @RateLimiter(name = "companyBreaker", fallbackMethod = "companyBreakerFallBackForId")
    public JobResult findJobById(Long id) {
        Job job = jobRepository.findById(id).orElse(null);
        if (job == null) {
            return new JobResult("Job not found");
        }
        JobDTO jobDTO = convertToDto(job);
        return new JobResult(jobDTO);
    }
 
    public JobResult companyBreakerFallBackForId(Long id, Throwable throwable) {
        String errorMessage = "😥 Uh-oh! We ran into an issue...The service is currently unavailable. Our team is working on resolving the issue as quickly as possible. Please try again later. 🛠️";
        return new JobResult(errorMessage);
    }    
 
    @Override
    @Retry(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    @CircuitBreaker(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    @RateLimiter(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    public List<JobDTO> getSpecificJobs(Long companyId, boolean isFullTime, boolean isPartTime, boolean isInternship) {
        List<Job> jobs = jobRepository.findByCompanyId(companyId);
        if (isFullTime) {
            jobs = filterByFullTime(jobs, isFullTime);
        }
        if (isPartTime) {
            jobs = filterByPartTime(jobs, isPartTime);
        }
        if (isInternship) {
            jobs = filterByInternship(jobs, isInternship);
        }
        return jobs.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
 
    private List<Job> filterByInternship(List<Job> jobs, boolean isInternship) {
        return jobs.stream().filter(job->job.isInternship()==true).collect(Collectors.toList());
    }
    private List<Job> filterByPartTime(List<Job> jobs, boolean isPartTime) {
        return jobs.stream().filter(job->job.isFullTime()==false).collect(Collectors.toList());
    }
 
    private List<Job> filterByFullTime(List<Job> jobs, boolean isFullTime) {
        return jobs.stream().filter(job->job.isFullTime()==true).collect(Collectors.toList());
    }
 
    @Override
    @Retry(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    @CircuitBreaker(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    @RateLimiter(name = "companyBreaker", fallbackMethod = "companyBreakerFallBack")
    public List<JobDTO> searchJob(String keyword) {
        List<Job> jobs = jobRepository.searchJob(keyword);
        return jobs.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
 
    @Override
    public boolean updateJobStatus(Long id, JOB_STATUS status) {
        Optional<Job> jobOptional = jobRepository.findById(id);
        if(jobOptional.isPresent())
        {
            Job job = jobOptional.get();
            job.setStatus(status);
            return true;
        }
        return false;
    }
}
 
 