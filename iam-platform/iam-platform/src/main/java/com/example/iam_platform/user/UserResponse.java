package com.example.iam_platform.user;

import com.example.iam_platform.role.Role;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record UserResponse(
        Long id,
        String name,
        String email,
        boolean enabled,
        boolean locked,
        Instant lockedUntil,
        boolean emailVerified,
        LocalDateTime createdAt,
        List<RoleSummary> roles
) {
    public static UserResponse from(User user) {
        List<RoleSummary> roleSummaries = user.getRoles().stream()
                .map(RoleSummary::from)
                .toList();
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isEnabled(),
                user.isLocked(),
                user.getLockedUntil(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                roleSummaries
        );
    }

    public record RoleSummary(Long id, String name) {
        private static RoleSummary from(Role role) {
            return new RoleSummary(role.getId(), role.getName());
        }
    }
}
