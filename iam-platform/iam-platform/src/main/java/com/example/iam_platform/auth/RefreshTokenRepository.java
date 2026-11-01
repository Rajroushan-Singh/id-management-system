
package com.example.iam_platform.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from RefreshToken token where token.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    List<RefreshToken> findAllByUser_IdAndRevokedFalseAndExpiresAtAfter(
            Long userId,
            Instant now
    );

    Optional<RefreshToken> findByIdAndUser_Id(
            UUID sessionId,
            Long userId
    );

    Optional<RefreshToken> findFirstBySession_IdAndRevokedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
            UUID sessionId,
            Instant now
    );

    List<RefreshToken> findAllByUser_IdAndRevokedFalse(Long userId);

    @Modifying
    @Query("update RefreshToken token set token.revoked = true where token.session.id = :sessionId")
    int revokeAllBySessionId(@Param("sessionId") UUID sessionId);

    @Modifying
    @Query("update RefreshToken token set token.revoked = true where token.user.id = :userId")
    int revokeAllByUserId(@Param("userId") Long userId);
}
