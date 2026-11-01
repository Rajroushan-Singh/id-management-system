package com.example.iam_platform.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    List<UserSession> findAllByUser_IdAndActiveTrue(Long userId);

    Optional<UserSession> findByIdAndUser_Id(UUID id, Long userId);

    boolean existsByIdAndUser_EmailAndActiveTrue(UUID id, String email);

    @Modifying
    @Query("update UserSession s set s.active = false where s.user.id = :userId")
    int deactivateAllByUserId(@Param("userId") Long userId);
}
