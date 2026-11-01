
package com.example.iam_platform.auth;

import com.example.iam_platform.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class AccountTokenService {

    private final AccountTokenRepository repository;
    private final long verificationExpirationMs;
    private final long passwordResetExpirationMs;
    private final String baseUrl;

    private final SecureRandom secureRandom = new SecureRandom();

    public AccountTokenService(
            AccountTokenRepository repository,
            @Value("${app.account.email-verification-expiration-ms}")
            long verificationExpirationMs,
            @Value("${app.account.password-reset-expiration-ms}")
            long passwordResetExpirationMs,
            @Value("${app.account.base-url}") String baseUrl
    ) {
        this.repository = repository;
        this.verificationExpirationMs = verificationExpirationMs;
        this.passwordResetExpirationMs = passwordResetExpirationMs;
        this.baseUrl = baseUrl;
    }

    @Transactional
    public void createVerificationToken(User user) {
        String token = createToken(
                user,
                AccountToken.Purpose.EMAIL_VERIFICATION,
                verificationExpirationMs
        );

        System.out.println(
                "\n=== EMAIL VERIFICATION ===\n"
                        + "Email: " + user.getEmail() + "\n"
                        + "Verification link: " + baseUrl
                        + "/api/auth/verify-email?token=" + token + "\n"
                        + "==========================\n"
        );
    }

    @Transactional
    public void createPasswordResetToken(User user) {
        String token = createToken(
                user,
                AccountToken.Purpose.PASSWORD_RESET,
                passwordResetExpirationMs
        );

        System.out.println(
                "\n=== PASSWORD RESET ===\n"
                        + "Email: " + user.getEmail() + "\n"
                        + "Reset token: " + token + "\n"
                        + "Submit it to POST " + baseUrl
                        + "/api/auth/reset-password with your new password.\n"
                        + "======================\n"
        );
    }

    private String createToken(
            User user,
            AccountToken.Purpose purpose,
            long expirationMs
    ) {
        // Invalidate previous unused tokens of the same purpose.
        repository.findAllByUser_IdAndPurposeAndUsedFalse(
                user.getId(), purpose
        ).forEach(oldToken -> oldToken.setUsed(true));

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        AccountToken accountToken = new AccountToken();
        accountToken.setUser(user);
        accountToken.setTokenHash(hashToken(rawToken));
        accountToken.setPurpose(purpose);
        accountToken.setExpiresAt(
                Instant.now().plusMillis(expirationMs)
        );
        accountToken.setUsed(false);

        repository.save(accountToken);
        return rawToken;
    }

    @Transactional
    public User consumeToken(
            String rawToken,
            AccountToken.Purpose purpose
    ) {
        if (rawToken == null || rawToken.isBlank()) {
            throw invalidToken();
        }

        AccountToken token = repository
                .findByTokenHashAndPurpose(
                        hashToken(rawToken),
                        purpose
                )
                .orElseThrow(this::invalidToken);

        if (token.isUsed()
                || !token.getExpiresAt().isAfter(Instant.now())) {
            throw invalidToken();
        }

        token.setUsed(true);
        repository.save(token);

        return token.getUser();
    }

    private String hashToken(String rawToken) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));

            return java.util.HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable", exception
            );
        }
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Token is invalid, expired, or already used"
        );
    }
}
