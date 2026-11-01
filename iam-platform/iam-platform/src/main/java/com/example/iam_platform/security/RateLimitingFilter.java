
package com.example.iam_platform.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import org.springframework.scheduling.annotation.Scheduled;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, BucketEntry> buckets =
            new ConcurrentHashMap<>();

    private static final Map<String, RateLimitRule> RULES = Map.of(
            "/api/auth/login",
            new RateLimitRule(10, Duration.ofMinutes(1)),

            "/api/auth/register",
            new RateLimitRule(5, Duration.ofHours(1)),

            "/api/auth/forgot-password",
            new RateLimitRule(5, Duration.ofHours(1)),

            "/api/auth/reset-password",
            new RateLimitRule(5, Duration.ofHours(1))
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        return !"POST".equalsIgnoreCase(request.getMethod())
                || !RULES.containsKey(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String ipAddress = request.getRemoteAddr();

        String endpoint = request.getRequestURI();

        String bucketKey = ipAddress + ":" + endpoint;

        RateLimitRule rule = RULES.get(endpoint);

        BucketEntry entry = buckets.computeIfAbsent(
                bucketKey,
                key -> new BucketEntry(createBucket(rule))
        );

        entry.lastAccess = Instant.now();

        ConsumptionProbe probe =
                entry.bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {

            filterChain.doFilter(request, response);

            return;
        }

        long retryAfterSeconds = Math.max(
                1,
                (long) Math.ceil(
                        probe.getNanosToWaitForRefill()
                                / 1_000_000_000.0
                )
        );

        response.sendError(429,"Rate limit exceeded");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.setHeader(
                "Retry-After",
                String.valueOf(retryAfterSeconds)
        );

        response.getWriter().write(
                """
                {
                    "status": 429,
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Please try again later."
                }
                """
        );
    }

    private Bucket createBucket(RateLimitRule rule) {

        Bandwidth bandwidth = Bandwidth.builder()
                .capacity(rule.capacity())
                .refillGreedy(
                        rule.capacity(),
                        rule.refillPeriod()
                )
                .build();

        return Bucket.builder()
                .addLimit(bandwidth)
                .build();
    }

    // Remove inactive IP buckets to prevent unlimited memory growth.
    @Scheduled(fixedDelay = 600000)
    public void cleanupInactiveBuckets() {

        Instant cutoff = Instant.now().minus(Duration.ofHours(2));

        buckets.entrySet().removeIf(
                entry -> entry.getValue().lastAccess.isBefore(cutoff)
        );
    }

    private record RateLimitRule(
            int capacity,
            Duration refillPeriod
    ) {}

    private static class BucketEntry {

        private final Bucket bucket;

        private volatile Instant lastAccess;

        private BucketEntry(Bucket bucket) {

            this.bucket = bucket;
            this.lastAccess = Instant.now();
        }
    }
}
