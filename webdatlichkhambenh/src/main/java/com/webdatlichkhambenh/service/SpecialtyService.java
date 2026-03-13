package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.model.Specialty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Service
public class SpecialtyService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Specialty> specialtyRowMapper = new RowMapper<Specialty>() {
        @Override
        public Specialty mapRow(ResultSet rs, int rowNum) throws SQLException {
            Specialty specialty = new Specialty();
            specialty.setId(rs.getInt("id"));
            specialty.setName(rs.getString("name"));
            specialty.setDoctorCount(rs.getInt("doctor_count"));
            specialty.setTotalDoctors(rs.getInt("total_doctors"));
            specialty.setIsActive(rs.getBoolean("is_active"));
            return specialty;
        }
    };

    // Get all specialties
    public List<Specialty> getAllSpecialties() {
        try {
            String sql = "SELECT id, name, doctor_count, total_doctors, is_active FROM specialties WHERE is_active = 1 ORDER BY id";
            return jdbcTemplate.query(sql, specialtyRowMapper);
        } catch (Exception e) {
            System.out.println("Error getting all specialties: " + e.getMessage());
            return List.of();
        }
    }

    // Get specialty by id
    public Specialty getSpecialtyById(Integer id) {
        try {
            String sql = "SELECT id, name, doctor_count, total_doctors, is_active FROM specialties WHERE id = ? AND is_active = 1";
            List<Specialty> specialties = jdbcTemplate.query(sql, new Object[] { id }, specialtyRowMapper);
            return specialties.isEmpty() ? null : specialties.get(0);
        } catch (Exception e) {
            System.out.println("Error getting specialty by id: " + e.getMessage());
            return null;
        }
    }

    // Create new specialty
    public boolean createSpecialty(String name, String description, Integer doctorCount) {
        try {
            String sql = "INSERT INTO specialties (name, description, doctor_count, total_doctors, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())";
            int result = jdbcTemplate.update(sql, name, description, doctorCount, doctorCount);
            return result > 0;
        } catch (Exception e) {
            System.out.println("Error creating specialty: " + e.getMessage());
            return false;
        }
    }

    // Update specialty
    public boolean updateSpecialty(Integer id, String name, String description, Integer doctorCount) {
        try {
            String sql = "UPDATE specialties SET name = ?, description = ?, doctor_count = ?, total_doctors = ?, updated_at = NOW() WHERE id = ?";
            int result = jdbcTemplate.update(sql, name, description, doctorCount, doctorCount, id);
            return result > 0;
        } catch (Exception e) {
            System.out.println("Error updating specialty: " + e.getMessage());
            return false;
        }
    }
}
