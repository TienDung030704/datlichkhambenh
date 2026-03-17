package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.service.JwtService;
import com.webdatlichkhambenh.service.PatientProfileService;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
public class PatientProfileController {

    @Autowired
    private PatientProfileService profileService;

    @Autowired
    private JwtService jwtService;

    private String extractUsername(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new JwtException("Missing token");
        }
        String token = authHeader.substring(7);
        return jwtService.getUsernameFromToken(token);
    }

    @GetMapping
    public ResponseEntity<?> getDanhSachHoSo(@RequestHeader("Authorization") String authHeader) {
        try {
            String username = extractUsername(authHeader);
            List<Map<String, Object>> profiles = profileService.getDanhSachHoSo(username);
            return ResponseEntity.ok(Map.of("success", true, "profiles", profiles));
        } catch (JwtException e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Phiên đăng nhập hết hạn"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Lỗi server: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> themHoSo(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> data) {
        try {
            String username = extractUsername(authHeader);
            Map<String, Object> result = profileService.themHoSo(username, data);
            int status = Boolean.TRUE.equals(result.get("success")) ? 200 : 400;
            return ResponseEntity.status(status).body(result);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Phiên đăng nhập hết hạn"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Lỗi server: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> capNhatHoSo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id,
            @RequestBody Map<String, Object> data) {
        try {
            String username = extractUsername(authHeader);
            Map<String, Object> result = profileService.capNhatHoSo(username, id, data);
            int status = Boolean.TRUE.equals(result.get("success")) ? 200 : 400;
            return ResponseEntity.status(status).body(result);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Phiên đăng nhập hết hạn"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Lỗi server: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaHoSo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id) {
        try {
            String username = extractUsername(authHeader);
            Map<String, Object> result = profileService.xoaHoSo(username, id);
            int status = Boolean.TRUE.equals(result.get("success")) ? 200 : 400;
            return ResponseEntity.status(status).body(result);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Phiên đăng nhập hết hạn"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Lỗi server: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/mac-dinh")
    public ResponseEntity<?> datLamMacDinh(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id) {
        try {
            String username = extractUsername(authHeader);
            Map<String, Object> result = profileService.datLamMacDinh(username, id);
            int status = Boolean.TRUE.equals(result.get("success")) ? 200 : 400;
            return ResponseEntity.status(status).body(result);
        } catch (JwtException e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Phiên đăng nhập hết hạn"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Lỗi server: " + e.getMessage()));
        }
    }
}
