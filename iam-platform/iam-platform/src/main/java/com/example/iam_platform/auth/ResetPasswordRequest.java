
package com.example.iam_platform.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank
        @Size(min = 8, max = 100,
                message = "Password must contain 8 to 100 characters")
        String newPassword
) {
}
