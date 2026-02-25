package com.job.microservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job.microservice.dto.JobDTO;
import com.job.microservice.entity.Job;
import com.job.microservice.entity.JobResult;
import com.job.microservice.repository.JobRepository;
import com.job.microservice.service.JobService;

@RestController
@RequestMapping("api/jobs")
@CrossOrigin(origins = "http://localhost:3000")
public class JobController {

	private JobService jobService;
	
	@Autowired
	private JobRepository jobRepository;
	
	public JobController(JobService jobService) {
		this.jobService = jobService;
	}

	// Simple test endpoint - no circuit breaker, no company service call
	@GetMapping("/test")
	public ResponseEntity<?> testEndpoint() {
		try {
			List<Job> jobs = jobRepository.findAll();
			return ResponseEntity.ok(jobs);
		} catch (Exception e) {
			return ResponseEntity.ok("Error: " + e.getMessage());
		}
	}

	// Health check endpoint
	@GetMapping("/health")
	public ResponseEntity<String> health() {
		return ResponseEntity.ok("Job Service is running!");
	}
	
	// Simple endpoint without company service dependency
	@GetMapping("/simple")
	public ResponseEntity<?> findAllSimple() {
		try {
			List<Job> jobs = jobService.findAllSimple();
			return ResponseEntity.ok(jobs);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("Error: " + e.getMessage());
		}
	}

	@GetMapping("/")
	public ResponseEntity<List<JobDTO>> findAll()
	{
		return ResponseEntity.ok((jobService.findAll()));
	}

	@GetMapping("/{id}")
	public ResponseEntity<JobResult> getJobById(@PathVariable Long id)
	{
       JobResult jobWithCompanyDTO = jobService.findJobById(id);
	   if(jobWithCompanyDTO!=null)
	   return new ResponseEntity<>(jobWithCompanyDTO,HttpStatus.OK);
	   return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}

    @GetMapping("/search")
    public ResponseEntity<List<JobDTO>> searchJob(@RequestParam String keyword)
	{
		return ResponseEntity.ok((jobService.searchJob(keyword)));
	}

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<List<JobDTO>> getSpecificJobs(@RequestParam boolean isFullTime, @RequestParam boolean isPartTime, @RequestParam boolean isInternship, @PathVariable Long companyId)
	{
		return ResponseEntity.ok(jobService.getSpecificJobs(companyId,isFullTime,isPartTime,isInternship));
	}

}

