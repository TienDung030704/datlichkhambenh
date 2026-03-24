package com.webdatlichkhambenh.service;

import com.webdatlichkhambenh.model.ChatMessage;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
public class AiService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.model}")
    private String groqModel;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.chat.url}")
    private String geminiChatUrl;

    @Value("${gemini.embed.url}")
    private String geminiEmbedUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void initializeApiKeys() {
        groqApiKey = resolveApiKey(groqApiKey, "GROQ_API_KEY");
        geminiApiKey = resolveApiKey(geminiApiKey, "GEMINI_API_KEY");

        if (groqApiKey == null || groqApiKey.isBlank()) {
            System.err.println("AI Warning: GROQ_API_KEY not found. Groq chat will be disabled.");
        }

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            System.err.println("AI Warning: GEMINI_API_KEY not found. Gemini chat/embedding will be disabled.");
        }
    }

    private static final String SYSTEM_INSTRUCTION = "Bạn là 'Medical Bot' - một trợ lý AI thân thiện, chuyên nghiệp của hệ thống Đặt Lịch Khám Bệnh. "
            +
            "Tính cách: Nhanh nhẹn, dễ thương (dùng các từ như 'ạ', 'nhé', 'dạ'), nhưng vẫn giữ vẻ lịch sự và chuyên nghiệp. "
            +
            "Nội dung trả lời: " +
            "1. Luôn chào hỏi lễ phép. " +
            "2. Giải đáp thắc mắc về lịch khám, bác sĩ và chuyên khoa. " +
            "3. Nếu không biết câu trả lời chính xác từ dữ liệu RAG, hãy khuyên khách để lại số điện thoại hoặc gọi hotline 1900.1607. "
            +
            "4. Tuyệt đối không đưa ra lời khuyên chuyên môn y khoa sâu (chẩn đoán bệnh), chỉ hỗ trợ thông tin hành chính và đặt lịch. "
            +
            "5. Luôn ưu tiên hướng dẫn khách đặt lịch qua web để tiết kiệm thời gian. " +
            "6. Câu trả lời cần ngắn gọn, rõ ràng, không sử dụng thuật ngữ y khoa quá phức tạp.";

    /**
     * Chat using Groq (Llama 3) - Primary
     */
    public String getAiResponse(String userMessage, List<ChatMessage> history, String context) {
        // Try Groq first
        String response = callGroq(userMessage, history, context);
        if (response != null)
            return response;

        // Fallback to Gemini if Groq fails
        System.out.println("Groq unavailable or failed, falling back to Gemini...");
        return callGemini(userMessage, history, context);
    }

    @SuppressWarnings("unchecked")
    private String callGroq(String userMessage, List<ChatMessage> history, String context) {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", groqModel);

        List<Map<String, String>> messages = new ArrayList<>();

        String systemMsg = SYSTEM_INSTRUCTION;
        if (context != null && !context.trim().isEmpty()) {
            systemMsg += "\n\n[DỮ LIỆU CỦA BẠN]:\n" + context;
        }
        messages.add(Map.of("role", "system", "content", systemMsg));

        if (history != null) {
            for (ChatMessage msg : history) {
                String role = "AI".equals(msg.getSenderType()) ? "assistant" : "user";
                messages.add(Map.of("role", role, "content", msg.getContent() != null ? msg.getContent() : ""));
            }
        }

        messages.add(Map.of("role", "user", "content", userMessage));
        payload.put("messages", messages);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(groqApiUrl, entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, String> message = (Map<String, String>) choices.get(0).get("message");
                    return message.get("content");
                }
            }
        } catch (Exception e) {
            System.err.println("Groq Error calling API: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String userMessage, List<ChatMessage> history, String context) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return "Dạ tính năng AI hiện chưa được cấu hình API key. Anh/Chị vui lòng gọi hotline 1900.1607 để được hỗ trợ nha ạ!";
        }

        String url = geminiChatUrl + "?key=" + geminiApiKey;

        Map<String, Object> payload = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        // Add history and current message
        if (history != null) {
            for (ChatMessage msg : history) {
                Map<String, Object> content = new HashMap<>();
                content.put("role", "AI".equals(msg.getSenderType()) ? "model" : "user");
                content.put("parts", List.of(Map.of("text", msg.getContent() != null ? msg.getContent() : "")));
                contents.add(content);
            }
        }

        // Add current user message with system prompt and context
        String fullUserMsg = userMessage;
        if (context != null && !context.trim().isEmpty()) {
            fullUserMsg = "Dựa trên dữ liệu sau:\n" + context + "\n\nCâu hỏi: " + userMessage;
        }

        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", List.of(Map.of("text", fullUserMsg)));
        contents.add(userContent);

        payload.put("contents", contents);
        payload.put("system_instruction", Map.of("parts", List.of(Map.of("text", SYSTEM_INSTRUCTION))));

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, payload,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> resContent = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, String>> parts = (List<Map<String, String>>) resContent.get("parts");
                    return parts.get(0).get("text");
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini Fallback Error calling API: " + e.getMessage());
            e.printStackTrace();
        }
        return "Dạ hiện tại em đang bận chút xíu, Anh/Chị nhắn lại sau hoặc gọi hotline 1900.1607 nha ạ!";
    }

    /**
     * Embedding using Gemini (Free & Stable)
     */
    public float[] getEmbedding(String text) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return null;
        }

        // Fix: Always use the correct path for embeddings
        String url = geminiEmbedUrl + "?key=" + geminiApiKey;

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", "models/gemini-embedding-001");

        Map<String, Object> contentObj = new HashMap<>();
        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> p = new HashMap<>();
        p.put("text", text);
        parts.add(p);
        contentObj.put("parts", parts);
        payload.put("content", contentObj);

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, payload,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> embedding = (Map<String, Object>) response.getBody().get("embedding");
                @SuppressWarnings("unchecked")
                List<Double> values = (List<Double>) embedding.get("values");
                float[] result = new float[values.size()];
                for (int i = 0; i < values.size(); i++) {
                    result[i] = values.get(i).floatValue();
                }
                return result;
            }
        } catch (Exception e) {
            System.err.println("Embedding Error calling API: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public String getAiResponse(String userMessage, List<ChatMessage> history) {
        return getAiResponse(userMessage, history, null);
    }

    private String resolveApiKey(String currentValue, String envKey) {
        if (currentValue != null && !currentValue.isBlank()) {
            return currentValue;
        }

        String systemValue = System.getenv(envKey);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue;
        }

        for (String directory : List.of(".", "webdatlichkhambenh")) {
            String dotenvValue = readFromDotenv(directory, envKey);
            if (dotenvValue != null && !dotenvValue.isBlank()) {
                return dotenvValue;
            }
        }

        return "";
    }

    private String readFromDotenv(String directory, String envKey) {
        try {
            Path dotenvPath = Path.of(directory, ".env").toAbsolutePath().normalize();
            if (!Files.exists(dotenvPath)) {
                return null;
            }

            Dotenv dotenv = Dotenv.configure()
                    .directory(dotenvPath.getParent().toString())
                    .filename(dotenvPath.getFileName().toString())
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();
            return dotenv.get(envKey);
        } catch (Exception e) {
            return null;
        }
    }
}
