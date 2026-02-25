package com.profile.Repository;

import com.profile.entity.JobSeekerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JobSeekerProfileRepository extends JpaRepository<JobSeekerProfile, Long> {
    Optional<JobSeekerProfile> findByEmail(String email);
}
