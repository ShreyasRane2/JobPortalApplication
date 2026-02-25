package com.user.microservice.service;

import java.util.List;
import com.user.microservice.entity.User;

public interface UserService {
    public User findByUserId(Long id) throws Exception;
    public void createUser(User user);
    public List<User> getAllUsers();
    public User updateUser(Long id, User user) throws Exception;
    public boolean deleteUser(Long id);
}
