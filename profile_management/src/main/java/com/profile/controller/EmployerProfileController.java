package com.profile.controller;

import com.profile.entity.EmployerProfile;
import com.profile.service.EmployerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile/employer")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployerProfileController {

    @Autowired
    private EmployerProfileService service;

    @PostMapping
    public EmployerProfile saveProfile(@RequestBody EmployerProfile profile) {
        return service.saveProfile(profile);
    }

    @GetMapping("/{email}")
    public EmployerProfile getProfile(@PathVariable String email) {
        return service.getProfile(email).orElse(null);
    }

    @DeleteMapping("/{email}")
    public String deleteProfile(@PathVariable String email) {
        return service.deleteProfile(email) ? "Deleted" : "Not Found";
    }
    
    @PutMapping("/{email}")
    public org.springframework.http.ResponseEntity<EmployerProfile> updateProfile(
            @PathVariable String email, 
            @RequestBody EmployerProfile profile) {
        try {
            EmployerProfile updated = service.updateProfile(email, profile);
            return org.springframework.http.ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/my-profile")
    public String getMyProfile() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return "Profile data for: " + email;
    }

}
