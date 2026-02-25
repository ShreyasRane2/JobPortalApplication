package com.job.microservice.external;
 
public class Company {
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String companyLogo;
    private boolean hiring;
   
    public Long getId() {
        return id;
    }
 
    public void setId(Long id) {
        this.id = id;
    }
 
    public String getName() {
        return name;
    }
 
    public void setName(String name) {
        this.name = name;
    }
 
    public String getDescription() {
        return description;
    }
 
    public void setDescription(String description) {
        this.description = description;
    }
 
    public String getCompanyLogo() {
        return companyLogo;
    }
 
    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }
 
    public boolean isHiring() {
        return hiring;
    }
 
    public void setHiring(boolean hiring) {
        this.hiring = hiring;
    }
 
    public Long getOwnerId() {
        return ownerId;
    }
 
    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
 