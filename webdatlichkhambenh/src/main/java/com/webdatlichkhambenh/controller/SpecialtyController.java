package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.model.Specialty;
import com.webdatlichkhambenh.model.Doctor;
import com.webdatlichkhambenh.service.SpecialtyService;
import com.webdatlichkhambenh.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/specialties")
@CrossOrigin(origins = "*")
public class SpecialtyController {

    @Autowired
    private SpecialtyService specialtyService;

    @Autowired
    private DoctorService doctorService;

    // Get all specialties
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSpecialties() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Specialty> specialties = specialtyService.getAllSpecialties();
            response.put("success", true);
            response.put("data", specialties);
            response.put("message", "Lấy danh sách chuyên khoa thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách chuyên khoa: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Get specialty by id with doctors
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSpecialtyById(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Specialty specialty = specialtyService.getSpecialtyById(id);
            if (specialty == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chuyên khoa");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("success", true);
            response.put("data", specialty);
            response.put("message", "Lấy thông tin chuyên khoa thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thông tin chuyên khoa: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Get doctors by specialty id
    @GetMapping("/{specialtyId}/doctors")
    public ResponseEntity<Map<String, Object>> getDoctorsBySpecialty(@PathVariable Integer specialtyId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Specialty specialty = specialtyService.getSpecialtyById(specialtyId);
            if (specialty == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chuyên khoa");
                return ResponseEntity.badRequest().body(response);
            }

            List<Doctor> doctors = doctorService.getDoctorsBySpecialtyId(specialtyId);

            response.put("success", true);
            response.put("specialty", specialty);
            response.put("doctors", doctors);
            response.put("message", "Lấy danh sách bác sĩ thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách bác sĩ: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Get doctors by specialty id with distribution across days
    @GetMapping("/{specialtyId}/doctors-by-days")
    public ResponseEntity<Map<String, Object>> getDoctorsBySpecialtyAndDays(@PathVariable Integer specialtyId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Specialty specialty = specialtyService.getSpecialtyById(specialtyId);
            if (specialty == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chuyên khoa");
                return ResponseEntity.badRequest().body(response);
            }

            Map<Integer, List<Doctor>> doctorsByDay = doctorService.distributeDoctorsAcrossDays(specialtyId);
            Map<String, Object> dayMapping = new HashMap<>();

            String[] dayNames = { "", "Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7" };

            for (Map.Entry<Integer, List<Doctor>> entry : doctorsByDay.entrySet()) {
                String dayName = dayNames[entry.getKey()];
                dayMapping.put(dayName, entry.getValue());
            }

            response.put("success", true);
            response.put("specialty", specialty);
            response.put("doctors_by_day", dayMapping);
            response.put("message", "Lấy danh sách bác sĩ theo ngày thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách bác sĩ theo ngày: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Update specialty price
    @PutMapping("/{id}/price")
    public ResponseEntity<Map<String, Object>> updateSpecialtyPrice(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object priceObj = body.get("price");
            if (priceObj == null) {
                response.put("success", false);
                response.put("message", "Thiếu giá trị price");
                return ResponseEntity.badRequest().body(response);
            }
            Integer price = Integer.parseInt(priceObj.toString());
            boolean updated = specialtyService.updateSpecialtyPrice(id, price);
            if (updated) {
                response.put("success", true);
                response.put("message", "Cập nhật giá thành công");
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy chuyên khoa");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật giá: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Create specialty
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSpecialty(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String name = (String) body.get("name");
            String description = (String) body.getOrDefault("description", "");
            Object priceObj = body.get("price");
            Integer price = priceObj != null ? Integer.parseInt(priceObj.toString()) : 150000;
            if (name == null || name.isBlank()) {
                response.put("success", false);
                response.put("message", "Tên chuyên khoa không được để trống");
                return ResponseEntity.badRequest().body(response);
            }
            boolean created = specialtyService.createSpecialty(name, description, price);
            response.put("success", created);
            response.put("message", created ? "Tạo chuyên khoa thành công" : "Lỗi khi tạo chuyên khoa");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Update specialty
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateSpecialty(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String name = (String) body.get("name");
            String description = (String) body.getOrDefault("description", "");
            Object priceObj = body.get("price");
            Integer price = priceObj != null ? Integer.parseInt(priceObj.toString()) : 150000;
            boolean updated = specialtyService.updateSpecialty(id, name, description, price);
            response.put("success", updated);
            response.put("message", updated ? "Cập nhật thành công" : "Không tìm thấy chuyên khoa");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
