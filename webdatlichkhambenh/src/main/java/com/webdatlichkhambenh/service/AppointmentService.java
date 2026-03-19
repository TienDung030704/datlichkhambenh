package com.webdatlichkhambenh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Map<String, Object> createAppointment(Map<String, Object> appointmentData) {
        Map<String, Object> response = new HashMap<>();

        try {
            ensureAppointmentsTableExists();

            String username = asString(appointmentData.get("username"));
            Integer doctorId = asInteger(appointmentData.get("doctorId"));
            Integer specialtyId = asInteger(appointmentData.get("specialtyId"));
            String appointmentDateRaw = asString(appointmentData.get("appointmentDate"));
            String appointmentTime = asString(appointmentData.get("appointmentTime"));
            String symptoms = asString(appointmentData.get("symptoms"));

            if (username == null || username.isBlank()) {
                response.put("success", false);
                response.put("message", "Thiếu thông tin người dùng đặt lịch");
                return response;
            }

            if (doctorId == null || specialtyId == null || appointmentDateRaw == null || appointmentTime == null) {
                response.put("success", false);
                response.put("message", "Thiếu thông tin lịch hẹn bắt buộc");
                return response;
            }

            LocalDate appointmentDate;
            try {
                appointmentDate = LocalDate.parse(appointmentDateRaw);
            } catch (DateTimeParseException ex) {
                response.put("success", false);
                response.put("message", "Ngày khám không hợp lệ");
                return response;
            }

            if (appointmentDate.isBefore(LocalDate.now())) {
                response.put("success", false);
                response.put("message", "Ngày khám phải từ hôm nay trở đi");
                return response;
            }

            try {
                LocalTime.parse(appointmentTime);
            } catch (DateTimeParseException ex) {
                response.put("success", false);
                response.put("message", "Giờ khám không hợp lệ");
                return response;
            }

            Integer patientId = findPatientId(username);
            if (patientId == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy tài khoản bệnh nhân");
                return response;
            }

            if (!doctorExistsForSpecialty(doctorId, specialtyId)) {
                response.put("success", false);
                response.put("message", "Bác sĩ không thuộc chuyên khoa đã chọn");
                return response;
            }

            if (isDoctorSlotBooked(doctorId, appointmentDateRaw, appointmentTime)) {
                response.put("success", false);
                response.put("message", "Khung giờ này đã có người đặt. Vui lòng chọn giờ khác.");
                return response;
            }

            String insertSql = """
                INSERT INTO appointments (
                    patient_id,
                    doctor_id,
                    specialty_id,
                    appointment_date,
                    appointment_time,
                    status,
                    symptoms,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, 'booked', ?, NOW(), NOW())
                """;

            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(insertSql, new String[]{"id"});
                ps.setInt(1, patientId);
                ps.setInt(2, doctorId);
                ps.setInt(3, specialtyId);
                ps.setDate(4, Date.valueOf(appointmentDate));
                ps.setString(5, appointmentTime);
                if (symptoms == null || symptoms.isBlank()) {
                    ps.setNull(6, java.sql.Types.VARCHAR);
                } else {
                    ps.setString(6, symptoms.trim());
                }
                return ps;
            }, keyHolder);

            Integer appointmentId = keyHolder.getKey() != null ? keyHolder.getKey().intValue() : null;
            if (appointmentId == null) {
                appointmentId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
            }
            response.put("success", true);
            response.put("message", "Đặt lịch khám thành công");

            Map<String, Object> appointmentSummary = new HashMap<>();
            appointmentSummary.put("id", appointmentId);
            appointmentSummary.put("appointmentDate", appointmentDate.toString());
            appointmentSummary.put("appointmentTime", appointmentTime);
            appointmentSummary.put("status", "booked");

            response.put("appointment", appointmentSummary);
            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tạo lịch hẹn: " + e.getMessage());
            return response;
        }
    }

    public List<Map<String, Object>> getLichHenCuaNguoiDung(String username) {
        ensureAppointmentsTableExists();
        String sql = """
            SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.symptoms,
                   a.created_at,
                   s.specialty_name AS ten_chuyen_khoa,
                   d.full_name AS ten_bac_si
            FROM appointments a
            JOIN specialties s ON a.specialty_id = s.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON a.patient_id = u.id
            WHERE u.username = ? OR u.email = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            """;
        return jdbcTemplate.queryForList(sql, username, username);
    }

    public Map<String, Object> huyLichHen(Integer appointmentId, String username) {
        Map<String, Object> response = new HashMap<>();
        try {
            String checkSql = """
                SELECT a.id, a.status FROM appointments a
                JOIN users u ON a.patient_id = u.id
                WHERE a.id = ? AND (u.username = ? OR u.email = ?)
                """;
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(checkSql, appointmentId, username, username);
            if (rows.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy lịch hẹn");
                return response;
            }
            String status = String.valueOf(rows.get(0).get("status"));
            if ("cancelled".equalsIgnoreCase(status)) {
                response.put("success", false);
                response.put("message", "Lịch hẹn này đã bị hủy trước đó");
                return response;
            }
            if ("examined".equalsIgnoreCase(status)) {
                response.put("success", false);
                response.put("message", "Không thể hủy lịch hẹn đã hoàn thành");
                return response;
            }
            jdbcTemplate.update("UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = ?", appointmentId);
            response.put("success", true);
            response.put("message", "Hủy lịch hẹn thành công");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi hủy lịch hẹn: " + e.getMessage());
        }
        return response;
    }

    private void ensureAppointmentsTableExists() {
        String sql = """
            CREATE TABLE IF NOT EXISTS appointments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                patient_id INT NOT NULL,
                doctor_id INT NOT NULL,
                specialty_id INT NOT NULL,
                appointment_date DATE NOT NULL,
                appointment_time VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'booked',
                symptoms TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT uk_doctor_schedule UNIQUE (doctor_id, appointment_date, appointment_time),
                CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES users(id),
                CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
                CONSTRAINT fk_appointments_specialty FOREIGN KEY (specialty_id) REFERENCES specialties(id)
            )
            """;
        jdbcTemplate.execute(sql);
    }

    private Integer findPatientId(String username) {
        String sql = "SELECT id FROM users WHERE (username = ? OR email = ?) AND is_active = 1 LIMIT 1";
        List<Integer> ids = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getInt("id"), username, username);
        return ids.isEmpty() ? null : ids.get(0);
    }

    private boolean doctorExistsForSpecialty(Integer doctorId, Integer specialtyId) {
        String sql = "SELECT COUNT(*) FROM doctors WHERE id = ? AND specialty_id = ? AND is_active = 1";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, doctorId, specialtyId);
        return count != null && count > 0;
    }

    private boolean isDoctorSlotBooked(Integer doctorId, String appointmentDate, String appointmentTime) {
        String sql = """
            SELECT COUNT(*) FROM appointments
            WHERE doctor_id = ?
              AND appointment_date = ?
              AND appointment_time = ?
              AND LOWER(status) <> 'cancelled'
            """;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, doctorId, appointmentDate, appointmentTime);
        return count != null && count > 0;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private Integer asInteger(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        try {
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}