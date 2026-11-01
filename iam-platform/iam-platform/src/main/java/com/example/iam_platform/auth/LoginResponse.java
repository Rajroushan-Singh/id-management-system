
package com.example.iam_platform.auth;

public record LoginResponse(
        Long userId,
        String name,
        String email,
        String tokenType,
        String accessToken,
        String refreshToken,
        long expiresIn,
        String message
) {
}
