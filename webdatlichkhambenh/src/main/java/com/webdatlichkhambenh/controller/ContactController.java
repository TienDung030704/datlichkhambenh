package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.model.Contact;
import com.webdatlichkhambenh.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<Map<String, Object>> submitContact(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("message") String message,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile imageFile) {

        Map<String, Object> response = new HashMap<>();

        // Basic validation
        if (fullName == null || fullName.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                message == null || message.trim().isEmpty()) {

            response.put("success", false);
            response.put("message", "Please fill in all required fields (Name, Email, Message)");
            return ResponseEntity.badRequest().body(response);
        }

        Contact contact = new Contact();
        contact.setFullName(fullName);
        contact.setEmail(email);
        contact.setMessage(message);
        contact.setPhoneNumber(phoneNumber);
        contact.setSubject(subject);

        // Handle Image Upload
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // Determine upload directory - Adjusted for CWD
                String uploadDir = "webdatlichkhambenh/src/main/resources/static/uploads/contacts/";
                java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }

                // Generate unique filename
                String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                java.nio.file.Path filePath = uploadPath.resolve(fileName);
                java.nio.file.Files.copy(imageFile.getInputStream(), filePath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                // Set URL for database (relative path)
                contact.setImageUrl("/uploads/contacts/" + fileName);
            } catch (Exception e) {
                System.err.println("File upload failed: " + e.getMessage());
                // Continue without image or return error?
                // Let's continue but warn
            }
        }

        try {
            contactService.saveContact(contact);
            response.put("success", true);
            response.put("message", "Thank you! We have received your message.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send message: " + e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(response);
    }

    // Endpoint for Admin to view contacts (should be protected in real app)
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllContacts() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Contact> contacts = contactService.getAllContacts();
            response.put("success", true);
            response.put("contacts", contacts);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving contacts: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String status = payload.get("status");

        if (status == null || status.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Status is required");
            return ResponseEntity.badRequest().body(response);
        }

        boolean updated = contactService.updateStatus(id, status);

        if (updated) {
            response.put("success", true);
            response.put("message", "Contact status updated successfully");
        } else {
            response.put("success", false);
            response.put("message", "Failed to update contact status");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<Map<String, Object>> replyContact(@PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String replyContent = payload.get("replyContent");

        if (replyContent == null || replyContent.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Reply content is required");
            return ResponseEntity.badRequest().body(response);
        }

        boolean updated = contactService.replyContact(id, replyContent);

        if (updated) {
            response.put("success", true);
            response.put("message", "Reply sent successfully");
        } else {
            response.put("success", false);
            response.put("message", "Failed to send reply");
        }

        return ResponseEntity.ok(response);
    }
}
