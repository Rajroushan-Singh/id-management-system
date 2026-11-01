package com.example.iam_platform.security;

import com.example.iam_platform.user.User;
import com.example.iam_platform.user.UserRepository;
import com.example.iam_platform.auth.UserSessionRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository,
            UserSessionRepository userSessionRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        log.info("JWT filter reached: {}", request.getRequestURI());
        log.info("Authorization header present: {}", header != null);

        if (header == null || !header.startsWith("Bearer ")) {
            log.warn("JWT missing or Bearer prefix not found");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7).trim();

        try {
            if (!jwtService.isTokenValid(token)) {
                log.warn("JWT validation failed");
                reject(response);
                return;
            }

            String email = jwtService.extractEmail(token);
            log.info("JWT valid; subject email: {}", email);

            UUID sessionId = jwtService.extractSessionId(token);
            if (sessionId == null
                    || !userSessionRepository.existsByIdAndUser_EmailAndActiveTrue(sessionId, email)) {
                log.info("JWT session is missing, revoked, or no longer belongs to the user");
                reject(response);
                return;
            }

            User user = userRepository.findWithRolesByEmail(email)
                    .orElse(null);

            if (user == null) {
                log.warn("JWT subject does not match a database user");
                reject(response);
                return;
            }

            if (!user.isEnabled() || user.isLocked()) {
                log.warn("User disabled or locked");
                reject(response);
                return;
            }

            List<SimpleGrantedAuthority> authorities =
                    user.getRoles().stream()
                            .map(role ->
                                    new SimpleGrantedAuthority(role.getName()))
                            .toList();

            log.info("Authorities loaded: {}", authorities);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(), null, authorities);

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);
            log.info(
                    "Authentication set: {}, authorities: {}",
                    SecurityContextHolder.getContext().getAuthentication().isAuthenticated(),
                    SecurityContextHolder.getContext().getAuthentication().getAuthorities()
            );
        } catch (JwtException | IllegalArgumentException exception) {
            log.warn("JWT parsing failed: {}", exception.getMessage());
            reject(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void reject(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.sendError(
                HttpServletResponse.SC_UNAUTHORIZED,
                "Invalid or expired JWT"
        );
    }
}
