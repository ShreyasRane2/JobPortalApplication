package com.resume.service;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.resume.Repository.ResumeRepository;
import com.resume.entity.Resume;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepo;

    // ✅ Absolute directory (safe)
    private final String uploadDir = "C:/profile-service-uploads";

    // ================= UPLOAD =================
    public Resume uploadResume(MultipartFile file, String email, String skills, int experience)
            throws IOException {

        // Create folder if missing
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // Unique filename
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String filePath = uploadDir + File.separator + fileName;

        // Save file
        file.transferTo(new File(filePath));

        // Save metadata
        Resume resume = new Resume();
        resume.setUserEmail(email);
        resume.setFileName(fileName);
        resume.setFilePath(filePath);
        resume.setSkills(skills);
        resume.setExperience(experience);

        return resumeRepo.save(resume);
    }

    // ================= GET =================
    public List<Resume> getResumesByEmail(String email) {
        return resumeRepo.findByUserEmail(email);
    }

    public List<Resume> getAll() {
        return resumeRepo.findAll();
    }

    // ================= DELETE =================
    public boolean deleteResume(Long resumeId, String email) {

        Optional<Resume> resumeOpt = resumeRepo.findById(resumeId);

        if (resumeOpt.isEmpty()) {
            return false;
        }

        Resume resume = resumeOpt.get();

        // Ownership check
        if (!resume.getUserEmail().equals(email)) {
            return false;
        }

        // Delete file
        File file = new File(resume.getFilePath());
        if (file.exists()) {
            file.delete();
        }

        // Delete DB record
        resumeRepo.deleteById(resumeId);
        return true;
    }

    // ================= GET BY ID =================
    public Resume getResumeById(Long id) {
        return resumeRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Resume not found with id: " + id));
    }

    public File getResumeFile(Long id, String email) {
        Resume resume = getResumeById(id);
        
        // Ownership check
        if (!resume.getUserEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to resume");
        }
        
        File file = new File(resume.getFilePath());
        if (!file.exists()) {
            throw new RuntimeException("Resume file not found on server");
        }
        
        return file;
    }
}
