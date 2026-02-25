package com.job.microservice.entity;
import com.job.microservice.dto.WORK_MODE;
import com.job.microservice.dto.JOB_STATUS;
import com.job.microservice.dto.JOB_TYPE;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Job {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	private String title;
	private String companyName;
	private String description;
	private String minSalary;
	private String maxSalary;
	private String location;
	private Integer experience;
	private Long companyId;
	private List<String> keySkills;
	private String employerEmail;  // ADD THIS FIELD

	@Enumerated(EnumType.STRING)
	private WORK_MODE workMode;

	@Enumerated(EnumType.STRING)
	private JOB_STATUS status;
	
	@Enumerated(EnumType.STRING)
	private JOB_TYPE jobType;

	public Job()
	{

	}

	public Job(long id, String title, String companyName, String description, String minSalary, String maxSalary, String location,
			Integer experience, Long companyId, List<String> keySkills, String employerEmail, WORK_MODE workMode, JOB_STATUS status,
			JOB_TYPE jobType) {
		this.id = id;
		this.title = title;
		this.companyName = companyName;
		this.description = description;
		this.minSalary = minSalary;
		this.maxSalary = maxSalary;
		this.location = location;
		this.experience = experience;
		this.companyId = companyId;
		this.keySkills = keySkills;
		this.employerEmail = employerEmail;
		this.workMode = workMode;
		this.status = status;
		this.jobType = jobType;
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

	public String getEmployerEmail() {
		return employerEmail;
	}

	public void setEmployerEmail(String employerEmail) {
		this.employerEmail = employerEmail;
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
	
	public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public JOB_TYPE getJobType() {
        return jobType;
    }

    public void setJobType(JOB_TYPE jobType) {
        this.jobType = jobType;
    }

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

	public String getCompanyName() {
		return companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
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

    public boolean isFullTime() {
        return jobType == JOB_TYPE.FULL_TIME;
    }

    public boolean isInternship() {
        return jobType == JOB_TYPE.INTERNSHIP;
    }
	
}

