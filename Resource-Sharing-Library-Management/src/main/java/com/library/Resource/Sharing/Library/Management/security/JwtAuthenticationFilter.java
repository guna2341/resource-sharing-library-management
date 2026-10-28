package com.library.Resource.Sharing.Library.Management.security;

import com.library.Resource.Sharing.Library.Management.model.User;
import com.library.Resource.Sharing.Library.Management.repository.UserRepository;
import com.library.Resource.Sharing.Library.Management.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            if (jwtService.validateToken(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                String email = jwtService.extractEmail(token);
                Long userId = jwtService.extractUserId(token);

                Optional<User> userOptional = Optional.empty();
                if (userId != null) {
                    userOptional = userRepository.findById(userId);
                }
                if (userOptional.isEmpty() && email != null) {
                    userOptional = userRepository.findByEmail(email);
                }

                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    String roleName = user.getRole() != null ? "ROLE_" + user.getRole().name() : "ROLE_USER";
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(roleName))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            log.debug("Could not authenticate user from JWT: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
