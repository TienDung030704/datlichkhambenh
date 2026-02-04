package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    /**
     * Get patients count for statistics
     */
    @GetMapping("/patients/count")
    public ResponseEntity<Map<String, Object>> getPatientsCount() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int count = adminService.getPatientsCount();
            response.put("success", true);
            response.put("count", count);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting patients count: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get patients list for admin panel
     */
    @GetMapping("/patients/list")
    public ResponseEntity<Map<String, Object>> getPatientsList(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> patients = adminService.getPatientsList(offset, limit);
            int totalCount = adminService.getPatientsCount();
            
            response.put("success", true);
            response.put("patients", patients);
            response.put("total", totalCount);
            response.put("offset", offset);
            response.put("limit", limit);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting patients list: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get admin dashboard statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Lấy số lượng bệnh nhân từ database thật
            int totalPatients = adminService.getPatientsCount();
            stats.put("totalPatients", totalPatients);
            
            // Lấy số lượng bác sĩ từ database thật
            int totalDoctors = adminService.getDoctorsCount();
            stats.put("totalDoctors", totalDoctors);
            
            // Các thống kê khác tạm thời dùng dữ liệu mẫu
            // TODO: Implement khi có bảng appointments
            stats.put("todayAppointments", 28);
            stats.put("upcomingAppointments", 85);
            
            response.put("success", true);
            response.put("statistics", stats);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting statistics: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Search patients by name or phone
     */
    @GetMapping("/patients/search")
    public ResponseEntity<Map<String, Object>> searchPatients(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> patients = adminService.searchPatients(query, offset, limit);
            
            response.put("success", true);
            response.put("patients", patients);
            response.put("query", query);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error searching patients: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get patient details by ID
     */
    @GetMapping("/patients/{id}")
    public ResponseEntity<Map<String, Object>> getPatientDetails(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> patient = adminService.getPatientById(id);
            
            if (patient != null) {
                response.put("success", true);
                response.put("patient", patient);
            } else {
                response.put("success", false);
                response.put("message", "Patient not found");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting patient details: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update patient status (active/inactive)
     */
    @PutMapping("/patients/{id}/status")
    public ResponseEntity<Map<String, Object>> updatePatientStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Boolean isActive = (Boolean) request.get("isActive");
            boolean updated = adminService.updatePatientStatus(id, isActive);
            
            if (updated) {
                response.put("success", true);
                response.put("message", "Patient status updated successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update patient status");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating patient status: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get doctors list
     */
    @GetMapping("/doctors/list")
    public ResponseEntity<Map<String, Object>> getDoctorsList(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> doctors = adminService.getDoctorsList(offset, limit);
            int totalCount = adminService.getDoctorsCount();
            
            response.put("success", true);
            response.put("doctors", doctors);
            response.put("total", totalCount);
            response.put("offset", offset);
            response.put("limit", limit);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting doctors list: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get specialties list
     */
    @GetMapping("/specialties/list")
    public ResponseEntity<Map<String, Object>> getSpecialtiesList() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> specialties = adminService.getSpecialtiesList();
            
            response.put("success", true);
            response.put("specialties", specialties);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting specialties list: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recent appointments for dashboard (API sẽ return empty nếu chưa có bảng appointments)
     */
    @GetMapping("/appointments/recent")
    public ResponseEntity<Map<String, Object>> getRecentAppointments(
            @RequestParam(defaultValue = "5") int limit) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Hiện tại chưa có bảng appointments, return empty
            response.put("success", true);
            response.put("appointments", List.of()); // Empty list
            response.put("message", "No appointments table available yet");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting recent appointments: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all appointments for management section
     */
    @GetMapping("/appointments/list")
    public ResponseEntity<Map<String, Object>> getAppointmentsList(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Hiện tại chưa có bảng appointments, return empty
            response.put("success", true);
            response.put("appointments", List.of()); // Empty list
            response.put("total", 0);
            response.put("offset", offset);
            response.put("limit", limit);
            response.put("message", "No appointments table available yet");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting appointments list: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}