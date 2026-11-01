package com.example.iam_platform.auth;

public record AuthResponse(
        Long userId,
        String name,
        String email,
        String message
) {
}