package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.service.AppointmentService;
import com.webdatlichkhambenh.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Endpoint cho phép hủy từ link email (GET)
    @GetMapping("/{id}/cancel")
    public ResponseEntity<String> cancelFromEmail(@PathVariable Integer id) {
        try {
            // Lấy username từ appointment để verify (không cần token ở đây vì gọi từ email)
            String sql = "SELECT u.username FROM appointments a JOIN users u ON a.patient_id = u.id WHERE a.id = ?";
            List<String> usernames = appointmentService.getJdbcTemplate().query(sql, (rs, rowNum) -> rs.getString("username"), id);
            
            if (usernames.isEmpty()) {
                return ResponseEntity.badRequest().body("<h1>Không tìm thấy lịch hẹn</h1>");
            }
            
            Map<String, Object> result = appointmentService.huyLichHen(id, usernames.get(0));
            if (Boolean.TRUE.equals(result.get("success"))) {
                return ResponseEntity.ok("<div style='font-family: sans-serif; text-align: center; padding: 50px;'>" +
                        "<h1>Hủy lịch hẹn thành công</h1>" +
                        "<p>Lịch hẹn của bạn đã được hủy bỏ. Cảm ơn bạn đã thông báo.</p>" +
                        "</div>");
            } else {
                return ResponseEntity.badRequest().body("<h1>Lỗi: " + result.get("message") + "</h1>");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("<h1>Lỗi server khi xử lý yêu cầu hủy lịch</h1>");
        }
    }
}