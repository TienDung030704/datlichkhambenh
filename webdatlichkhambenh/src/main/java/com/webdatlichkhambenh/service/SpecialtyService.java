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
            specialty.setDescription(rs.getString("description"));
            specialty.setDoctorCount(rs.getInt("doctor_count"));
            specialty.setTotalDoctors(rs.getInt("total_doctors"));
            specialty.setPrice(rs.getObject("price") != null ? rs.getInt("price") : 150000);
            specialty.setIsActive(rs.getBoolean("is_active"));
            return specialty;
        }
    };

    // Get all specialties
    public List<Specialty> getAllSpecialties() {
        try {
            String sql = """
                SELECT s.id,
                       s.specialty_name AS name,
                       s.description,
                       s.price,
                       COUNT(d.id) AS doctor_count,
                       COUNT(d.id) AS total_doctors,
                       s.is_active
                FROM specialties s
                LEFT JOIN doctors d ON d.specialty_id = s.id AND d.is_active = 1
                WHERE s.is_active = 1
                GROUP BY s.id, s.specialty_name, s.description, s.price, s.is_active
                ORDER BY s.id
                """;
            return jdbcTemplate.query(sql, specialtyRowMapper);
        } catch (Exception e) {
            System.out.println("Error getting all specialties: " + e.getMessage());
            return List.of();
        }
    }

    // Get specialty by id
    public Specialty getSpecialtyById(Integer id) {
        try {
            String sql = """
                SELECT s.id,
                       s.specialty_name AS name,
                       s.description,
                       s.price,
                       COUNT(d.id) AS doctor_count,
                       COUNT(d.id) AS total_doctors,
                       s.is_active
                FROM specialties s
                LEFT JOIN doctors d ON d.specialty_id = s.id AND d.is_active = 1
                WHERE s.id = ? AND s.is_active = 1
                GROUP BY s.id, s.specialty_name, s.description, s.price, s.is_active
                """;
            List<Specialty> specialties = jdbcTemplate.query(sql, new Object[] { id }, specialtyRowMapper);
            return specialties.isEmpty() ? null : specialties.get(0);
        } catch (Exception e) {
            System.out.println("Error getting specialty by id: " + e.getMessage());
            return null;
        }
    }

    // Create new specialty
    public boolean createSpecialty(String name, String description, Integer price) {
        try {
            String sql = "INSERT INTO specialties (specialty_name, description, price, is_active, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())";
            int result = jdbcTemplate.update(sql, name, description, price != null ? price : 150000);
            return result > 0;
        } catch (Exception e) {
            System.out.println("Error creating specialty: " + e.getMessage());
            return false;
        }
    }

    // Update specialty
    public boolean updateSpecialty(Integer id, String name, String description, Integer price) {
        try {
            String sql = "UPDATE specialties SET specialty_name = ?, description = ?, price = ?, updated_at = NOW() WHERE id = ?";
            int result = jdbcTemplate.update(sql, name, description, price != null ? price : 150000, id);
            return result > 0;
        } catch (Exception e) {
            System.out.println("Error updating specialty: " + e.getMessage());
            return false;
        }
    }

    // Update specialty price only
    public boolean updateSpecialtyPrice(Integer id, Integer price) {
        try {
            String sql = "UPDATE specialties SET price = ?, updated_at = NOW() WHERE id = ?";
            int result = jdbcTemplate.update(sql, price, id);
            return result > 0;
        } catch (Exception e) {
            System.out.println("Error updating specialty price: " + e.getMessage());
            return false;
        }
    }
}
