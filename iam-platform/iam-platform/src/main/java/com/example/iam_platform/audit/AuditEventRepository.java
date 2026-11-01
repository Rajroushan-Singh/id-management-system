
package com.example.iam_platform.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditEventRepository
        extends JpaRepository<AuditEvent, Long> {

    List<AuditEvent> findTop100ByOrderByCreatedAtDesc();

    List<AuditEvent> findTop50ByEmailOrderByCreatedAtDesc(
            String email
    );

    long countByEmailAndEventTypeAndSuccessfulFalse(
            String email,
            String eventType
    );
}
