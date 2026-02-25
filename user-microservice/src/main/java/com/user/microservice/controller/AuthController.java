package com.user.microservice.controller;

import com.user.microservice.dto.LoginRequest;
import com.user.microservice.dto.LoginResponse;
import com.user.microservice.dto.UserRegistrationEvent;
import com.user.microservice.entity.User;
import com.user.microservice.entity.USER_ROLE;
import com.user.microservice.kafka.UserEventProducer;
import com.user.microservice.repository.UserRepository;
import com.user.microservice.security.CustomUserDetailsService;
import com.user.microservice.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserEventProducer userEventProducer;

    // ✅ Manual Constructor Injection
    public AuthController(AuthenticationManager authenticationManager,
                          CustomUserDetailsService userDetailsService,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Autowired(required = false) UserEventProducer userEventProducer) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userEventProducer = userEventProducer;
    }

    // ✅ Register API
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        try {
            System.out.println("Registration attempt for email: " + user.getEmailId());

            if (userRepository.findByEmailId(user.getEmailId()).isPresent()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email is already in use");
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));

            if (user.getRole() == null) {
                user.setRole(USER_ROLE.ROLE_EMPLOYEE);
            }

            User savedUser = userRepository.save(user);
            System.out.println("User registered successfully with ID: " + savedUser.getId());

            // Send notification event to Kafka
            if (userEventProducer != null) {
                try {
                    UserRegistrationEvent event = new UserRegistrationEvent();
                    event.setUserId(savedUser.getId());
                    event.setFirstName(savedUser.getFullName() != null ? savedUser.getFullName().split(" ")[0] : "User");
                    event.setLastName(savedUser.getFullName() != null && savedUser.getFullName().split(" ").length > 1 
                        ? savedUser.getFullName().split(" ")[1] : "");
                    event.setEmail(savedUser.getEmailId());
                    event.setPhoneNumber(""); // User entity doesn't have phoneNumber field
                    event.setRegistrationDate(LocalDateTime.now().toString());
                    
                    userEventProducer.sendUserRegistrationEvent(event);
                    System.out.println("✅ Notification event sent for user: " + savedUser.getEmailId());
                } catch (Exception e) {
                    // Log but don't fail registration if notification fails
                    System.out.println("⚠️ Warning: Could not send notification event: " + e.getMessage());
                }
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("User registered successfully");
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    // ✅ Login API
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(
                            loginRequest.getEmail()
                    );

            String jwt = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(new LoginResponse(jwt));
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }
}
