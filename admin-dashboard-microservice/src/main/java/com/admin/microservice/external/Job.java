package com.admin.microservice.external;

import java.util.List;

public class Job {

	private long id;
	
	private String title;
	private String description;
	private String minSalary;
	private String maxSalary;
	private String location;
	private Integer experience;
	private Long companyId;
	private String companyName;
	private String employerEmail;
	private List<String> keySkills;

	private WORK_MODE workMode;

	private JOB_STATUS status;
	
	private JOB_TYPE jobType;

	public Job() {}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getMinSalary() {
		return minSalary;
	}

	public void setMinSalary(String minSalary) {
		this.minSalary = minSalary;
	}

	public String getMaxSalary() {
		return maxSalary;
	}

	public void setMaxSalary(String maxSalary) {
		this.maxSalary = maxSalary;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public Integer getExperience() {
		return experience;
	}

	public void setExperience(Integer experience) {
		this.experience = experience;
	}

	public Long getCompanyId() {
		return companyId;
	}

	public void setCompanyId(Long companyId) {
		this.companyId = companyId;
	}

	public List<String> getKeySkills() {
		return keySkills;
	}

	public void setKeySkills(List<String> keySkills) {
		this.keySkills = keySkills;
	}

	public WORK_MODE getWorkMode() {
		return workMode;
	}

	public void setWorkMode(WORK_MODE workMode) {
		this.workMode = workMode;
	}

	public JOB_STATUS getStatus() {
		return status;
	}

	public void setStatus(JOB_STATUS status) {
		this.status = status;
	}

	public JOB_TYPE getJobType() {
		return jobType;
	}

	public void setJobType(JOB_TYPE jobType) {
		this.jobType = jobType;
	}

	public String getCompanyName() {
		return companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public String getEmployerEmail() {
		return employerEmail;
	}

	public void setEmployerEmail(String employerEmail) {
		this.employerEmail = employerEmail;
	}

}
















