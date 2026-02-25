package com.user.microservice.service.impl;

import com.user.microservice.entity.User;
import com.user.microservice.repository.UserRepository;
import com.user.microservice.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ Manual constructor (THIS FIXES EVERYTHING)
    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User findByUserId(Long id) throws Exception {
        return userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found with id: " + id));
    }

    @Override
    public void createUser(User user) {
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(Long id, User user) throws Exception {
        User existingUser = findByUserId(id);

        if (user.getFullName() != null)
            existingUser.setFullName(user.getFullName());

        if (user.getEmailId() != null)
            existingUser.setEmailId(user.getEmailId());

        if (user.getRole() != null)
            existingUser.setRole(user.getRole());

        if (user.getResume() != null)
            existingUser.setResume(user.getResume());

        if (user.getProfilePhoto() != null)
            existingUser.setProfilePhoto(user.getProfilePhoto());

        if (user.getSkills() != null)
            existingUser.setSkills(user.getSkills());

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    @Override
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
