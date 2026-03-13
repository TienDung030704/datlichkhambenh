package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

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
    
    // Get user profile by username or email
    public Map<String, Object> getUserProfile(String username) {
        try {
            String query = "SELECT full_name, email, phone_number, date_of_birth, gender FROM users WHERE (username = ? OR email = ?) AND is_active = 1";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(query, username, username);
            
            if (!results.isEmpty()) {
                Map<String, Object> user = results.get(0);
                Map<String, Object> profile = new HashMap<>();
                
                // Convert gender enum from database to Vietnamese display
                String genderFromDb = (String) user.get("gender");
                String genderDisplay = null;
                if (genderFromDb != null) {
                    switch (genderFromDb.toUpperCase()) {
                        case "MALE":
                            genderDisplay = "Nam";
                            break;
                        case "FEMALE":
                            genderDisplay = "Nữ";
                            break;
                        case "OTHER":
                            genderDisplay = "Khác";
                            break;
                        default:
                            genderDisplay = genderFromDb;
                            break;
                    }
                }
                
                profile.put("fullName", user.get("full_name"));
                profile.put("email", user.get("email"));
                profile.put("phone", user.get("phone_number"));
                profile.put("birthDate", user.get("date_of_birth"));
                profile.put("gender", genderDisplay);
                
                return profile;
            }
        } catch (Exception e) {
            System.err.println("Error getting user profile: " + e.getMessage());
        }
        
        return null;
    }
    
    // Update user profile
    public boolean updateUserProfile(String emailOrUsername, Map<String, Object> profileData) {
        try {
            // First check if user exists
            String checkQuery = "SELECT COUNT(*) FROM users WHERE (username = ? OR email = ?) AND is_active = 1";
            int userCount = jdbcTemplate.queryForObject(checkQuery, Integer.class, emailOrUsername, emailOrUsername);
            
            if (userCount == 0) {
                return false;
            }
            
            // Update query matching exact database column names
            String query = "UPDATE users SET full_name = ?, email = ?, phone_number = ?, date_of_birth = ?, gender = ?, updated_at = NOW() WHERE (username = ? OR email = ?) AND is_active = 1";
            
            // Handle all field values
            String fullName = (String) profileData.get("fullName");
            String email = (String) profileData.get("email");
            String phone = (String) profileData.get("phone");
            String birthDateStr = (String) profileData.get("birthDate");
            String genderInput = (String) profileData.get("gender");
            
            // Convert empty strings to null (but keep email as is since it's required)
            if (birthDateStr != null && birthDateStr.trim().isEmpty()) birthDateStr = null;
            if (phone != null && phone.trim().isEmpty()) phone = null;
            if (genderInput != null && genderInput.trim().isEmpty()) genderInput = null;
            if (fullName != null && fullName.trim().isEmpty()) fullName = null;
            
            // Validate required fields
            if (fullName == null || email == null) {
                return false;
            }
            
            // Convert Vietnamese gender to English enum values
            String gender = null;
            if (genderInput != null) {
                switch (genderInput.toLowerCase().trim()) {
                    case "nam":
                    case "male":
                        gender = "MALE";
                        break;
                    case "nữ":
                    case "nu":
                    case "female":
                        gender = "FEMALE";
                        break;
                    case "khác":
                    case "khac":
                    case "other":
                        gender = "OTHER";
                        break;
                    default:
                        gender = null;
                        break;
                }
            }
            
            // Convert date format for MySQL
            java.sql.Date birthDate = null;
            if (birthDateStr != null && !birthDateStr.trim().isEmpty()) {
                try {
                    birthDate = java.sql.Date.valueOf(birthDateStr);
                } catch (Exception e) {
                    birthDate = null;
                }
            }
            
            int rowsUpdated = jdbcTemplate.update(query,
                fullName,
                email,
                phone,
                birthDate,
                gender,
                emailOrUsername,
                emailOrUsername
            );
            
            return rowsUpdated > 0;
        } catch (Exception e) {
            System.err.println("Error updating user profile: " + e.getMessage());
            return false;
        }
    }
    
    // Change user password
    public boolean changePassword(String username, String currentPassword, String newPassword) {
        try {
            // First verify current password
            String verifyQuery = "SELECT COUNT(*) FROM users WHERE (username = ? OR email = ?) AND password = ? AND is_active = 1";
            int count = jdbcTemplate.queryForObject(verifyQuery, Integer.class, username, username, currentPassword);
            
            if (count == 0) {
                return false; // Current password is incorrect
            }
            
            // Update password
            String updateQuery = "UPDATE users SET password = ?, updated_at = NOW() WHERE (username = ? OR email = ?) AND is_active = 1";
            int rowsUpdated = jdbcTemplate.update(updateQuery, newPassword, username, username);
            
            return rowsUpdated > 0;
        } catch (Exception e) {
            System.err.println("Error changing password: " + e.getMessage());
            return false;
        }
    }
}