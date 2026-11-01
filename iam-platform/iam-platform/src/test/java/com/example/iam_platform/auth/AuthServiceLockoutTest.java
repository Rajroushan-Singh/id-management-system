package com.example.iam_platform.auth;

import com.example.iam_platform.audit.AuditService;
import com.example.iam_platform.role.RoleRepository;
import com.example.iam_platform.security.JwtService;
import com.example.iam_platform.user.User;
import com.example.iam_platform.user.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceLockoutTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private LoginAttemptRepository loginAttemptRepository;
    private AuthService authService;

    private User user;

    private final String email = "person@example.com";
    private final String wrongPassword = "wrong-password";

    @BeforeEach
    void setUp() {

        userRepository = mock(UserRepository.class);

        RoleRepository roleRepository = mock(RoleRepository.class);

        passwordEncoder = mock(PasswordEncoder.class);

        JwtService jwtService = mock(JwtService.class);

        RefreshTokenService refreshTokenService =
                mock(RefreshTokenService.class);

        AccountTokenService accountTokenService =
                mock(AccountTokenService.class);

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

        user = new User();

        user.setName("Sample User");
        user.setEmail(email);
        user.setPasswordHash("encoded-password");

        when(userRepository.findByEmailForUpdate(email))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                wrongPassword,
                "encoded-password"
        )).thenReturn(false);
    }

    // -----------------------------------------
    // TEST 1: Unknown email
    // -----------------------------------------

    @Test
    void unknownEmailShouldThrowBadCredentialsException() {

        when(userRepository.findByEmailForUpdate("unknown@example.com"))
                .thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest(
                "unknown@example.com",
                wrongPassword
        );

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );

        verify(loginAttemptRepository).save(any(LoginAttempt.class));
    }

    // -----------------------------------------
    // TEST 2: First lockout = 5 minutes
    // -----------------------------------------

    @Test
    void fifthIncorrectPasswordShouldLockAccountForFiveMinutes() {

        sendFiveIncorrectLoginAttempts();

        assertEquals(5, user.getFailedLoginAttempts());
        assertEquals(1, user.getLockoutCount());
        assertNotNull(user.getLockedUntil());

        Instant afterLockout = Instant.now();

        Duration duration = Duration.between(
                afterLockout,
                user.getLockedUntil()
        );

        assertTrue(
                duration.compareTo(Duration.ofMinutes(5)) <= 0
                        && duration.compareTo(Duration.ofMinutes(5).minusSeconds(2)) >= 0,
                "First lockout should have approximately 5 minutes remaining"
        );
    }

    // -----------------------------------------
    // TEST 3: Second lockout = 10 minutes
    // -----------------------------------------

    @Test
    void secondLockoutShouldLastTenMinutes() {

        // First lockout: 5 minutes
        sendFiveIncorrectLoginAttempts();

        assertEquals(1, user.getLockoutCount());

        // Simulate expiration of first lockout
        expireLockout();

        Instant beforeSecondLockout = Instant.now();

        // Second lockout: 10 minutes
        sendFiveIncorrectLoginAttempts();

        assertEquals(2, user.getLockoutCount());

        Duration duration = Duration.between(
                Instant.now(),
                user.getLockedUntil()
        );

        assertTrue(duration.compareTo(Duration.ofMinutes(10)) <= 0);
        assertTrue(
                duration.compareTo(Duration.ofMinutes(10).minusSeconds(2)) >= 0
        );
    }

    // -----------------------------------------
    // TEST 4: Third lockout = 20 minutes
    // -----------------------------------------

    @Test
    void thirdLockoutShouldLastTwentyMinutes() {

        // First lockout
        sendFiveIncorrectLoginAttempts();
        assertEquals(1, user.getLockoutCount());
        expireLockout();

        // Second lockout
        sendFiveIncorrectLoginAttempts();
        assertEquals(2, user.getLockoutCount());
        expireLockout();

        // Third lockout
        sendFiveIncorrectLoginAttempts();

        assertEquals(3, user.getLockoutCount());

        Duration duration = Duration.between(
                Instant.now(),
                user.getLockedUntil()
        );

        assertTrue(duration.compareTo(Duration.ofMinutes(20)) <= 0);
        assertTrue(
                duration.compareTo(Duration.ofMinutes(20).minusSeconds(2)) >= 0
        );
    }

    // -----------------------------------------
    // TEST 5: Active lockout prevents login
    // -----------------------------------------

    @Test
    void activeLockoutShouldRejectLoginAttempts() {

        user.setFailedLoginAttempts(5);
        user.setLockoutCount(1);

        user.setLockedUntil(
                Instant.now().plus(Duration.ofMinutes(5))
        );

        LoginRequest request = new LoginRequest(
                email,
                wrongPassword
        );

        assertThrows(
                LockedAccountException.class,
                () -> authService.login(request)
        );

        assertEquals(5, user.getFailedLoginAttempts());
        assertEquals(1, user.getLockoutCount());
    }

    // -----------------------------------------
    // TEST 6: Maximum lockout = 24 hours
    // -----------------------------------------

    @Test
    void lockoutShouldNeverExceedTwentyFourHours() {

        user.setLockoutCount(9);

        sendFiveIncorrectLoginAttempts();

        assertEquals(10, user.getLockoutCount());

        Duration duration = Duration.between(
                Instant.now(),
                user.getLockedUntil()
        );

        assertTrue(duration.compareTo(Duration.ofHours(24)) <= 0);
        assertTrue(
                duration.compareTo(Duration.ofHours(24).minusSeconds(2)) >= 0
        );
    }

    // -----------------------------------------
    // TEST 7: Expired lockout preserves cycle
    // -----------------------------------------

    @Test
    void expiredLockoutShouldResetFailedAttemptsButPreserveLockoutCount() {

        user.setFailedLoginAttempts(5);
        user.setLockoutCount(2);

        user.setLockedUntil(
                Instant.now().minusSeconds(10)
        );

        LoginRequest request = new LoginRequest(
                email,
                wrongPassword
        );

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );

        assertEquals(1, user.getFailedLoginAttempts());

        assertEquals(2, user.getLockoutCount());

        assertNull(user.getLockedUntil());
    }

    // -----------------------------------------
    // HELPER METHODS
    // -----------------------------------------

    private void sendFiveIncorrectLoginAttempts() {

        LoginRequest request = new LoginRequest(
                email,
                wrongPassword
        );

        for (int i = 0; i < 4; i++) {

            assertThrows(
                    BadCredentialsException.class,
                    () -> authService.login(request)
            );
        }

        assertThrows(
                LockedAccountException.class,
                () -> authService.login(request)
        );
    }

    private void expireLockout() {

        user.setLockedUntil(
                Instant.now().minusSeconds(1)
        );
    }
}