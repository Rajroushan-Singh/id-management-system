
package com.example.iam_platform.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class TokenBlacklistService {

    // Stores JWT ID (jti) and its expiration time
    private final ConcurrentMap<String, Instant> blacklist =
            new ConcurrentHashMap<>();

    // Add a token to the blacklist
    public void blacklistToken(String tokenId, Instant expirationTime) {

        if (tokenId == null || tokenId.isBlank()
                || expirationTime == null) {
            return;
        }

        // No need to store an already expired token
        if (!expirationTime.isAfter(Instant.now())) {
            return;
        }

        blacklist.put(tokenId, expirationTime);
    }

    // Check whether a token is blacklisted
    public boolean isBlacklisted(String tokenId) {

        if (tokenId == null || tokenId.isBlank()) {
            return false;
        }

        Instant expirationTime = blacklist.get(tokenId);

        if (expirationTime == null) {
            return false;
        }

        // Remove expired entry
        if (!expirationTime.isAfter(Instant.now())) {
            blacklist.remove(tokenId, expirationTime);
            return false;
        }

        return true;
    }

    // Remove expired entries every 60 seconds
    @Scheduled(fixedDelay = 60000)
    public void removeExpiredTokens() {

        Instant now = Instant.now();

        blacklist.entrySet().removeIf(
                entry -> !entry.getValue().isAfter(now)
        );
    }

    // Useful for testing
    public int getBlacklistSize() {
        return blacklist.size();
    }
}
