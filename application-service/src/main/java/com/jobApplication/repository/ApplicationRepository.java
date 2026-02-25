
package com.jobApplication.repository;

//import com.jobapplication.application_service.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import com.jobApplication.model.Application;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByApplicantId(Long applicantId);
    List<Application> findByJobId(Long jobId);
}