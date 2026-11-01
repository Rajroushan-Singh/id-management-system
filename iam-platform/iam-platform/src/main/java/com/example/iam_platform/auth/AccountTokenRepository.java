
package com.example.iam_platform.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountTokenRepository
        extends JpaRepository<AccountToken, UUID> {

    Optional<AccountToken> findByTokenHashAndPurpose(
            String tokenHash,
            AccountToken.Purpose purpose
    );

    List<AccountToken> findAllByUser_IdAndPurposeAndUsedFalse(
            Long userId,
            AccountToken.Purpose purpose
    );
}
