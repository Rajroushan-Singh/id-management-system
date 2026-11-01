package com.example.iam_platform.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.iam_platform.user.User;
import com.example.iam_platform.user.UserRepository;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class MultipleLoginSessionsIntegrationTest {
    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private com.example.iam_platform.security.JwtService jwtService;

    @Test
    void everySuccessfulLoginAddsASeparateSessionAndRevokingOneDeactivatesIt() {
        String email = "session-test-" + UUID.randomUUID() + "@example.com";
        String password = "CorrectHorseBattery!42";
        User user = new User();
        user.setName("Session Test");
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmailVerified(true);
        userRepository.saveAndFlush(user);

        LoginResponse firstLogin = authService.login(new LoginRequest(email, password));
        LoginResponse secondLogin = authService.login(new LoginRequest(email, password));
        UUID firstSessionId = jwtService.extractSessionId(firstLogin.accessToken());
        UUID secondSessionId = jwtService.extractSessionId(secondLogin.accessToken());

        assertNotEquals(firstLogin.refreshToken(), secondLogin.refreshToken());
        assertNotEquals(firstSessionId, secondSessionId);
        assertEquals(2, sessionService.getActiveSessions(email).size());

        sessionService.revokeSession(email, firstSessionId);

        assertFalse(userSessionRepository.existsByIdAndUser_EmailAndActiveTrue(firstSessionId, email));
        assertTrue(userSessionRepository.existsByIdAndUser_EmailAndActiveTrue(secondSessionId, email));
        assertEquals(1, sessionService.getActiveSessions(email).size());
    }
}
