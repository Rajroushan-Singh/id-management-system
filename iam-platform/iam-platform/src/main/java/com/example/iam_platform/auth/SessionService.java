package com.example.iam_platform.auth;

import com.example.iam_platform.user.User;
import com.example.iam_platform.user.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SessionService {
    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public SessionService(
            UserRepository userRepository,
            UserSessionRepository userSessionRepository,
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSessions(String email) {
        User user = findUser(email);
        Instant now = Instant.now();
        return userSessionRepository.findAllByUser_IdAndActiveTrue(user.getId())
                .stream()
                .map(session -> refreshTokenRepository
                        .findFirstBySession_IdAndRevokedFalseAndExpiresAtAfterOrderByExpiresAtDesc(
                                session.getId(), now
                        )
                        .map(token -> new SessionResponse(
                                session.getId(),
                                session.getCreatedAt(),
                                token.getExpiresAt()
                        ))
                        .orElse(null))
                .filter(response -> response != null)
                .toList();
    }

    @Transactional
    public void revokeSession(String email, UUID sessionId) {
        User user = findUser(email);
        UserSession session = userSessionRepository
                .findByIdAndUser_Id(sessionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Session not found"
                ));
        session.setActive(false);
        userSessionRepository.save(session);
        refreshTokenRepository.revokeAllBySessionId(sessionId);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }
}
