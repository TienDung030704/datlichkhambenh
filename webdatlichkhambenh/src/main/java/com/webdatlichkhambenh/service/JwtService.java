package com.webdatlichkhambenh.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    
    @Autowired
    private UserService userService;
    
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long ACCESS_TOKEN_VALIDITY = 15 * 60 * 1000; // 15 minutes
    private final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    public String generateAccessToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        return createToken(claims, username, ACCESS_TOKEN_VALIDITY);
    }
    
    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        String refreshToken = createToken(claims, username, REFRESH_TOKEN_VALIDITY);
        
        return refreshToken;
    }
    
    public void saveRefreshTokenToDatabase(String username, String refreshToken) {
        // Calculate refresh token expiration time
        Timestamp expiresAt = new Timestamp(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY);
        userService.saveRefreshToken(username, refreshToken, expiresAt);
    }
    
    private String createToken(Map<String, Object> claims, String subject, long validity) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + validity))
                .signWith(SECRET_KEY)
                .compact();
    }
    
    public Boolean validateToken(String token, String username) {
        try {
            final String tokenUsername = getUsernameFromToken(token);
            return (tokenUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }
    
    public Boolean validateRefreshToken(String token, String username) {
        try {
            String storedToken = userService.getRefreshToken(username);
            if (storedToken == null || !storedToken.equals(token)) {
                return false;
            }
            
            final String tokenUsername = getUsernameFromToken(token);
            String tokenType = getTokenType(token);
            
            return (tokenUsername.equals(username) && 
                    "refresh".equals(tokenType) && 
                    !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }
    
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }
    
    public String getTokenType(String token) {
        return getClaimFromToken(token, claims -> (String) claims.get("type"));
    }
    
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }
    
    public <T> T getClaimFromToken(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
    
    public void revokeRefreshToken(String username) {
        userService.clearRefreshToken(username);
    }
    
    public boolean isTokenExpiringSoon(String token) {
        try {
            final Date expiration = getExpirationDateFromToken(token);
            final Date now = new Date();
            long timeUntilExpiration = expiration.getTime() - now.getTime();
            
            // Return true if token expires in next 5 minutes
            return timeUntilExpiration < (5 * 60 * 1000);
        } catch (Exception e) {
            return true;
        }
    }
}