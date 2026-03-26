package com.webdatlichkhambenh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.time.LocalDate;

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
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
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
            Integer todayPatientsParams = jdbcTemplate.queryForObject(todayPatientsSql, Integer.class);
            int todayPatients = todayPatientsParams != null ? todayPatientsParams : 0;
            stats.put("todayPatients", todayPatients);

            // Patients this month
            String monthPatientsSql = """
                    SELECT COUNT(*) FROM users
                    WHERE role = 'PATIENT' AND is_active = 1
                    AND YEAR(created_at) = YEAR(CURDATE())
                    AND MONTH(created_at) = MONTH(CURDATE())
                    """;
            Integer monthPatientsParams = jdbcTemplate.queryForObject(monthPatientsSql, Integer.class);
            int monthPatients = monthPatientsParams != null ? monthPatientsParams : 0;
            stats.put("monthPatients", monthPatients);

            // Thay vì dùng mock data, tính toán từ bảng appointments thật
            int todayAppointments = 0;
            int upcomingAppointments = 0;

            try {
                // Lịch hẹn hôm nay (appointments được đặt cho hôm nay)
                String todayAppointmentsSql = """
                        SELECT COUNT(*) FROM appointments
                        WHERE DATE(appointment_date) = CURDATE()
                        AND status IN ('booked', 'examined')
                        """;
                Integer todayAppointmentsParams = jdbcTemplate.queryForObject(todayAppointmentsSql, Integer.class);
                todayAppointments = todayAppointmentsParams != null ? todayAppointmentsParams : 0;
                System.out.println("Today appointments from DB: " + todayAppointments);

                // Lịch hẹn sắp tới (trong vòng 7 ngày tới)
                String upcomingAppointmentsSql = """
                        SELECT COUNT(*) FROM appointments
                        WHERE appointment_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                        AND status = 'booked'
                        """;
                Integer upcomingAppointmentsParams = jdbcTemplate.queryForObject(upcomingAppointmentsSql,
                        Integer.class);
                upcomingAppointments = upcomingAppointmentsParams != null ? upcomingAppointmentsParams : 0;
                System.out.println("Upcoming appointments from DB: " + upcomingAppointments);

            } catch (Exception appointmentError) {
                // Log lỗi để debug
                System.err.println("Error querying appointments table: " + appointmentError.getMessage());
                appointmentError.printStackTrace();

                // Vẫn set về 0 thay vì dùng fallback
                todayAppointments = 0;
                upcomingAppointments = 0;
            }

            stats.put("todayAppointments", todayAppointments);
            stats.put("upcomingAppointments", upcomingAppointments);

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
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
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
                SELECT d.id, d.full_name, d.email, d.phone_number,
                       d.experience, d.license_number, d.is_active, d.created_at,
                       s.specialty_name
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
                doctor.put("phoneNumber", doctor.get("phone_number"));
                doctor.put("isActive", doctor.get("is_active"));
                doctor.put("createdAt", doctor.get("created_at"));

                doctor.remove("full_name");
                doctor.remove("specialty_name");
                doctor.remove("phone_number");
                doctor.remove("is_active");
                doctor.remove("created_at");
            }

            return doctors;

        } catch (Exception e) {
            System.err.println("Error getting doctors list: " + e.getMessage());
            return List.of();
        }
    }

    // ===================== DOCTOR DUTY SCHEDULE =====================

    private void ensureDutyTable() {
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS doctor_duty_schedules (
                id           INT PRIMARY KEY AUTO_INCREMENT,
                doctor_id    INT NOT NULL,
                schedule_date DATE NOT NULL,
                time_slot     VARCHAR(20) NOT NULL,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_duty (doctor_id, schedule_date, time_slot),
                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
            )
            """);
    }

    // Default time slots used throughout the hospital
    private static final String[] DEFAULT_TIME_SLOTS = {
        "06:30 - 07:30", "07:30 - 08:30", "08:30 - 09:30", "09:30 - 10:30", "10:30 - 11:30",
        "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"
    };

    /**
     * Auto-generate a balanced Mon–Sat duty schedule for a doctor+week.
     * 10 groups (doctorId % 10) ensure:
     *  - No doctor works all 6 days — each works 3–4 days/week
     *  - Monday & Tuesday always have the most doctors on duty
     *  - Each day is split into AM (06:30–11:30) and PM (13:00–16:00) sessions
     *
     * dayOffset: 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat
     * session:   0=AM  1=PM
     */
    private void autoInitDutyWeek(Integer doctorId, String weekStart) {
        List<Object[]> batch = new ArrayList<>();
        LocalDate monday = LocalDate.parse(weekStart);

        // For each group, define which [dayOffset][session] pairs are active.
        // Row = dayOffset (0–5), Col = session (0=AM, 1=PM)
        boolean[][] s = new boolean[6][2];
        switch (doctorId % 10) {
            case 0 -> { // Mon AM+PM, Tue AM, Wed AM
                s[0][0]=true; s[0][1]=true; s[1][0]=true; s[2][0]=true; }
            case 1 -> { // Mon AM, Tue AM+PM, Thu AM
                s[0][0]=true; s[1][0]=true; s[1][1]=true; s[3][0]=true; }
            case 2 -> { // Mon AM+PM, Wed AM, Fri AM
                s[0][0]=true; s[0][1]=true; s[2][0]=true; s[4][0]=true; }
            case 3 -> { // Mon AM, Tue AM, Fri AM+PM
                s[0][0]=true; s[1][0]=true; s[4][0]=true; s[4][1]=true; }
            case 4 -> { // Mon AM, Tue AM, Sat AM
                s[0][0]=true; s[1][0]=true; s[5][0]=true; }
            case 5 -> { // Tue AM+PM, Wed AM+PM, Thu AM
                s[1][0]=true; s[1][1]=true; s[2][0]=true; s[2][1]=true; s[3][0]=true; }
            case 6 -> { // Mon AM, Wed AM, Sat AM+PM
                s[0][0]=true; s[2][0]=true; s[5][0]=true; s[5][1]=true; }
            case 7 -> { // Tue AM, Thu AM+PM, Fri AM
                s[1][0]=true; s[3][0]=true; s[3][1]=true; s[4][0]=true; }
            case 8 -> { // Wed AM+PM, Thu AM, Sat AM
                s[2][0]=true; s[2][1]=true; s[3][0]=true; s[5][0]=true; }
            case 9 -> { // Mon AM, Fri AM+PM, Sat AM
                s[0][0]=true; s[4][0]=true; s[4][1]=true; s[5][0]=true; }
        }

        for (int dayOffset = 0; dayOffset < 6; dayOffset++) {
            String dateStr = monday.plusDays(dayOffset).toString();
            for (String slot : DEFAULT_TIME_SLOTS) {
                boolean isMorning = slot.compareTo("12:00") < 0;
                if (s[dayOffset][isMorning ? 0 : 1]) {
                    batch.add(new Object[]{doctorId, dateStr, slot});
                }
            }
        }
        jdbcTemplate.batchUpdate(
            "INSERT IGNORE INTO doctor_duty_schedules (doctor_id, schedule_date, time_slot) VALUES (?,?,?)",
            batch);
    }

    /**
     * Returns duty slots + appointments for the week.
     * Auto-initialises default duty schedule if the doctor has no slots for this week.
     */
    public Map<String, Object> getDoctorDutySchedule(Integer doctorId, String weekStart) {
        ensureDutyTable();

        String dutySql = """
            SELECT DATE_FORMAT(schedule_date,'%Y-%m-%d') AS scheduleDate, time_slot AS timeSlot
            FROM doctor_duty_schedules
            WHERE doctor_id = ?
              AND schedule_date BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)
            ORDER BY schedule_date, time_slot
            """;
        List<Map<String, Object>> dutySlots = jdbcTemplate.queryForList(dutySql, doctorId, weekStart, weekStart);

        // If no slots exist — or if old logic assigned too many (>30) — regenerate
        if (dutySlots.isEmpty() || dutySlots.size() > 30) {
            if (!dutySlots.isEmpty()) {
                // Delete over-assigned old slots before re-generating
                jdbcTemplate.update(
                    "DELETE FROM doctor_duty_schedules WHERE doctor_id = ? " +
                    "AND schedule_date BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)",
                    doctorId, weekStart, weekStart);
            }
            autoInitDutyWeek(doctorId, weekStart);
            dutySlots = jdbcTemplate.queryForList(dutySql, doctorId, weekStart, weekStart);
        }

        String apptSql = """
            SELECT DATE_FORMAT(a.appointment_date,'%Y-%m-%d') AS appointmentDate,
                   a.appointment_time                          AS appointmentTime,
                   a.status,
                   u.full_name    AS patientName,
                   u.phone_number AS patientPhone
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = ?
              AND a.appointment_date BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)
              AND a.status != 'cancelled'
            ORDER BY a.appointment_date, a.appointment_time
            """;
        List<Map<String, Object>> appointments = jdbcTemplate.queryForList(apptSql, doctorId, weekStart, weekStart);

        Map<String, Object> result = new HashMap<>();
        result.put("dutySlots", dutySlots);
        result.put("appointments", appointments);
        return result;
    }

    public void assignDutySlot(Integer doctorId, String date, String timeSlot) {
        ensureDutyTable();
        jdbcTemplate.update(
            "INSERT IGNORE INTO doctor_duty_schedules (doctor_id, schedule_date, time_slot) VALUES (?,?,?)",
            doctorId, date, timeSlot);
    }

    public void removeDutySlot(Integer doctorId, String date, String timeSlot) {
        jdbcTemplate.update(
            "DELETE FROM doctor_duty_schedules WHERE doctor_id=? AND schedule_date=? AND time_slot=?",
            doctorId, date, timeSlot);
    }

    /**
     * Get weekly schedule (appointments) for a specific doctor
     */
    public List<Map<String, Object>> getDoctorWeeklySchedule(Integer doctorId, String weekStart) {
        try {
            String sql = """
                SELECT a.id,
                       DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date,
                       a.appointment_time, a.status,
                       u.full_name as patient_name, u.phone_number as patient_phone
                FROM appointments a
                JOIN users u ON a.patient_id = u.id
                WHERE a.doctor_id = ?
                  AND a.appointment_date BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)
                  AND a.status != 'cancelled'
                ORDER BY a.appointment_date, a.appointment_time
                """;

            List<Map<String, Object>> appointments = jdbcTemplate.queryForList(sql, doctorId, weekStart, weekStart);

            for (Map<String, Object> appt : appointments) {
                appt.put("patientName", appt.get("patient_name"));
                appt.put("patientPhone", appt.get("patient_phone"));
                appt.put("appointmentDate", appt.get("appointment_date"));
                appt.put("appointmentTime", appt.get("appointment_time"));
                appt.remove("patient_name");
                appt.remove("patient_phone");
                appt.remove("appointment_date");
                appt.remove("appointment_time");
            }

            return appointments;

        } catch (Exception e) {
            System.err.println("Error getting doctor weekly schedule: " + e.getMessage());
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

    /**
     * Get recent appointments for dashboard
     */
    public List<Map<String, Object>> getRecentAppointments(int limit) {
        try {
            String sql = """
                SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.symptoms,
                       u.full_name as patient_name, u.phone_number as patient_phone,
                       d.full_name as doctor_name, s.specialty_name as specialty_name,
                       pp.allergy_status, pp.allergy_notes
                FROM appointments a
                JOIN users u ON a.patient_id = u.id
                JOIN doctors d ON a.doctor_id = d.id
                JOIN specialties s ON a.specialty_id = s.id
                LEFT JOIN patient_profiles pp ON u.id = pp.user_id AND pp.is_default = 1
                WHERE a.appointment_date >= CURDATE()
                ORDER BY a.appointment_date ASC, a.appointment_time ASC
                LIMIT ?
                """;
            List<Map<String, Object>> appointments = jdbcTemplate.queryForList(sql, limit);

            // Convert to frontend format
            for (Map<String, Object> appointment : appointments) {
                appointment.put("patientName", appointment.get("patient_name"));
                appointment.put("patientPhone", appointment.get("patient_phone"));
                appointment.put("doctorName", appointment.get("doctor_name"));
                appointment.put("specialtyName", appointment.get("specialty_name"));
                appointment.put("appointmentDate", appointment.get("appointment_date"));
                appointment.put("appointmentTime", appointment.get("appointment_time"));
                appointment.put("allergyStatus", appointment.get("allergy_status"));
                appointment.put("allergyNotes", appointment.get("allergy_notes"));

                // Remove snake_case keys
                appointment.remove("patient_name");
                appointment.remove("patient_phone");
                appointment.remove("doctor_name");
                appointment.remove("specialty_name");
                appointment.remove("appointment_date");
                appointment.remove("appointment_time");
                appointment.remove("allergy_status");
                appointment.remove("allergy_notes");
            }

            return appointments;

        } catch (Exception e) {
            System.err.println("Error getting recent appointments: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get all appointments with pagination
     */
    public List<Map<String, Object>> getAppointmentsList(int offset, int limit) {
        try {
            String sql = """
                SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.symptoms,
                       u.full_name as patient_name, u.phone_number as patient_phone,
                       d.full_name as doctor_name, s.specialty_name as specialty_name,
                       pp.allergy_status, pp.allergy_notes
                FROM appointments a
                JOIN users u ON a.patient_id = u.id
                JOIN doctors d ON a.doctor_id = d.id
                JOIN specialties s ON a.specialty_id = s.id
                LEFT JOIN patient_profiles pp ON u.id = pp.user_id AND pp.is_default = 1
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
                LIMIT ? OFFSET ?
                """;
            List<Map<String, Object>> appointments = jdbcTemplate.queryForList(sql, limit, offset);

            // Convert to frontend format
            for (Map<String, Object> appointment : appointments) {
                appointment.put("patientName", appointment.get("patient_name"));
                appointment.put("patientPhone", appointment.get("patient_phone"));
                appointment.put("doctorName", appointment.get("doctor_name"));
                appointment.put("specialtyName", appointment.get("specialty_name"));
                appointment.put("appointmentDate", appointment.get("appointment_date"));
                appointment.put("appointmentTime", appointment.get("appointment_time"));
                appointment.put("allergyStatus", appointment.get("allergy_status"));
                appointment.put("allergyNotes", appointment.get("allergy_notes"));

                // Remove snake_case keys
                appointment.remove("patient_name");
                appointment.remove("patient_phone");
                appointment.remove("doctor_name");
                appointment.remove("specialty_name");
                appointment.remove("appointment_date");
                appointment.remove("appointment_time");
                appointment.remove("allergy_status");
                appointment.remove("allergy_notes");
            }

            return appointments;

        } catch (Exception e) {
            System.err.println("Error getting appointments list: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get total appointments count
     */
    public int getAppointmentsCount() {
        try {
            String sql = "SELECT COUNT(*) FROM appointments";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            System.err.println("Error getting appointments count: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Get booked appointments for notification polling.
     * When sinceId == 0, returns the latest 'limit' booked appointments ordered by id DESC.
     * When sinceId > 0, returns appointments with id > sinceId (new arrivals).
     */
    public List<Map<String, Object>> getNewBookedAppointments(int sinceId, int limit) {
        try {
            String sql = sinceId > 0
                ? """
                    SELECT a.id, a.appointment_date, a.appointment_time, a.status,
                           u.full_name AS patient_name,
                           d.full_name AS doctor_name, s.specialty_name AS specialty_name
                    FROM appointments a
                    JOIN users u ON a.patient_id = u.id
                    JOIN doctors d ON a.doctor_id = d.id
                    JOIN specialties s ON a.specialty_id = s.id
                    WHERE a.status = 'booked' AND a.id > ?
                    ORDER BY a.id DESC
                    LIMIT ?
                    """
                : """
                    SELECT a.id, a.appointment_date, a.appointment_time, a.status,
                           u.full_name AS patient_name,
                           d.full_name AS doctor_name, s.specialty_name AS specialty_name,
                           pp.allergy_status, pp.allergy_notes
                    FROM appointments a
                    JOIN users u ON a.patient_id = u.id
                    JOIN doctors d ON a.doctor_id = d.id
                    JOIN specialties s ON a.specialty_id = s.id
                    LEFT JOIN patient_profiles pp ON u.id = pp.user_id AND pp.is_default = 1
                    WHERE a.status = 'booked'
                    ORDER BY a.id DESC
                    LIMIT ?
                    """;

            List<Map<String, Object>> appointments = sinceId > 0
                ? jdbcTemplate.queryForList(sql, sinceId, limit)
                : jdbcTemplate.queryForList(sql, limit);

            for (Map<String, Object> apt : appointments) {
                apt.put("patientName", apt.get("patient_name"));
                apt.put("doctorName", apt.get("doctor_name"));
                apt.put("specialtyName", apt.get("specialty_name"));
                apt.put("appointmentDate", apt.get("appointment_date"));
                apt.put("appointmentTime", apt.get("appointment_time"));
                apt.put("allergyStatus", apt.get("allergy_status"));
                apt.put("allergyNotes", apt.get("allergy_notes"));
                apt.remove("patient_name");
                apt.remove("doctor_name");
                apt.remove("specialty_name");
                apt.remove("appointment_date");
                apt.remove("appointment_time");
                apt.remove("allergy_status");
                apt.remove("allergy_notes");
            }
            return appointments;
        } catch (Exception e) {
            System.err.println("Error getting new booked appointments: " + e.getMessage());
            return List.of();
        }
    }

    public Map<String, Object> updateAppointmentStatus(int appointmentId, String newStatus) {
        Map<String, Object> response = new HashMap<>();
        java.util.Set<String> validStatuses = java.util.Set.of("booked", "examined", "cancelled");
        if (!validStatuses.contains(newStatus)) {
            response.put("success", false);
            response.put("message", "Trạng thái không hợp lệ. Chỉ chấp nhận: booked, examined, cancelled");
            return response;
        }
        try {
            int rows = jdbcTemplate.update(
                "UPDATE appointments SET status = ? WHERE id = ?", newStatus, appointmentId);
            if (rows == 0) {
                response.put("success", false);
                response.put("message", "Không tìm thấy lịch hẹn");
            } else {
                response.put("success", true);
                response.put("message", "Cập nhật trạng thái thành công");
                response.put("newStatus", newStatus);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi cập nhật: " + e.getMessage());
        }
        return response;
    }
}
