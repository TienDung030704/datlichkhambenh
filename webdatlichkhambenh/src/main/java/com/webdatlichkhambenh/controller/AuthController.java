package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.dto.LoginRequest;
import com.webdatlichkhambenh.dto.RegisterRequest;
import com.webdatlichkhambenh.service.UserService;
import com.webdatlichkhambenh.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Username không được để trống");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Password không được để trống");
            return ResponseEntity.badRequest().body(response);
        }
        
        boolean success = userService.login(request.getUsername(), request.getPassword());
        
        if (success) {
            String accessToken = jwtService.generateAccessToken(request.getUsername());
            String refreshToken = jwtService.generateRefreshToken(request.getUsername());
            
            // Save refresh token to database
            jwtService.saveRefreshTokenToDatabase(request.getUsername(), refreshToken);
            
            response.put("success", true);
            response.put("message", "Đăng nhập thành công");
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("username", request.getUsername());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Username hoặc password không đúng");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // Validate input
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Username không được để trống");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Password không được để trống");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email không được để trống");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Họ tên không được để trống");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (request.getPassword().length() < 6) {
            response.put("success", false);
            response.put("message", "Password phải có ít nhất 6 ký tự");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Kiểm tra email đã tồn tại
        if (userService.emailExists(request.getEmail())) {
            response.put("success", false);
            response.put("message", "Email này đã được sử dụng");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Kiểm tra username đã tồn tại
        if (userService.userExists(request.getUsername())) {
            response.put("success", false);
            response.put("message", "Tên đăng nhập đã tồn tại");
            return ResponseEntity.badRequest().body(response);
        }
        
        boolean success = userService.register(request);
        
        if (success) {
            // Tự động tạo token sau khi đăng ký thành công
            String accessToken = jwtService.generateAccessToken(request.getUsername());
            String refreshToken = jwtService.generateRefreshToken(request.getUsername());
            
            // Save refresh token to database
            jwtService.saveRefreshTokenToDatabase(request.getUsername(), refreshToken);
            
            response.put("success", true);
            response.put("message", "Đăng ký thành công");
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("username", request.getUsername());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Đăng ký không thành công. Vui lòng thử lại");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        String refreshToken = request.get("refreshToken");
        String username = request.get("username");
        
        if (refreshToken == null || username == null) {
            response.put("success", false);
            response.put("message", "Refresh token và username không được để trống");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (jwtService.validateRefreshToken(refreshToken, username)) {
            String newAccessToken = jwtService.generateAccessToken(username);
            String newRefreshToken = jwtService.generateRefreshToken(username);
            
            // Save new tokens to database
            jwtService.saveRefreshTokenToDatabase(username, newRefreshToken);
            
            response.put("success", true);
            response.put("message", "Token đã được làm mới");
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);
            response.put("username", username);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Refresh token không hợp lệ hoặc đã hết hạn");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        String username = request.get("username");
        if (username != null) {
            jwtService.revokeRefreshToken(username);
        }
        
        response.put("success", true);
        response.put("message", "Đăng xuất thành công");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API đang hoạt động!");
    }
}