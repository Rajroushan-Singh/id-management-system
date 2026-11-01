
package com.example.iam_platform.auth;

import java.time.Instant;
import java.util.UUID;

public record SessionResponse(
        UUID sessionId,
        Instant createdAt,
        Instant expiresAt
) {
}
