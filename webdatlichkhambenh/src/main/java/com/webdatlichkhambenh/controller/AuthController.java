package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.dto.LoginRequest;
import com.webdatlichkhambenh.dto.RegisterRequest;
import com.webdatlichkhambenh.service.UserService;
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
            String token = "token_" + request.getUsername() + "_" + System.currentTimeMillis();
            response.put("success", true);
            response.put("message", "Đăng nhập thành công");
            response.put("token", token);
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
        
        boolean success = userService.register(request);
        
        if (success) {
            response.put("success", true);
            response.put("message", "Đăng ký thành công");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Username hoặc email đã tồn tại");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API đang hoạt động!");
    }
}