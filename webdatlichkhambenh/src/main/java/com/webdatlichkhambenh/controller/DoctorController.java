package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.model.Doctor;
import com.webdatlichkhambenh.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    // Get doctor by id
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDoctorById(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Doctor doctor = doctorService.getDoctorById(id);
            if (doctor == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy bác sĩ");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("success", true);
            response.put("data", doctor);
            response.put("message", "Lấy thông tin bác sĩ thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thông tin bác sĩ: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
