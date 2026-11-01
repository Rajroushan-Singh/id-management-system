
package com.example.iam_platform.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class TokenBlacklistServiceTest {

    private TokenBlacklistService tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistService();
    }

    @Test
    void shouldBlacklistValidToken() {
        String tokenId = "test-jwt-123";
        Instant expiry = Instant.now().plusSeconds(3600);

        tokenBlacklistService.blacklistToken(tokenId, expiry);

        assertTrue(tokenBlacklistService.isBlacklisted(tokenId));
    }

    @Test
    void shouldNotBlacklistExpiredToken() {
        String tokenId = "expired-jwt";
        Instant expiry = Instant.now().minusSeconds(60);

        tokenBlacklistService.blacklistToken(tokenId, expiry);

        assertFalse(tokenBlacklistService.isBlacklisted(tokenId));
    }

    @Test
    void shouldReturnFalseForUnknownToken() {
        assertFalse(
                tokenBlacklistService.isBlacklisted("unknown-token")
        );
    }

    @Test
    void shouldIgnoreNullAndBlankTokenIds() {
        Instant expiry = Instant.now().plusSeconds(3600);

        tokenBlacklistService.blacklistToken(null, expiry);
        tokenBlacklistService.blacklistToken("", expiry);
        tokenBlacklistService.blacklistToken("   ", expiry);

        assertFalse(tokenBlacklistService.isBlacklisted(null));
        assertFalse(tokenBlacklistService.isBlacklisted(""));
        assertFalse(tokenBlacklistService.isBlacklisted("   "));
    }

    @Test
    void shouldRemoveExpiredTokens() {
        String tokenId = "expired-token";
        Instant expiry = Instant.now().plusSeconds(3600);

        tokenBlacklistService.blacklistToken(tokenId, expiry);

        assertTrue(tokenBlacklistService.isBlacklisted(tokenId));

        // Simulate an expired entry using a separate service instance.
        TokenBlacklistService cleanupService = new TokenBlacklistService();

        cleanupService.blacklistToken(
                "already-expired",
                Instant.now().minusSeconds(60)
        );

        cleanupService.removeExpiredTokens();

        assertFalse(cleanupService.isBlacklisted("already-expired"));
    }
}
