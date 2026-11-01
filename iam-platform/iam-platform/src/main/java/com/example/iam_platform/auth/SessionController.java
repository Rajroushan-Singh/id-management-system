
package com.example.iam_platform.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/current")
    public ResponseEntity<Void> checkCurrentSession() {
        // The JWT filter only reaches this method when the token's session is active.
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> getActiveSessions(
            Authentication authentication
    ) {
        List<SessionResponse> sessions =
                sessionService.getActiveSessions(authentication.getName());

        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> revokeSession(
            @PathVariable UUID sessionId,
            Authentication authentication
    ) {
        sessionService.revokeSession(
                authentication.getName(),
                sessionId
        );

        return ResponseEntity.noContent().build();
    }
}
