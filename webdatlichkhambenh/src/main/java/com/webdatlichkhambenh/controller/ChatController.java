package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.model.ChatMessage;
import com.webdatlichkhambenh.service.AiService;
import com.webdatlichkhambenh.service.VectorStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.webdatlichkhambenh.repository.ChatMessageRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.ResponseEntity;

@Controller
public class ChatController {

    @Autowired
    private AiService aiService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;


    // Quản lý trạng thái Mute AI theo Session ID
    private static final java.util.concurrent.ConcurrentHashMap<String, Boolean> aiMutedSessions = new java.util.concurrent.ConcurrentHashMap<>();
    @Autowired
    private VectorStoreService vectorStoreService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(System.currentTimeMillis());

        // Mặc định senderType nếu chưa có
        if (chatMessage.getSenderType() == null) {
            String sender = chatMessage.getSender();
            if ("Admin".equals(sender) || "Tiếp tân".equals(sender)) {
                chatMessage.setSenderType("STAFF");
                // Khi Staff nhắn tin, tự động MUTE AI cho session này
                aiMutedSessions.put(chatMessage.getSessionId(), true);
            } else if ("Medical Bot".equals(sender)) {
                chatMessage.setSenderType("AI");
            } else {
                chatMessage.setSenderType("USER");
            }
        }

        // Lưu và gửi cho chính user + admin
        chatMessageRepository.save(chatMessage);
        sendToRelevantParties(chatMessage);

        // Logic AI Phản hồi
        boolean isAiMuted = aiMutedSessions.getOrDefault(chatMessage.getSessionId(), false);
        
        if ("USER".equals(chatMessage.getSenderType()) && !isAiMuted) {
            // Xử lý bằng Gemini + RAG (Bất đồng bộ)
            new Thread(() -> {
                try {
                    String userContent = chatMessage.getContent();
                    String sessionId = chatMessage.getSessionId();
                    
                    if (userContent == null || userContent.trim().isEmpty()) {
                        System.out.println("AI Thread: Empty content, skipping response.");
                        return;
                    }

                    // 1. Lấy ngữ cảnh liên quan (RAG)
                    String context = vectorStoreService.findRelevantContext(userContent);
                    
                    // 2. Lấy lịch sử ngắn của session để AI có ngữ cảnh hội thoại
                    List<ChatMessage> history = sessionId != null 
                        ? chatMessageRepository.findTop10BySessionIdOrderByTimestampAsc(sessionId)
                        : new ArrayList<>();
                    
                    // 3. Gọi Groq/Llama với Ngữ cảnh + Lịch sử
                    String response = aiService.getAiResponse(userContent, history, context);
                    
                    if (response == null) {
                        response = "Dạ, em chưa tìm được câu trả lời phù hợp. Anh/Chị gọi hotline 1900.1607 nha!";
                    }
                    
                    ChatMessage reply = new ChatMessage();
                    reply.setType(ChatMessage.MessageType.CHAT);
                    reply.setSender("Medical Bot");
                    reply.setSenderType("AI");
                    reply.setRecipient(chatMessage.getSender());
                    reply.setContent(response);
                    reply.setSessionId(chatMessage.getSessionId());
                    reply.setTimestamp(System.currentTimeMillis());

                    // 4. Lưu và gửi (cho cả user và admin)
                    chatMessageRepository.save(reply);
                    sendToRelevantParties(reply);
                } catch (Exception e) {
                    System.err.println("CRITICAL Error in AI response thread!");
                    e.printStackTrace();
                }
            }).start();
        }

    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {
        // Thêm username vào session
        java.util.Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null) {
            sessionAttributes.put("username", chatMessage.getSender());
        }
        chatMessage.setTimestamp(System.currentTimeMillis());

