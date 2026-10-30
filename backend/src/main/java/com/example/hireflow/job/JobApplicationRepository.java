package com.example.hireflow.job;

import java.util.List;
import java.util.Optional;

import com.example.hireflow.job.entity.JobApplication;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    boolean existsByJobIdAndEmployeeProfileId(Long jobId, Long employeeProfileId);
    long countByJobId(Long jobId);
    List<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId);
    List<JobApplication> findByEmployeeProfileIdOrderByAppliedAtDesc(Long employeeProfileId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from JobApplication a where a.id = :id")
    Optional<JobApplication> findByIdForUpdate(Long id);

    @Query("""
        select a from JobApplication a
        where a.chatEnabled = true and
            (a.employeeProfile.user.id = :userId or a.job.employerProfile.user.id = :userId)
        order by a.updatedAt desc, a.id desc
        """)
    List<JobApplication> findChatsForUser(Long userId);
}
