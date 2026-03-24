package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.model.Contact;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Service
public class ContactService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // RowMapper to convert ResultSet to Contact object
    @NonNull
    private final RowMapper<Contact> contactRowMapper = new RowMapper<Contact>() {
        @Override
        public Contact mapRow(@org.springframework.lang.NonNull ResultSet rs, int rowNum) throws SQLException {
            Contact contact = new Contact();
            contact.setId(rs.getInt("id"));
            contact.setFullName(rs.getString("full_name"));
            contact.setEmail(rs.getString("email"));
            contact.setPhoneNumber(rs.getString("phone_number"));
            contact.setSubject(rs.getString("subject"));
            contact.setMessage(rs.getString("message"));
            contact.setImageUrl(rs.getString("image_url"));
            contact.setStatus(rs.getString("status"));
            contact.setCreatedAt(rs.getTimestamp("created_at"));
            contact.setUpdatedAt(rs.getTimestamp("updated_at"));
            return contact;
        }
    };

    /**
     * Save a new contact request
     */
    public boolean saveContact(Contact contact) {
        try {
            String sql = "INSERT INTO contacts (full_name, email, phone_number, subject, message, image_url, status, created_at, updated_at) "
                    +
                    "VALUES (?, ?, ?, ?, ?, ?, 'NEW', NOW(), NOW())";

            int rowsAffected = jdbcTemplate.update(sql,
                    contact.getFullName(),
                    contact.getEmail(),
                    contact.getPhoneNumber(),
                    contact.getSubject(),
                    contact.getMessage(),
                    contact.getImageUrl());

            return rowsAffected > 0;
        } catch (Exception e) {
            System.err.println("Error saving contact: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Database error: " + e.getMessage());
        }
    }

    /**
     * Get all contacts (for admin)
     */
    public List<Contact> getAllContacts() {
        try {
            String sql = "SELECT * FROM contacts ORDER BY created_at DESC";
            return jdbcTemplate.query(sql, contactRowMapper);
        } catch (Exception e) {
            System.err.println("Error getting contacts: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Update contact status
     */
    public boolean updateStatus(Integer id, String status) {
        try {
            String sql = "UPDATE contacts SET status = ?, updated_at = NOW() WHERE id = ?";
            int rows = jdbcTemplate.update(sql, status, id);
            return rows > 0;
        } catch (Exception e) {
            System.err.println("Error updating contact status: " + e.getMessage());
            return false;
        }
    }

    /**
     * Reply to a contact request
     */
    public boolean replyContact(Integer id, String replyContent) {
        try {
            String sql = "UPDATE contacts SET reply_content = ?, reply_time = NOW(), status = 'REPLIED', updated_at = NOW() WHERE id = ?";
            int rows = jdbcTemplate.update(sql, replyContent, id);
            return rows > 0;
        } catch (Exception e) {
            System.err.println("Error replying to contact: " + e.getMessage());
            return false;
        }
    }
}
