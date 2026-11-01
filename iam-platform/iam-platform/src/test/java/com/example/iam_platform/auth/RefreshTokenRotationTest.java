package com.example.iam_platform.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.iam_platform.security.JwtService;
import com.example.iam_platform.user.User;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class RefreshTokenRotationTest {
    private RefreshTokenRepository refreshTokenRepository;
    private UserSessionRepository userSessionRepository;
    private JwtService jwtService;
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        userSessionRepository = mock(UserSessionRepository.class);
        jwtService = mock(JwtService.class);
        refreshTokenService = new RefreshTokenService(
                refreshTokenRepository,
                userSessionRepository,
                jwtService,
                60_000L
        );
    }

    @Test
    void rotatesRefreshTokenWithinTheOriginalSession() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(42L);
        when(user.getName()).thenReturn("Sample User");
        when(user.getEmail()).thenReturn("person@example.com");
        when(user.isEnabled()).thenReturn(true);
        when(user.isLocked()).thenReturn(false);

        UserSession session = mock(UserSession.class);
        when(session.isActive()).thenReturn(true);
        UUID sessionId = UUID.randomUUID();
        when(session.getId()).thenReturn(sessionId);

        RefreshToken currentToken = mock(RefreshToken.class);
        when(currentToken.isRevoked()).thenReturn(false);
        when(currentToken.getExpiresAt()).thenReturn(Instant.now().plusSeconds(300));
        when(currentToken.getSession()).thenReturn(session);
        when(currentToken.getUser()).thenReturn(user);
        when(refreshTokenRepository.findByTokenHashForUpdate(anyString()))
                .thenReturn(Optional.of(currentToken));
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(user, sessionId)).thenReturn("new-access-token");
        when(jwtService.getExpirationMs()).thenReturn(120_000L);

        LoginResponse response = refreshTokenService.refreshAccessToken("old-refresh-token");

        assertEquals("new-access-token", response.accessToken());
        assertNotNull(response.refreshToken());
        assertFalse(response.refreshToken().isBlank());
        ArgumentCaptor<RefreshToken> replacement = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository, org.mockito.Mockito.times(2)).save(replacement.capture());
        RefreshToken replacementToken = replacement.getAllValues().get(1);
        assertEquals(session, replacementToken.getSession());
        assertEquals(user, replacementToken.getUser());
        verify(currentToken).setRevoked(true);
    }
}
