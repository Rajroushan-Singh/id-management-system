
package com.example.iam_platform.auth;

import com.example.iam_platform.audit.AuditService;
import com.example.iam_platform.role.Role;
import com.example.iam_platform.role.RoleRepository;
import com.example.iam_platform.security.JwtService;
import com.example.iam_platform.user.User;
import com.example.iam_platform.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private static final long BASE_LOCKOUT_MINUTES = 5;

    private static final long MAX_LOCKOUT_MINUTES = 24 * 60;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AccountTokenService accountTokenService;
    private final AuditService auditService;
    private final LoginAttemptRepository loginAttemptRepository;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            AccountTokenService accountTokenService,
            AuditService auditService,
            LoginAttemptRepository loginAttemptRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.accountTokenService = accountTokenService;
        this.auditService = auditService;
        this.loginAttemptRepository = loginAttemptRepository;
    }

    // =========================================
    // 1. USER REGISTRATION
    // =========================================

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered"
            );
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Default user role not found"
                        )
                );

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);

        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        user.setRoles(Set.of(userRole));

        User savedUser = userRepository.save(user);

        // Generate email verification token.
        accountTokenService.createVerificationToken(savedUser);

        auditService.record(
                email,
                "USER_REGISTERED",
                true,
                null,
                "User registered"
        );

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                "User registered successfully"
        );
    }

    // =========================================
    // 2. USER LOGIN + ACCOUNT LOCKOUT
    // =========================================

    @Transactional(noRollbackFor = {BadCredentialsException.class, LockedAccountException.class})
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailForUpdate(email).orElse(null);

        if (user == null) {
            recordLoginAttempt(null, email, false);
            auditService.record(email, "LOGIN_FAILED", false, null, "Invalid credentials");
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getLockedUntil() != null) {
            if (user.getLockedUntil().isAfter(Instant.now())) {
                recordLoginAttempt(user, email, false);
                auditService.record(email, "LOGIN_BLOCKED", false, null, "Account temporarily locked");
                throw new LockedAccountException();
            }
            // Lock expired: allow a fresh set of attempts.
            user.setLockedUntil(null);
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
        }

        if (!user.isEnabled()) {
            recordLoginAttempt(user, email, false);
            auditService.record(email, "LOGIN_BLOCKED", false, null, "Account is disabled");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is disabled");
        }

//        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
//            int attempts = user.getFailedLoginAttempts() + 1;
//            user.setFailedLoginAttempts(attempts);
//            boolean nowLocked = attempts >= MAX_FAILED_ATTEMPTS;
//            if (nowLocked) {
//                user.setLockedUntil(Instant.now().plus(Duration.ofMinutes(15)));
//            }
//            userRepository.save(user);
//            recordLoginAttempt(user, email, false);
//            auditService.record(
//                    email,
//                    nowLocked ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
//                    false,
//                    null,
//                    nowLocked ? "Account temporarily locked after failed attempts"
//                            : "Invalid credentials; failed attempts: " + attempts
//            );
//            if (nowLocked) {
//                throw new LockedAccountException();
//            }
//            throw new BadCredentialsException("Invalid email or password");
//        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {

            int attempts = user.getFailedLoginAttempts() + 1;

            user.setFailedLoginAttempts(attempts);

            boolean nowLocked = attempts >= MAX_FAILED_ATTEMPTS;

            if (nowLocked) {

                // Increment lockout cycle
                int lockoutCount = user.getLockoutCount() + 1;

                user.setLockoutCount(lockoutCount);

                // Calculate exponential lockout duration
                long lockoutMinutes =
                        calculateLockoutDuration(lockoutCount);

                // Set account lock expiration
                user.setLockedUntil(
                        Instant.now().plus(Duration.ofMinutes(lockoutMinutes))
                );
            }

            userRepository.save(user);

            recordLoginAttempt(user, email, false);

            auditService.record(
                    email,
                    nowLocked ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
                    false,
                    null,
                    nowLocked
                            ? "Account locked for "
                              + calculateLockoutDuration(user.getLockoutCount())
                              + " minutes"
                            : "Invalid credentials; failed attempts: " + attempts
            );

            if (nowLocked) {
                throw new LockedAccountException();
            }

            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            recordLoginAttempt(user, email, false);
            auditService.record(email, "LOGIN_BLOCKED", false, null, "Email verification required");
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Please verify your email before logging in"
            );
        }

// Reset all lockout counters after successful login
        user.setFailedLoginAttempts(0);

        user.setLockoutCount(0);

        user.setLockedUntil(null);

        userRepository.save(user);

        UserSession session = refreshTokenService.createSession(user);
        String refreshToken = refreshTokenService.createRefreshToken(user, session);
        String accessToken = jwtService.generateToken(user, session.getId());
        recordLoginAttempt(user, email, true);
        auditService.record(email, "LOGIN_SUCCESS", true, null, "Login successful");

        return new LoginResponse(
                user.getId(), user.getName(), user.getEmail(), "Bearer",
                accessToken, refreshToken, jwtService.getExpirationMs() / 1000,
                "Login successful"
        );
    }

    private void recordLoginAttempt(User user, String email, boolean successful) {
        loginAttemptRepository.save(new LoginAttempt(user, email, successful));
    }

    // =========================================
    // 3. EMAIL VERIFICATION
    // =========================================

    @Transactional
    public void verifyEmail(String rawToken) {

        User user = accountTokenService.consumeToken(
                rawToken,
                AccountToken.Purpose.EMAIL_VERIFICATION
        );

        user.setEmailVerified(true);

        userRepository.save(user);

        auditService.record(
                user.getEmail(),
                "EMAIL_VERIFIED",
                true,
                null,
                "Email verified successfully"
        );
    }

    // =========================================
    // 4. FORGOT PASSWORD
    // =========================================

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {

        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user != null && user.isEnabled()) {

            accountTokenService.createPasswordResetToken(user);

            auditService.record(
                    email,
                    "PASSWORD_RESET_REQUESTED",
                    true,
                    null,
                    "Password reset requested"
            );

        } else {

            // Keep the response generic to avoid revealing
            // whether an email address is registered.
            auditService.record(
                    email,
                    "PASSWORD_RESET_REQUESTED",
                    false,
                    null,
                    "Password reset request received"
            );
        }
    }

    // =========================================
    // 5. RESET PASSWORD
    // =========================================

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        User user = accountTokenService.consumeToken(
                request.token(),
                AccountToken.Purpose.PASSWORD_RESET
        );

        user.setPasswordHash(
                passwordEncoder.encode(request.newPassword())
        );

// Reset account lockout after successful password recovery
        user.setFailedLoginAttempts(0);

        user.setLockoutCount(0);

        user.setLockedUntil(null);

        userRepository.save(user);

        // Revoke existing refresh-token sessions.
        refreshTokenService.revokeAllForUser(user);

        auditService.record(
                user.getEmail(),
                "PASSWORD_RESET_SUCCESS",
                true,
                null,
                "Password reset successfully"
        );
    }

    // =========================================
    // 6. setting the lock timing
    // =========================================


    private long calculateLockoutDuration(int lockoutCount) {

        long duration = BASE_LOCKOUT_MINUTES;

        for (int i = 1; i < lockoutCount; i++) {

            if (duration >= MAX_LOCKOUT_MINUTES / 2) {
                return MAX_LOCKOUT_MINUTES;
            }

            duration *= 2;
        }

        return Math.min(duration, MAX_LOCKOUT_MINUTES);
    }

}
