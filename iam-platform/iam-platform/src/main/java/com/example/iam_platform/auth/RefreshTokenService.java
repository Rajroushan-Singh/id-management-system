package com.example.iam_platform.auth;

import com.example.iam_platform.security.JwtService;
import com.example.iam_platform.user.User;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserSessionRepository userSessionRepository;
    private final JwtService jwtService;
    private final long refreshExpirationMs;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            UserSessionRepository userSessionRepository,
            JwtService jwtService,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userSessionRepository = userSessionRepository;
        this.jwtService = jwtService;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    @Transactional
    public UserSession createSession(User user) {
        return userSessionRepository.save(new UserSession(user));
    }

    @Transactional
    public String createRefreshToken(User user, UserSession session) {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenHash(hashToken(rawToken));
        refreshToken.setUser(user);
        refreshToken.setSession(session);
        refreshToken.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public LoginResponse refreshAccessToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw invalidRefreshToken();
        }
        RefreshToken storedToken = refreshTokenRepository
                .findByTokenHashForUpdate(hashToken(rawToken))
                .orElseThrow(this::invalidRefreshToken);

        // A revoked token presented again indicates possible theft. Persist the
        // session shutdown even though the request itself must be rejected.
        if (storedToken.isRevoked()) {
            UserSession session = storedToken.getSession();
            if (session != null) {
                session.setActive(false);
                userSessionRepository.save(session);
                refreshTokenRepository.revokeAllBySessionId(session.getId());
            }
            throw invalidRefreshToken();
        }

        UserSession session = storedToken.getSession();
        if (session == null || !session.isActive()
                || !storedToken.getExpiresAt().isAfter(Instant.now())) {
            throw invalidRefreshToken();
        }
        User user = storedToken.getUser();
        if (!user.isEnabled() || user.isLocked()) {
            throw invalidRefreshToken();
        }

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);
        String nextRefreshToken = createRefreshToken(user, session);
        String nextAccessToken = jwtService.generateToken(user, session.getId());
        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                "Bearer",
                nextAccessToken,
                nextRefreshToken,
                jwtService.getExpirationMs() / 1000,
                "Access token refreshed successfully"
        );
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private ResponseStatusException invalidRefreshToken() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid, expired, or revoked refresh token"
        );
    }

    @Transactional
    public void revokeRefreshToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(hashToken(rawToken))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    UserSession session = token.getSession();
                    if (session != null) {
                        session.setActive(false);
                        userSessionRepository.save(session);
                        refreshTokenRepository.revokeAllBySessionId(session.getId());
                    } else {
                        refreshTokenRepository.save(token);
                    }
                });
    }

    @Transactional
    public void revokeAllForUser(User user) {
        refreshTokenRepository.revokeAllByUserId(user.getId());
        userSessionRepository.deactivateAllByUserId(user.getId());
    }

    @Transactional
    public void revokeAllForSession(UUID sessionId) {
        userSessionRepository.findById(sessionId).ifPresent(session -> {
            session.setActive(false);
            userSessionRepository.save(session);
            refreshTokenRepository.revokeAllBySessionId(sessionId);
        });
    }
}
