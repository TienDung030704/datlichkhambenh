package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.dto.LoginRequest;
import com.webdatlichkhambenh.dto.RegisterRequest;
import com.webdatlichkhambenh.dto.AuthResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Cho phép CORS từ mọi domain
public class AuthController {

    /**
     * API đăng nhập
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Validate input
            if (loginRequest.getUsername() == null || loginRequest.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Tên đăng nhập không được để trống"));
            }
            
            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Mật khẩu không được để trống"));
            }

            // TODO: Thực hiện logic đăng nhập thực tế với database
            // Hiện tại chỉ là demo với tài khoản cứng
            String username = loginRequest.getUsername().trim();
            String password = loginRequest.getPassword().trim();
            
            // Demo: admin/admin123 là tài khoản hợp lệ
            if ("admin".equals(username) && "admin123".equals(password)) {
                // Tạo token giả (trong thực tế sẽ dùng JWT)
                String token = "demo_token_" + System.currentTimeMillis();
                
                return ResponseEntity.ok(
                    new AuthResponse(true, "Đăng nhập thành công", token, username)
                );
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Tên đăng nhập hoặc mật khẩu không đúng"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponse(false, "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    /**
     * API đăng ký
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Validate input
            if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Tên đăng nhập không được để trống"));
            }
            
            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Mật khẩu không được để trống"));
            }
            
            if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Email không được để trống"));
            }
            
            if (registerRequest.getFullName() == null || registerRequest.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Họ và tên không được để trống"));
            }

            // Validate email format (basic)
            String email = registerRequest.getEmail().trim();
            if (!email.contains("@") || !email.contains(".")) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Định dạng email không hợp lệ"));
            }

            // Validate password length
            if (registerRequest.getPassword().length() < 6) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Mật khẩu phải có ít nhất 6 ký tự"));
            }

            // TODO: Thực hiện logic đăng ký thực tế với database
            // Hiện tại chỉ là demo
            String username = registerRequest.getUsername().trim();
            
            // Demo: Kiểm tra user đã tồn tại (giả lập)
            if ("admin".equals(username)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(false, "Tên đăng nhập đã tồn tại"));
            }
            
            // Demo: Đăng ký thành công
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(true, "Đăng ký tài khoản thành công"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponse(false, "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    /**
     * API kiểm tra trạng thái đăng nhập
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Token không được cung cấp"));
            }
            
            // TODO: Validate JWT token thực tế
            // Demo: Kiểm tra token giả
            if (token.startsWith("demo_token_")) {
                return ResponseEntity.ok(
                    new AuthResponse(true, "Token hợp lệ", token, "admin")
                );
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Token không hợp lệ"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponse(false, "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    /**
     * API đăng xuất
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // TODO: Thực hiện logic đăng xuất (blacklist token, xóa session, etc.)
            // Hiện tại chỉ trả về thành công
            return ResponseEntity.ok(
                new AuthResponse(true, "Đăng xuất thành công")
            );
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponse(false, "Lỗi hệ thống: " + e.getMessage()));
        }
    }
}