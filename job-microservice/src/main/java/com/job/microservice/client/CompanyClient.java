package com.job.microservice.client;

import com.job.microservice.external.Company;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "company-service", url = "${company-service.url}")
public interface CompanyClient {
    
    @GetMapping("/api/companies/{id}")
    Company getCompany(@PathVariable("id") Long companyId);
}
