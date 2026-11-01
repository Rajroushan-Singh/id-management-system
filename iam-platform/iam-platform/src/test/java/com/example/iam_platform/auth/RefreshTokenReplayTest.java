package com.example.iam_platform.auth;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.iam_platform.security.JwtService;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class RefreshTokenReplayTest {
    private RefreshTokenRepository refreshTokenRepository;
    private UserSessionRepository userSessionRepository;
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        userSessionRepository = mock(UserSessionRepository.class);
        refreshTokenService = new RefreshTokenService(
                refreshTokenRepository,
                userSessionRepository,
                mock(JwtService.class),
                60_000L
        );
    }

    @Test
    void revokedTokenReplayDeactivatesItsSessionAndRevokesAllSessionTokens() {
        UUID sessionId = UUID.randomUUID();
        UserSession session = mock(UserSession.class);
        when(session.getId()).thenReturn(sessionId);
        RefreshToken revokedToken = mock(RefreshToken.class);
        when(revokedToken.isRevoked()).thenReturn(true);
        when(revokedToken.getSession()).thenReturn(session);
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString()))
                .thenReturn(Optional.of(revokedToken));

        assertThrows(
                ResponseStatusException.class,
                () -> refreshTokenService.refreshAccessToken("replayed-refresh-token")
        );

        verify(session).setActive(false);
        verify(userSessionRepository).save(session);
        verify(refreshTokenRepository).revokeAllBySessionId(sessionId);
    }
}
