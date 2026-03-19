package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.service.AppointmentService;
import com.webdatlichkhambenh.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private JwtService jwtService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody Map<String, Object> appointmentData) {
        Map<String, Object> response = appointmentService.createAppointment(appointmentData);
        boolean success = Boolean.TRUE.equals(response.get("success"));
        return success ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getLichHenCuaToi(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Chưa đăng nhập"));
        }
        String username;
        try {
            String token = authHeader.substring(7);
            username = jwtService.getUsernameFromToken(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Token không hợp lệ hoặc đã hết hạn"));
        }
        try {
            List<Map<String, Object>> lichHen = appointmentService.getLichHenCuaNguoiDung(username);
            return ResponseEntity.ok(Map.of("success", true, "appointments", lichHen));
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Lỗi khi tải dữ liệu: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    @PutMapping("/{id}/huy")
    public ResponseEntity<Map<String, Object>> huyLichHen(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Chưa đăng nhập"));
        }
        String username;
        try {
            String token = authHeader.substring(7);
            username = jwtService.getUsernameFromToken(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Token không hợp lệ hoặc đã hết hạn"));
        }
        try {
            Map<String, Object> response = appointmentService.huyLichHen(id, username);
            boolean success = Boolean.TRUE.equals(response.get("success"));
            return success ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Lỗi khi hủy lịch hẹn: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }
}