package com.profile.service;

import com.profile.entity.EmployerProfile;
import com.profile.Repository.EmployerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmployerProfileService {

    @Autowired
    private EmployerProfileRepository repo;

    public EmployerProfile saveProfile(EmployerProfile profile) {
        return repo.save(profile);
    }

    public Optional<EmployerProfile> getProfile(String email) {
        return repo.findByEmail(email);
    }

    public boolean deleteProfile(String email) {
        Optional<EmployerProfile> profileOpt = repo.findByEmail(email);
        profileOpt.ifPresent(repo::delete);
        return profileOpt.isPresent();
    }

    public EmployerProfile updateProfile(String email, EmployerProfile updatedProfile) {
        Optional<EmployerProfile> existingOpt = repo.findByEmail(email);
        
        if (existingOpt.isEmpty()) {
            throw new RuntimeException("Profile not found for email: " + email);
        }
        
        EmployerProfile existing = existingOpt.get();
        
        // Update fields if provided
        if (updatedProfile.getCompanyName() != null) {
            existing.setCompanyName(updatedProfile.getCompanyName());
        }
        if (updatedProfile.getDescription() != null) {
            existing.setDescription(updatedProfile.getDescription());
        }
        if (updatedProfile.getWebsite() != null) {
            existing.setWebsite(updatedProfile.getWebsite());
        }
        
        return repo.save(existing);
    }
}
