package com.webdatlichkhambenh.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url}")
    private String openaiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/message")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String userMessage = request.get("message");
            if (userMessage == null || userMessage.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Tin nhắn không được để trống");
                return ResponseEntity.badRequest().body(response);
            }

            // Kiểm tra API key
            if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "API key chưa được cấu hình");
                return ResponseEntity.ok(response);
            }

            // Tạo prompt cho AI với ngữ cảnh bệnh viện
            String systemPrompt = "Bạn là trợ lý AI y tế của Bệnh viện Đại học Y Dược TP.HCM. " +
                "Bạn CHỈ trả lời các câu hỏi liên quan đến sức khỏe, dinh dưỡng, bệnh tật, " +
                "nguyên nhân bệnh, cách phòng ngừa, thuốc men và phương pháp điều trị. " +
                "Đối với các câu hỏi KHÔNG liên quan đến y tế hoặc sức khỏe, hãy lịch sự từ chối " +
                "và gợi ý người dùng liên hệ với bộ phận phù hợp của bệnh viện. " +
                "Hãy trả lời một cách thân thiện, hữu ích, chính xác và dựa trên kiến thức y tế. " +
                "Luôn khuyến cáo tham khảo ý kiến bác sĩ chuyên khoa cho các vấn đề sức khỏe cụ thể.";

            // Tạo request body cho OpenAI
            Map<String, Object> openaiRequest = new HashMap<>();
            openaiRequest.put("model", "gpt-3.5-turbo");
            openaiRequest.put("messages", Arrays.asList(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)
            ));
            openaiRequest.put("max_tokens", 500);
            openaiRequest.put("temperature", 0.7);

            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(openaiRequest, headers);

            // Gọi OpenAI API
            ResponseEntity<Map> openaiResponse = restTemplate.exchange(
                openaiApiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (openaiResponse.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = openaiResponse.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    String aiResponse = (String) message.get("content");

                    response.put("success", true);
                    response.put("message", aiResponse.trim());
                } else {
                    response.put("success", false);
                    response.put("message", "Không nhận được phản hồi từ AI");
                }
            } else {
                response.put("success", false);
                response.put("message", "Lỗi khi gọi API AI: " + openaiResponse.getStatusCode());
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}