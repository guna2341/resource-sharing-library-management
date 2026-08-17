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

}
