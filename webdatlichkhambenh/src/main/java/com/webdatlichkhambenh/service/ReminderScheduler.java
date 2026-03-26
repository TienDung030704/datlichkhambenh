package com.webdatlichkhambenh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReminderScheduler {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EmailService emailService;

    // Run every 30 minutes
    @Scheduled(cron = "0 0/30 * * * *")
    public void sendAppointmentReminders() {
        System.out.println("ReminderScheduler: Checking for appointments to remind...");
        
        // Find appointments exactly 23.5h to 24.1h away
        String sql = """
            SELECT a.id, a.appointment_date, a.appointment_time, 
                   u.email, u.full_name AS patient_name,
                   d.full_name AS doctor_name
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.status = 'booked'
              AND a.reminder_status = 'pending'
              AND a.skip_reminder = 0
              AND STR_TO_DATE(CONCAT(a.appointment_date, ' ', a.appointment_time), '%Y-%m-%d %H:%i') 
                  BETWEEN (NOW() + INTERVAL 23 HOUR + INTERVAL 25 MINUTE) 
                  AND (NOW() + INTERVAL 24 HOUR + INTERVAL 5 MINUTE)
        """;

        List<Map<String, Object>> pendingReminders = jdbcTemplate.queryForList(sql);

        for (Map<String, Object> reminder : pendingReminders) {
            Integer id = (Integer) reminder.get("id");
            String email = (String) reminder.get("email");
            String patientName = (String) reminder.get("patient_name");
            String doctorName = (String) reminder.get("doctor_name");
            String date = String.valueOf(reminder.get("appointment_date"));
            String time = (String) reminder.get("appointment_time");

            if (email == null || email.isBlank()) {
                updateReminderStatus(id, "failed");
                continue;
            }

            boolean sent = emailService.sendReminderEmail(email, patientName, doctorName, date, time, id);
            if (sent) {
                updateReminderStatus(id, "sent");
            } else {
                updateReminderStatus(id, "failed");
            }
        }
    }

    private void updateReminderStatus(Integer appointmentId, String status) {
        String sql = "UPDATE appointments SET reminder_status = ?, reminder_sent_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, status, appointmentId);
    }
}
