package com.jobApplication.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
public class UserDetailsConfig {

    /**
     * In-memory user store for demo purposes
     * In production, load users from database
     */
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.builder()
                .username("user1")
                .password(new BCryptPasswordEncoder().encode("password123"))
                .authorities("ROLE_USER")
                .build();

        UserDetails admin = User.builder()
                .username("admin")
                .password(new BCryptPasswordEncoder().encode("admin123"))
                .authorities("ROLE_ADMIN", "ROLE_USER")
                .build();

        return new InMemoryUserDetailsManager(user, admin);
    }
}
