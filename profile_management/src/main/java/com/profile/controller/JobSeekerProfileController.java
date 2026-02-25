package com.profile.controller;

import com.profile.entity.JobSeekerProfile;

import com.profile.service.JobSeekerProfileService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/profile/jobseeker")
@CrossOrigin(origins = "http://localhost:3000")
public class JobSeekerProfileController {

    @Autowired
    private JobSeekerProfileService profileService;

//    @Autowired
//    private ResumeService resumeService;

    @PostMapping
    public JobSeekerProfile saveProfile(@RequestBody JobSeekerProfile profile) {
        return profileService.saveProfile(profile);
    }

    @GetMapping("/{email}")
    public JobSeekerProfile getProfile(@PathVariable String email) {
        return profileService.getProfile(email).orElse(null);
    }

    @DeleteMapping("/{email}")
    public String deleteProfile(@PathVariable String email) {
        return profileService.deleteProfile(email) ? "Deleted" : "Not Found";
    }
    
    @PutMapping("/{email}")
    public org.springframework.http.ResponseEntity<JobSeekerProfile> updateProfile(
            @PathVariable String email, 
            @RequestBody JobSeekerProfile profile) {
        try {
            JobSeekerProfile updated = profileService.updateProfile(email, profile);
            return org.springframework.http.ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
    }
}
//    @PostMapping("/resume/upload")
//    public Resume uploadResume(@RequestParam("file") MultipartFile file,
//                               @RequestParam("email") String email,
//                               @RequestParam("skills") String skills,
//                               @RequestParam("experience") int exp) throws IOException {
//        Resume r = new Resume();
//        r.setSkills(skills);
//        r.setExperience(exp);
//        return resumeService.uploadResume(file, r, email);
//    }
//
//    @GetMapping("/resumes/{email}")
//    public List<Resume> getResumes(@PathVariable String email) {
//        return resumeService.getResumes(email);
//    }
//
//    @DeleteMapping("/resume/{id}")
//    public String deleteResume(@PathVariable Long id,
//                               @RequestParam("email") String email) {
//        return resumeService.deleteResume(id, email) ? "Deleted" : "Not Found";
//    }
//}
