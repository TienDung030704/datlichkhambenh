package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.model.Doctor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Service
public class DoctorService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Doctor> doctorRowMapper = new RowMapper<Doctor>() {
        @Override
        public Doctor mapRow(ResultSet rs, int rowNum) throws SQLException {
            Doctor doctor = new Doctor();
            doctor.setId(rs.getInt("id"));
            doctor.setSpecialtyId(rs.getInt("specialty_id"));
            doctor.setFullName(rs.getString("full_name"));
            doctor.setEmail(rs.getString("email"));
            doctor.setPhoneNumber(rs.getString("phone_number"));
            doctor.setAddress(rs.getString("address"));
            doctor.setLicenseNumber(rs.getString("license_number"));
            doctor.setExperience(rs.getDouble("experience"));
            doctor.setIsActive(rs.getBoolean("is_active"));

            // Get specialty name
            String specialtyName = getSpecialtyName(rs.getInt("specialty_id"));
            doctor.setSpecialtyName(specialtyName);

            return doctor;
        }
    };

    // Get doctors by specialty id
    public List<Doctor> getDoctorsBySpecialtyId(Integer specialtyId) {
        try {
            String sql = "SELECT id, specialty_id, full_name, email, phone_number, address, license_number, experience, is_active FROM doctors WHERE specialty_id = ? AND is_active = 1";
            return jdbcTemplate.query(sql, doctorRowMapper, specialtyId);
        } catch (Exception e) {
            System.out.println("Error getting doctors by specialty: " + e.getMessage());
            return List.of();
        }
    }

    // Get doctors by specialty id with limit (for distribution across days)
    public List<Doctor> getDoctorsBySpecialtyIdWithLimit(Integer specialtyId, Integer limit) {
        try {
            String sql = "SELECT id, specialty_id, full_name, email, phone_number, address, license_number, experience, is_active FROM doctors WHERE specialty_id = ? AND is_active = 1 LIMIT ?";
            return jdbcTemplate.query(sql, doctorRowMapper, specialtyId, limit);
        } catch (Exception e) {
            System.out.println("Error getting doctors by specialty with limit: " + e.getMessage());
            return List.of();
        }
    }

    // Get doctor by id
    public Doctor getDoctorById(Integer id) {
        try {
            String sql = "SELECT id, specialty_id, full_name, email, phone_number, address, license_number, experience, is_active FROM doctors WHERE id = ? AND is_active = 1";
            List<Doctor> doctors = jdbcTemplate.query(sql, doctorRowMapper, id);
            return doctors.isEmpty() ? null : doctors.get(0);
        } catch (Exception e) {
            System.out.println("Error getting doctor by id: " + e.getMessage());
            return null;
        }
    }

    // Create new doctor
    public Integer createDoctor(Integer specialtyId, String fullName, String email,
            String phoneNumber, String address, String licenseNumber, Double experience) {
        try {
            String sql = "INSERT INTO doctors (specialty_id, full_name, email, phone_number, address, license_number, experience, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())";
            jdbcTemplate.update(sql, specialtyId, fullName, email, phoneNumber, address, licenseNumber, experience);

            // Get the created doctor id
            String getIdSql = "SELECT id FROM doctors WHERE license_number = ? ORDER BY created_at DESC LIMIT 1";
            List<Integer> ids = jdbcTemplate.query(getIdSql, (rs, rowNum) -> rs.getInt("id"), licenseNumber);
            return ids.isEmpty() ? 0 : ids.get(0);
        } catch (Exception e) {
            System.out.println("Error creating doctor: " + e.getMessage());
            return 0;
        }
    }

    // Distribute doctors to work days (Thứ 2 - Thứ 7)
    public Map<Integer, List<Doctor>> distributeDoctorsAcrossDays(Integer specialtyId) {
        Map<Integer, List<Doctor>> distribution = new HashMap<>();
        List<Doctor> doctors = getDoctorsBySpecialtyId(specialtyId);

        // Initialize map for days 2-7 (Thứ 2 - Thứ 7, chủ nhật = 1)
        for (int day = 2; day <= 7; day++) {
            distribution.put(day, new ArrayList<>());
        }

        // Distribute doctors evenly across 6 days
        int dayIndex = 0;
        for (Doctor doctor : doctors) {
            int day = dayIndex % 6 + 2; // 2-7
            distribution.get(day).add(doctor);
            dayIndex++;
        }

        return distribution;
    }

    // Get specialty name
    private String getSpecialtyName(Integer specialtyId) {
        try {
            String sql = "SELECT name FROM specialties WHERE id = ?";
            List<String> names = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("name"), specialtyId);
            return names.isEmpty() ? "" : names.get(0);
        } catch (Exception e) {
            System.out.println("Error getting specialty name: " + e.getMessage());
            return "";
        }
    }

    // Find doctors by specialty name keyword (for chatbot)
    public List<Map<String, Object>> findDoctorsBySpecialtyKeyword(String specialtyKeyword) {
        try {
            String sql = "SELECT d.id, d.full_name, d.specialization, d.price, s.specialty_name " +
                    "FROM doctors d " +
                    "LEFT JOIN specialties s ON d.specialty_id = s.id " +
                    "WHERE s.specialty_name LIKE ? AND d.is_active = 1 " +
                    "LIMIT 5";
            return jdbcTemplate.queryForList(sql, "%" + specialtyKeyword + "%");
        } catch (Exception e) {
            System.out.println("Error finding doctors by specialty keyword: " + e.getMessage());
            return List.of();
        }
    }
}
