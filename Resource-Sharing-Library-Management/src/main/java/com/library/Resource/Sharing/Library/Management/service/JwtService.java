package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final int expiryTime = 1000 * 60 * 60;
    private final String key = "fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    private final SecretKey secretKey = Keys.hmacShaKeyFor(
            Decoders.BASE64.decode(key)
    );
    private final Logger LOGGER = LoggerFactory.getLogger(JwtService.class);

    public String generateToken(User user) {
        LOGGER.debug("Generating token");
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getUserId())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiryTime))
                .signWith(secretKey)
                .compact();
    }

    public io.jsonwebtoken.Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object id = extractAllClaims(token).get("userId");
        if (id instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public boolean validateToken(String token) {
        try {
            io.jsonwebtoken.Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            LOGGER.debug("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }
}
