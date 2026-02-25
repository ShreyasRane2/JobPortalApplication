package com.admin.microservice.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.admin.microservice.external.User;

import java.util.List;

@Component
public class UserClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${user-service.url:http://localhost:5454}")
    private String userServiceUrl;

    public User findUserById(Long id) {
        String url = userServiceUrl + "/api/users/" + id;
        return restTemplate.getForObject(url, User.class);
    }

    public List<User> getAllUsers() {
        String url = userServiceUrl + "/api/users/all";
        ResponseEntity<List<User>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<User>>() {}
        );
        return response.getBody();
    }

    public String createUser(User user) {
        String url = userServiceUrl + "/api/users";
        return restTemplate.postForObject(url, user, String.class);
    }

    public User updateUser(Long id, User user) {
        String url = userServiceUrl + "/api/users/" + id;
        HttpEntity<User> request = new HttpEntity<>(user);
        ResponseEntity<User> response = restTemplate.exchange(url, HttpMethod.PUT, request, User.class);
        return response.getBody();
    }

    public String deleteUser(Long id) {
        String url = userServiceUrl + "/api/users/" + id;
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.DELETE,
                null,
                String.class
            );
            return response.getBody() != null ? response.getBody() : "User deleted successfully";
        } catch (Exception e) {
            // Re-throw with the error message from the User Service
            throw new RuntimeException(e.getMessage() != null ? e.getMessage() : "Failed to delete user");
        }
    }
}
















