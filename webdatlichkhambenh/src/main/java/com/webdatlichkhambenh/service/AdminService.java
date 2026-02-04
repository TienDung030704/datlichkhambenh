package com.webdatlichkhambenh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AdminService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * Get total number of patients (users with role PATIENT)
     */
    public int getPatientsCount() {
        try {
            String sql = "SELECT COUNT(*) FROM users WHERE role = 'PATIENT' AND is_active = 1";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            System.err.println("Error getting patients count: " + e.getMessage());
            return 0;
        }
    }
    
    /**
     * Get patients list with pagination
     */
    public List<Map<String, Object>> getPatientsList(int offset, int limit) {
        try {
            String sql = """
                SELECT id, username, email, full_name, phone_number, 
                       date_of_birth, gender, created_at, is_active
                FROM users 
                WHERE role = 'PATIENT' 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
                """;
            
            List<Map<String, Object>> patients = jdbcTemplate.queryForList(sql, limit, offset);
            
            // Convert column names to camelCase for frontend
            for (Map<String, Object> patient : patients) {
                patient.put("fullName", patient.get("full_name"));
                patient.put("phoneNumber", patient.get("phone_number"));
                patient.put("dateOfBirth", patient.get("date_of_birth"));
                patient.put("createdAt", patient.get("created_at"));
                patient.put("isActive", patient.get("is_active"));
                
                // Remove snake_case keys
                patient.remove("full_name");
                patient.remove("phone_number");
                patient.remove("date_of_birth");
                patient.remove("created_at");
                patient.remove("is_active");
            }
            
            return patients;
            
        } catch (Exception e) {
            System.err.println("Error getting patients list: " + e.getMessage());
            return List.of(); // Return empty list on error
        }
    }
    
    /**
     * Search patients by name, email, or phone number
     */
    public List<Map<String, Object>> searchPatients(String query, int offset, int limit) {
        try {
            String sql = """
                SELECT id, username, email, full_name, phone_number, 
                       date_of_birth, gender, created_at, is_active
                FROM users 
                WHERE role = 'PATIENT' 
                AND (full_name LIKE ? OR email LIKE ? OR phone_number LIKE ? OR username LIKE ?)
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
                """;
            
            String searchPattern = "%" + query + "%";
            List<Map<String, Object>> patients = jdbcTemplate.queryForList(sql, 
                searchPattern, searchPattern, searchPattern, searchPattern, limit, offset);
            
            // Convert column names to camelCase
            for (Map<String, Object> patient : patients) {
                patient.put("fullName", patient.get("full_name"));
                patient.put("phoneNumber", patient.get("phone_number"));
                patient.put("dateOfBirth", patient.get("date_of_birth"));
                patient.put("createdAt", patient.get("created_at"));
                patient.put("isActive", patient.get("is_active"));
                
                patient.remove("full_name");
                patient.remove("phone_number");
                patient.remove("date_of_birth");
                patient.remove("created_at");
                patient.remove("is_active");
            }
            
            return patients;
            
        } catch (Exception e) {
            System.err.println("Error searching patients: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Get patient by ID
     */
    public Map<String, Object> getPatientById(Long id) {
        try {
            String sql = """
                SELECT id, username, email, full_name, phone_number, 
                       date_of_birth, gender, created_at, updated_at, is_active
                FROM users 
                WHERE id = ? AND role = 'PATIENT'
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, id);
            
            if (!results.isEmpty()) {
                Map<String, Object> patient = results.get(0);
                
                // Convert to camelCase
                patient.put("fullName", patient.get("full_name"));
                patient.put("phoneNumber", patient.get("phone_number"));
                patient.put("dateOfBirth", patient.get("date_of_birth"));
                patient.put("createdAt", patient.get("created_at"));
                patient.put("updatedAt", patient.get("updated_at"));
                patient.put("isActive", patient.get("is_active"));
                
                patient.remove("full_name");
                patient.remove("phone_number");
                patient.remove("date_of_birth");
                patient.remove("created_at");
                patient.remove("updated_at");
                patient.remove("is_active");
                
                return patient;
            }
            
            return null;
            
        } catch (Exception e) {
            System.err.println("Error getting patient by ID: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Update patient active status
     */
    public boolean updatePatientStatus(Long id, Boolean isActive) {
        try {
            String sql = "UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ? AND role = 'PATIENT'";
            int rowsUpdated = jdbcTemplate.update(sql, isActive, id);
            return rowsUpdated > 0;
            
        } catch (Exception e) {
            System.err.println("Error updating patient status: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get dashboard statistics
     */
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Total patients
            int totalPatients = getPatientsCount();
            stats.put("totalPatients", totalPatients);
            
            // Active patients today
            String todayPatientsSql = """
                SELECT COUNT(*) FROM users 
                WHERE role = 'PATIENT' AND is_active = 1 
                AND DATE(created_at) = CURDATE()
                """;
            int todayPatients = jdbcTemplate.queryForObject(todayPatientsSql, Integer.class);
            stats.put("todayPatients", todayPatients);
            
            // Patients this month
            String monthPatientsSql = """
                SELECT COUNT(*) FROM users 
                WHERE role = 'PATIENT' AND is_active = 1 
                AND YEAR(created_at) = YEAR(CURDATE()) 
                AND MONTH(created_at) = MONTH(CURDATE())
                """;
            int monthPatients = jdbcTemplate.queryForObject(monthPatientsSql, Integer.class);
            stats.put("monthPatients", monthPatients);
            
            // TODO: Add appointments, doctors statistics when tables are available
            stats.put("todayAppointments", 28);
            stats.put("upcomingAppointments", 85);
            stats.put("totalDoctors", getDoctorsCount());
            
        } catch (Exception e) {
            System.err.println("Error getting dashboard statistics: " + e.getMessage());
            // Return default values on error
            stats.put("totalPatients", 0);
            stats.put("todayPatients", 0);
            stats.put("monthPatients", 0);
            stats.put("todayAppointments", 0);
            stats.put("upcomingAppointments", 0);
            stats.put("totalDoctors", 0);
        }
        
        return stats;
    }
    
    /**
     * Get users growth data for charts
     */
    public List<Map<String, Object>> getUsersGrowthData(String period) {
        try {
            String sql;
            
            switch (period.toLowerCase()) {
                case "week":
                    sql = """
                        SELECT DATE(created_at) as date, COUNT(*) as count
                        FROM users 
                        WHERE role = 'PATIENT' 
                        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        GROUP BY DATE(created_at)
                        ORDER BY date
                        """;
                    break;
                case "month":
                    sql = """
                        SELECT DATE(created_at) as date, COUNT(*) as count
                        FROM users 
                        WHERE role = 'PATIENT' 
                        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                        GROUP BY DATE(created_at)
                        ORDER BY date
                        """;
                    break;
                case "year":
                    sql = """
                        SELECT MONTH(created_at) as month, COUNT(*) as count
                        FROM users 
                        WHERE role = 'PATIENT' 
                        AND YEAR(created_at) = YEAR(CURDATE())
                        GROUP BY MONTH(created_at)
                        ORDER BY month
                        """;
                    break;
                default:
                    sql = """
                        SELECT DATE(created_at) as date, COUNT(*) as count
                        FROM users 
                        WHERE role = 'PATIENT' 
                        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        GROUP BY DATE(created_at)
                        ORDER BY date
                        """;
                    break;
            }
            
            return jdbcTemplate.queryForList(sql);
            
        } catch (Exception e) {
            System.err.println("Error getting users growth data: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Get total number of doctors
     */
    public int getDoctorsCount() {
        try {
            String sql = "SELECT COUNT(*) FROM doctors WHERE is_active = 1";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            System.err.println("Error getting doctors count: " + e.getMessage());
            return 0;
        }
    }
    
    /**
     * Get doctors list with pagination
     */
    public List<Map<String, Object>> getDoctorsList(int offset, int limit) {
        try {
            String sql = """
                SELECT d.id, d.full_name, d.specialization, d.email, d.phone, 
                       d.is_active, d.created_at, s.specialty_name
                FROM doctors d
                LEFT JOIN specialties s ON d.specialty_id = s.id
                WHERE d.is_active = 1
                ORDER BY d.created_at DESC
                LIMIT ? OFFSET ?
                """;
            
            List<Map<String, Object>> doctors = jdbcTemplate.queryForList(sql, limit, offset);
            
            // Convert column names to camelCase
            for (Map<String, Object> doctor : doctors) {
                doctor.put("fullName", doctor.get("full_name"));
                doctor.put("specialtyName", doctor.get("specialty_name"));
                doctor.put("isActive", doctor.get("is_active"));
                doctor.put("createdAt", doctor.get("created_at"));
                
                doctor.remove("full_name");
                doctor.remove("specialty_name");
                doctor.remove("is_active");
                doctor.remove("created_at");
            }
            
            return doctors;
            
        } catch (Exception e) {
            System.err.println("Error getting doctors list: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Get specialties list
     */
    public List<Map<String, Object>> getSpecialtiesList() {
        try {
            String sql = """
                SELECT id, specialty_name, description, is_active, created_at
                FROM specialties
                ORDER BY specialty_name
                """;
            
            List<Map<String, Object>> specialties = jdbcTemplate.queryForList(sql);
            
            // Convert column names to camelCase
            for (Map<String, Object> specialty : specialties) {
                specialty.put("specialtyName", specialty.get("specialty_name"));
                specialty.put("isActive", specialty.get("is_active"));
                specialty.put("createdAt", specialty.get("created_at"));
                
                specialty.remove("specialty_name");
                specialty.remove("is_active");
                specialty.remove("created_at");
            }
            
            return specialties;
            
        } catch (Exception e) {
            System.err.println("Error getting specialties list: " + e.getMessage());
            return List.of();
        }
    }
}