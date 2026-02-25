package com.job.microservice.repository;

import com.job.microservice.entity.Job;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job,Long> {

    List<Job> findByCompanyId(Long CompanyId);

    @Query("SELECT j FROM Job j WHERE j.title LIKE %:keyword% OR j.description LIKE %:keyword% OR j.location LIKE %:keyword% OR j.experience LIKE %:keyword%")
    List<Job> searchJob(@Param("keyword") String keyword);

    
}

