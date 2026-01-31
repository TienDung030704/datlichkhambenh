package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public boolean login(String username, String password) {
        try {
            String sql = "SELECT COUNT(*) FROM users WHERE (username = ? OR email = ?) AND password = ? AND is_active = 1";
            int count = jdbcTemplate.queryForObject(sql, Integer.class, username, username, password);
            return count > 0;
        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            return false;
        }
    }
    
    public boolean register(RegisterRequest request) {
        try {
            // Thêm user mới (không cần kiểm tra tồn tại vì đã kiểm tra ở Controller)
            String insertSql = "INSERT INTO users (username, password, email, full_name, phone_number, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'PATIENT', 1, NOW(), NOW())";
            
            int result = jdbcTemplate.update(insertSql, 
                request.getUsername(), 
                request.getPassword(), 
                request.getEmail(), 
                request.getFullName(), 
                request.getPhoneNumber()
            );
            
            return result > 0;
            
        } catch (Exception e) {
            System.out.println("Register error: " + e.getMessage());
            return false;
        }
    }
    
    public boolean userExists(String username) {
        try {
            String sql = "SELECT COUNT(*) FROM users WHERE username = ?";
            int count = jdbcTemplate.queryForObject(sql, Integer.class, username);
            return count > 0;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean emailExists(String email) {
        try {
            String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
            int count = jdbcTemplate.queryForObject(sql, Integer.class, email);
            return count > 0;
        } catch (Exception e) {
            return false;
        }
    }
    
    public void saveRefreshToken(String username, String refreshToken, java.sql.Timestamp expiresAt) {
        try {
            String sql = "UPDATE users SET refresh_token = ?, token_expires_at = ?, updated_at = NOW() WHERE username = ?";
            jdbcTemplate.update(sql, refreshToken, expiresAt, username);
        } catch (Exception e) {
            System.out.println("Save refresh token error: " + e.getMessage());
        }
    }
    
    public String getRefreshToken(String username) {
        try {
            String sql = "SELECT refresh_token FROM users WHERE username = ? AND is_active = 1";
            return jdbcTemplate.queryForObject(sql, String.class, username);
        } catch (Exception e) {
            return null;
        }
    }
    
    public void clearRefreshToken(String username) {
        try {
            String sql = "UPDATE users SET refresh_token = NULL, token_expires_at = NULL, updated_at = NOW() WHERE username = ?";
            jdbcTemplate.update(sql, username);
        } catch (Exception e) {
            System.out.println("Clear refresh token error: " + e.getMessage());
        }
    }
    
    public String getFullName(String usernameOrEmail) {
        try {
            System.out.println("🔍 Searching fullName for: " + usernameOrEmail);
            
            // Try search by username first
            String sql = "SELECT full_name FROM users WHERE username = ? AND is_active = 1";
            try {
                String fullName = jdbcTemplate.queryForObject(sql, String.class, usernameOrEmail);
                System.out.println("✅ Found by username: " + fullName);
                return fullName;
            } catch (Exception e) {
                System.out.println("⚠️ Not found by username, trying email...");
            }
            
            // If not found by username, try by email
            sql = "SELECT full_name FROM users WHERE email = ? AND is_active = 1";
            try {
                String fullName = jdbcTemplate.queryForObject(sql, String.class, usernameOrEmail);
                System.out.println("✅ Found by email: " + fullName);
                return fullName;
            } catch (Exception e) {
                System.out.println("❌ Not found by email either");
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("❌ Error getting fullName: " + e.getMessage());
            return null;
        }
    }
}