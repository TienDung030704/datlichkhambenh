package com.webdatlichkhambenh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public boolean sendReminderEmail(String to, String patientName, String doctorName, String date, String time, Integer appointmentId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Nhắc hẹn: Lịch khám của bạn vào ngày mai");
            
            String content = String.format(
                "Xin chào %s,\n\n" +
                "Đây là tin nhắn nhắc nhở về lịch khám bệnh của bạn:\n" +
                "- Bác sĩ: %s\n" +
                "- Thời gian: %s lúc %s\n\n" +
                "Vui lòng đến đúng giờ. Nếu bạn cần hủy lịch, hãy truy cập hệ thống hoặc click vào link bên dưới:\n" +
                "http://localhost:8080/api/appointments/%d/cancel\n\n" +
                "Trân trọng,\n" +
                "Hệ thống Đặt lịch khám bệnh",
                patientName, doctorName, date, time, appointmentId
            );
            
            message.setText(content);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            return false;
        }
    }
}
