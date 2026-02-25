package com.user.microservice.controller;

import com.user.microservice.entity.User;
import com.user.microservice.repository.UserRepository;
import com.user.microservice.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // Get current user profile
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String email = jwtUtil.extractUsername(token);
            
            User user = userRepository.findByEmailId(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Don't send password to frontend
            user.setPassword(null);
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token or user not found");
        }
    }

    // Update user profile
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody User updatedUser) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            
            User user = userRepository.findByEmailId(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update allowed fields
            if (updatedUser.getFullName() != null) {
                user.setFullName(updatedUser.getFullName());
            }
            if (updatedUser.getSkills() != null) {
                user.setSkills(updatedUser.getSkills());
            }
            if (updatedUser.getResume() != null) {
                user.setResume(updatedUser.getResume());
            }
            if (updatedUser.getProfilePhoto() != null) {
                user.setProfilePhoto(updatedUser.getProfilePhoto());
            }
            
            User savedUser = userRepository.save(user);
            savedUser.setPassword(null); // Don't send password
            
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to update profile: " + e.getMessage());
        }
    }

    // Get user by ID (for other services)
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setPassword(null); // Don't send password
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }
    }


    // Delete user account
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            User user = userRepository.findByEmailId(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            userRepository.delete(user);

            return ResponseEntity.ok("Account deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to delete account: " + e.getMessage());
        }
    }


    // Get all users (for admin)
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            // Don't send passwords
            users.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch users: " + e.getMessage());
        }
    }

    // Delete user by ID (for admin)
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUserById(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            
            // Note: This will fail if there are foreign key constraints
            // You may need to delete related records first (profiles, applications, etc.)
            try {
                userRepository.delete(user);
                return ResponseEntity.ok("User deleted successfully");
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                // Foreign key constraint violation
                String errorMsg = "Cannot delete user: User has related data in other services. ";
                errorMsg += "Please delete the following first:\n";
                errorMsg += "- User's job applications (Application Service)\n";
                errorMsg += "- User's profiles (Profile Service)\n";
                errorMsg += "- Jobs posted by user (Job Service)\n";
                errorMsg += "Or use the SQL script to cascade delete.";
                
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(errorMsg);
            } catch (Exception e) {
                // Log the actual error for debugging
                System.err.println("Error deleting user " + userId + ": " + e.getMessage());
                e.printStackTrace();
                
                // Check if it's a constraint violation
                if (e.getMessage() != null && 
                    (e.getMessage().contains("constraint") || 
                     e.getMessage().contains("foreign key") ||
                     e.getMessage().contains("Cannot delete"))) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body("Cannot delete user: User has related data (profiles, applications, or jobs). Please delete related data first.");
                }
                throw e;
            }
        } catch (RuntimeException e) {
            if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(e.getMessage());
            }
            System.err.println("Runtime error deleting user " + userId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete user: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error deleting user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete user: " + e.getMessage());
        }
    }

}
