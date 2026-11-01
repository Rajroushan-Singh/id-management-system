package com.example.iam_platform.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class LockedAccountException extends ResponseStatusException {
    public LockedAccountException() {
        super(HttpStatus.LOCKED, "Account temporarily locked. Try again in 15 minutes.");
    }
}