        // Lưu thông báo JOIN và thông báo cho admin
        chatMessageRepository.save(chatMessage);
        sendToRelevantParties(chatMessage);
    }

    private void sendToRelevantParties(ChatMessage msg) {
        if (msg.getSessionId() != null) {
            // 1. Gửi tới kênh riêng của người dùng
            messagingTemplate.convertAndSend("/topic/chat/" + msg.getSessionId(), msg);
            
            // 2. Gửi tới kênh giám sát của Admin
            messagingTemplate.convertAndSend("/topic/admin_messages", msg);
        }
    }

    // API trả về lịch hoạt động (luôn mở vì đã có AI 24/7)
    @GetMapping("/api/chat/status")
    @ResponseBody
    public Map<String, Object> getChatStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "OPEN");
        result.put("message", "Hệ thống AI Chat hoạt động 24/7. Rất hân hạnh được hỗ trợ bạn!");
        return result;
    }

    // API lấy lịch sử chat
    @GetMapping("/api/chat/history")
    @ResponseBody
    public List<ChatMessage> getChatHistory(@RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String username) {

        // Nếu là Admin/Tiếp tân đang mở Widget ở ngoài, chỉ lấy lịch sử của SESSION này.
        // Không được ghép theo username vì Admin gửi tin cho tất cả mọi người -> Lộ dữ liệu.
        boolean isStaff = "Admin".equalsIgnoreCase(username) || "Administrator".equalsIgnoreCase(username) || "Tiếp tân".equalsIgnoreCase(username);

        if (sessionId != null && !sessionId.isEmpty()) {
            if (username != null && !username.isEmpty()) {
                if (isStaff) {
                    return chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
                }
                return chatMessageRepository.findBySessionIdOrUsername(sessionId, username);
            }
            return chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        }

        if (username != null && !username.isEmpty() && !isStaff) {
            return chatMessageRepository.findBySenderOrRecipientOrderByTimestampAsc(username, username);
        }

        return new ArrayList<>();
    }

    // API xóa lịch sử chat
    @org.springframework.web.bind.annotation.DeleteMapping("/api/chat/clear")
    @ResponseBody
    public org.springframework.http.ResponseEntity<String> clearChatHistory(
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String username) {

        List<ChatMessage> messagesToDelete = new ArrayList<>();

        if (sessionId != null && !sessionId.isEmpty() && username != null && !username.isEmpty()) {
            messagesToDelete = chatMessageRepository.findBySessionIdOrUsername(sessionId, username);
        } else if (sessionId != null && !sessionId.isEmpty()) {
            messagesToDelete = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        } else if (username != null && !username.isEmpty()) {
            messagesToDelete = chatMessageRepository.findBySenderOrRecipientOrderByTimestampAsc(username, username);
        } else {
            return org.springframework.http.ResponseEntity.badRequest().body("Cần sessionId hoặc username");
        }

        if (!messagesToDelete.isEmpty()) {
            chatMessageRepository.deleteAll(messagesToDelete);
            return ResponseEntity.ok("Cleared " + messagesToDelete.size() + " messages");
        }

        return ResponseEntity.ok("No messages to clear");
    }

    @GetMapping("/api/chat/active-sessions")
    @ResponseBody
    public List<Map<String, Object>> getActiveSessions() {
        List<ChatMessage> allMessages = chatMessageRepository.findAll();
        
        // Map: SessionId -> SessionDetails
        Map<String, Map<String, Object>> sessions = new HashMap<>();
        
        for (ChatMessage msg : allMessages) {
            String sid = msg.getSessionId();
            if (sid == null) continue;
            
            Map<String, Object> session = sessions.computeIfAbsent(sid, k -> {
                Map<String, Object> s = new HashMap<>();
                s.put("sessionId", k);
                s.put("timestamp", 0L);
                s.put("sender", "Khách");
                s.put("lastMessage", "");
                return s;
            });
            
            // Cập nhật người gửi (Ưu tiên lấy tên Người dùng thật thay vì Bot/Admin)
            if ("USER".equals(msg.getSenderType())) {
                session.put("sender", msg.getSender());
            }
            
            // Cập nhật tin nhắn cuối
            if (msg.getTimestamp() >= (Long)session.get("timestamp")) {
                session.put("timestamp", msg.getTimestamp());
                
                String content = msg.getContent();
                if (content == null || content.trim().isEmpty()) {
                    if (msg.getType() == ChatMessage.MessageType.JOIN) content = "[Tham gia chat]";
                    else if (msg.getType() == ChatMessage.MessageType.LEAVE) content = "[Rời chat]";
                    else content = "[Tin nhắn trống]";
                }
                session.put("lastMessage", content);
                session.put("senderType", msg.getSenderType());
            }
        }
        
        List<Map<String, Object>> result = new ArrayList<>(sessions.values());
        result.sort((a, b) -> Long.compare((Long)b.get("timestamp"), (Long)a.get("timestamp")));
        return result;
    }
}
