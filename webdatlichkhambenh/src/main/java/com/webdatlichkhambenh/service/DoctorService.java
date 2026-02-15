package com.webdatlichkhambenh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class DoctorService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Find doctors by specialty keyword (e.g., "Tim", "Nhi", "Da liễu")
     */
    public List<Map<String, Object>> findDoctorsBySpecialtyKeyword(String keyword) {
        try {
            String sql = """
                    SELECT d.id, d.full_name, d.specialization, d.price, d.image, s.specialty_name
                    FROM doctors d
                    JOIN specialties s ON d.specialty_id = s.id
                    WHERE d.is_active = 1
                    AND (s.specialty_name LIKE ? OR d.specialization LIKE ?)
                    LIMIT 3
                    """;

            String search = "%" + keyword + "%";
            List<Map<String, Object>> doctors = jdbcTemplate.queryForList(sql, search, search);

            // Format for frontend
            for (Map<String, Object> doc : doctors) {
                // CamelCase for consumers
                doc.put("fullName", doc.get("full_name"));
                doc.put("specialtyName", doc.get("specialty_name"));

                doc.remove("full_name");
                doc.remove("specialty_name");
            }

            return doctors;
        } catch (Exception e) {
            System.err.println("Error finding doctors: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}
