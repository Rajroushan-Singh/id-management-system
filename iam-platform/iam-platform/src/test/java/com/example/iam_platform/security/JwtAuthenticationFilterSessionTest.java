package com.example.iam_platform.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.iam_platform.auth.UserSessionRepository;
import com.example.iam_platform.user.User;
import com.example.iam_platform.user.UserRepository;

import jakarta.servlet.ServletException;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.context.SecurityContextHolder;

class JwtAuthenticationFilterSessionTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void revokedSessionRejectsItsAccessTokenBeforeTheControllerRuns()
            throws ServletException, IOException {

        String email = "person@example.com";
        UUID sessionId = UUID.randomUUID();

        JwtService jwtService = new JwtService(
                "bXktc3VwZXItc2VjcmV0LWtleS1mb3ItbG9jYWwtZGV2ZWxvcG1lbnQtMzI=",
                120_000L
        );

        User user = mock(User.class);

        when(user.getId()).thenReturn(42L);
        when(user.getEmail()).thenReturn(email);

        String accessToken =
                jwtService.generateToken(user, sessionId);

        UserRepository userRepository =
                mock(UserRepository.class);

        when(userRepository.findWithRolesByEmail(email))
                .thenReturn(Optional.of(user));

        UserSessionRepository sessionRepository =
                mock(UserSessionRepository.class);

        when(sessionRepository.existsByIdAndUser_EmailAndActiveTrue(
                sessionId, email
        )).thenReturn(false);

        TokenBlacklistService tokenBlacklistService =
                mock(TokenBlacklistService.class);

        JwtAuthenticationFilter filter =
                new JwtAuthenticationFilter(
                        jwtService,
                        userRepository,
                        sessionRepository,
                        tokenBlacklistService
                );

        MockHttpServletRequest request =
                new MockHttpServletRequest();

        request.addHeader(
                HttpHeaders.AUTHORIZATION,
                "Bearer " + accessToken
        );

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertEquals(401, response.getStatus());

        verify(sessionRepository)
                .existsByIdAndUser_EmailAndActiveTrue(
                        sessionId, email
                );
    }


    @Test
    void blacklistedAccessTokenIsRejectedBeforeSessionValidation()
            throws ServletException, IOException {

        String email = "person@example.com";
        UUID sessionId = UUID.randomUUID();

        JwtService jwtService = new JwtService(
                "bXktc3VwZXItc2VjcmV0LWtleS1mb3ItbG9jYWwtZGV2ZWxvcG1lbnQtMzI=",
                120_000L
        );

        User user = mock(User.class);

        when(user.getId()).thenReturn(42L);
        when(user.getEmail()).thenReturn(email);

        String accessToken = jwtService.generateToken(user, sessionId);
        String tokenId = jwtService.extractTokenId(accessToken);

        UserRepository userRepository = mock(UserRepository.class);
        UserSessionRepository sessionRepository =
                mock(UserSessionRepository.class);

        TokenBlacklistService tokenBlacklistService =
                new TokenBlacklistService();

        tokenBlacklistService.blacklistToken(
                tokenId,
                jwtService.extractExpiration(accessToken).toInstant()
        );

        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(
                jwtService,
                userRepository,
                sessionRepository,
                tokenBlacklistService
        );

        MockHttpServletRequest request = new MockHttpServletRequest();

        request.addHeader(
                HttpHeaders.AUTHORIZATION,
                "Bearer " + accessToken
        );

        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertEquals(401, response.getStatus());

        verify(sessionRepository, never())
                .existsByIdAndUser_EmailAndActiveTrue(sessionId, email);

        verify(userRepository, never())
                .findWithRolesByEmail(email);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}