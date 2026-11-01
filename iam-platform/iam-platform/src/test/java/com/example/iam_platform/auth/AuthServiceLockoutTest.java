package com.example.iam_platform.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.iam_platform.audit.AuditService;
import com.example.iam_platform.role.RoleRepository;
import com.example.iam_platform.security.JwtService;
import com.example.iam_platform.user.User;
import com.example.iam_platform.user.UserRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceLockoutTest {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private LoginAttemptRepository loginAttemptRepository;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        RoleRepository roleRepository = mock(RoleRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        JwtService jwtService = mock(JwtService.class);
        RefreshTokenService refreshTokenService = mock(RefreshTokenService.class);
        AccountTokenService accountTokenService = mock(AccountTokenService.class);
        AuditService auditService = mock(AuditService.class);
        loginAttemptRepository = mock(LoginAttemptRepository.class);
        authService = new AuthService(
                userRepository,
                roleRepository,
                passwordEncoder,
                jwtService,
                refreshTokenService,
                accountTokenService,
                auditService,
                loginAttemptRepository
        );
    }

    @Test
    void unknownEmailIsLoggedWithoutUserAndReturnsGenericBadCredentials() {
        when(userRepository.findByEmailForUpdate("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(new LoginRequest("unknown@example.com", "incorrect"))
        );

        var attempt = org.mockito.ArgumentCaptor.forClass(LoginAttempt.class);
        verify(loginAttemptRepository).save(attempt.capture());
        assertNull(attempt.getValue().getUser());
        assertEquals("unknown@example.com", attempt.getValue().getEmail());
        assertFalse(attempt.getValue().isSuccessful());
    }

    @Test
    void fifthIncorrectPasswordStartsFifteenMinuteLockout() {
        User user = new User();
        user.setName("Sample User");
        user.setEmail("person@example.com");
        user.setPasswordHash("encoded-password");
        when(userRepository.findByEmailForUpdate("person@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password"))
                .thenReturn(false);

        LoginRequest request = new LoginRequest("person@example.com", "wrong-password");
        for (int attempt = 0; attempt < 4; attempt++) {
            assertThrows(BadCredentialsException.class, () -> authService.login(request));
        }
        assertThrows(LockedAccountException.class, () -> authService.login(request));

        assertEquals(5, user.getFailedLoginAttempts());
        assertNotNull(user.getLockedUntil());
        assertTrue(user.getLockedUntil().isAfter(Instant.now()));
        verify(loginAttemptRepository, times(5)).save(any(LoginAttempt.class));
        verify(userRepository, times(5)).save(any(User.class));
    }
}
