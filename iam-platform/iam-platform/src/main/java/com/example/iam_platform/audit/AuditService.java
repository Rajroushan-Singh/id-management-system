
package com.example.iam_platform.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AuditService {

    private final AuditEventRepository repository;

    public AuditService(AuditEventRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(
            String email,
            String eventType,
            boolean successful,
            String ipAddress,
            String details
    ) {
        AuditEvent event = new AuditEvent();

        event.setEmail(normalizeEmail(email));
        event.setEventType(eventType);
        event.setSuccessful(successful);
        event.setIpAddress(sanitizeIp(ipAddress));
        event.setDetails(details);

        repository.save(event);
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getRecentEvents() {
        return repository.findTop100ByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getEventsForEmail(String email) {
        return repository.findTop50ByEmailOrderByCreatedAtDesc(
                normalizeEmail(email)
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String sanitizeIp(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return null;
        }

        return ipAddress.length() <= 45
                ? ipAddress
                : ipAddress.substring(0, 45);
    }
}
