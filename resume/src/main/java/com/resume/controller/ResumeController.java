package com.resume.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.resume.entity.Resume;
import com.resume.service.ResumeService;

@RestController
@RequestMapping("/resume")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    // ================= UPLOAD =================
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email,
            @RequestParam("skills") String skills,
            @RequestParam("experience") int experience) {

        try {
            Resume resume = resumeService.uploadResume(file, email, skills, experience);
            return ResponseEntity.ok(resume);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Error uploading resume: " + e.getMessage());
        }
    }

    // ================= GET =================
    @GetMapping
    public ResponseEntity<List<Resume>> getResumes(@RequestParam String email) {
        return ResponseEntity.ok(resumeService.getResumesByEmail(email));
    }
    @GetMapping("/all")
    public List<Resume> getAll() {
        return resumeService.getAll();
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResume(
            @PathVariable Long id,
            @RequestParam String email) {

        boolean deleted = resumeService.deleteResume(id, email);

        if (deleted) {
            return ResponseEntity.ok("Resume deleted successfully");
        } else {
            return ResponseEntity.badRequest()
                    .body("Resume not found or unauthorized");
        }
    }

    // ================= DOWNLOAD =================
    @GetMapping("/download/{id}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadResume(
            @PathVariable Long id,
            @RequestParam String email) {
        
        try {
            File file = resumeService.getResumeFile(id, email);
            Resume resume = resumeService.getResumeById(id);
            
            org.springframework.core.io.Resource resource = 
                new org.springframework.core.io.FileSystemResource(file);
            
            return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + resume.getFileName() + "\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
                
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ================= VIEW/PREVIEW =================
    @GetMapping("/view/{id}")
    public ResponseEntity<org.springframework.core.io.Resource> viewResume(
            @PathVariable Long id,
            @RequestParam String email) {
        
        try {
            File file = resumeService.getResumeFile(id, email);
            Resume resume = resumeService.getResumeById(id);
            
            org.springframework.core.io.Resource resource = 
                new org.springframework.core.io.FileSystemResource(file);
            
            // Determine content type based on file extension
            String contentType = "application/pdf";
            if (resume.getFileName().endsWith(".doc")) {
                contentType = "application/msword";
            } else if (resume.getFileName().endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            }
            
            return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                        "inline; filename=\"" + resume.getFileName() + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(resource);
                
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
