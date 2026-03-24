package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.model.Faq;
import com.webdatlichkhambenh.service.FaqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faq")
@CrossOrigin(origins = "*")
public class FaqController {

    @Autowired
    private FaqService faqService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getActiveFaqs() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Faq> faqs = faqService.getActiveFaqs();
            response.put("success", true);
            response.put("faqs", faqs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting FAQs: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllFaqs() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Faq> faqs = faqService.getAllFaqs();
            response.put("success", true);
            response.put("faqs", faqs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting FAQs: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFaqById(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            return faqService.getFaqById(id)
                    .map(faq -> {
                        response.put("success", true);
                        response.put("faq", faq);
                        return ResponseEntity.ok(response);
                    })
                    .orElseGet(() -> {
                        response.put("success", false);
                        response.put("message", "FAQ not found");
                        return ResponseEntity.status(404).body(response);
                    });
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting FAQ: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createFaq(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String question = (String) request.get("question");
            String answer = (String) request.get("answer");
            String category = (String) request.get("category");
            Integer displayOrder = request.get("displayOrder") != null
                    ? ((Number) request.get("displayOrder")).intValue() : 0;

            if (question == null || question.isBlank()) {
                response.put("success", false);
                response.put("message", "Question is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (answer == null || answer.isBlank()) {
                response.put("success", false);
                response.put("message", "Answer is required");
                return ResponseEntity.badRequest().body(response);
            }

            Faq faq = faqService.createFaq(question, answer, category, displayOrder);
            response.put("success", true);
            response.put("faq", faq);
            response.put("message", "FAQ created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating FAQ: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFaq(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String question = (String) request.get("question");
            String answer = (String) request.get("answer");
            String category = (String) request.get("category");
            Integer displayOrder = request.get("displayOrder") != null
                    ? ((Number) request.get("displayOrder")).intValue() : null;
            Boolean isActive = request.get("isActive") != null
                    ? (Boolean) request.get("isActive") : null;

            Faq faq = faqService.updateFaq(id, question, answer, category, displayOrder, isActive);
            response.put("success", true);
            response.put("faq", faq);
            response.put("message", "FAQ updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating FAQ: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFaq(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            faqService.deleteFaq(id);
            response.put("success", true);
            response.put("message", "FAQ deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting FAQ: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleFaqActive(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Faq faq = faqService.toggleActive(id);
            response.put("success", true);
            response.put("faq", faq);
            response.put("message", "FAQ status toggled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error toggling FAQ status: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
