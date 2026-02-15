package com.webdatlichkhambenh.controller;

import com.webdatlichkhambenh.model.ChatMessage;
import com.webdatlichkhambenh.service.ChatBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.webdatlichkhambenh.repository.ChatMessageRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.ArrayList;

@Controller
public class ChatController {

    @Autowired
    private ChatBotService chatBotService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private com.webdatlichkhambenh.config.ChatOperatingHours chatOperatingHours;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(System.currentTimeMillis());

        // Lưu tin nhắn
        chatMessageRepository.save(chatMessage);

        // Nếu là User, Bot sẽ trả lời
        if (chatMessage.getType() == ChatMessage.MessageType.CHAT &&
                !"Admin".equals(chatMessage.getSender()) &&
                !"Medical Bot".equals(chatMessage.getSender())) {

            // Xử lý và trả lời (bất đồng bộ)
            new Thread(() -> {
                try {
                    Thread.sleep(800); // Giả lập độ trễ
                    ChatMessage reply = chatBotService.analyzeAndReply(chatMessage);
                    if (reply != null) {
                        // Đảm bảo cùng session ID
                        reply.setSessionId(chatMessage.getSessionId());
                        // Lưu và gửi
                        chatMessageRepository.save(reply);
                        messagingTemplate.convertAndSend("/topic/public", reply);
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }

        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {
        // Thêm username vào session
        java.util.Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null) {
            sessionAttributes.put("username", chatMessage.getSender());
        }
        chatMessage.setTimestamp(System.currentTimeMillis());

        // Lưu thông báo JOIN
        chatMessageRepository.save(chatMessage);

        return chatMessage;
    }

    // API kiểm tra trạng thái hoạt động
    @GetMapping("/api/chat/status")
    @ResponseBody
    public java.util.Map<String, Object> getChatStatus() {
        java.util.Map<String, Object> status = new java.util.HashMap<>();
        boolean isOnline = chatOperatingHours.isOperating();

        status.put("isOnline", isOnline);
        status.put("message", isOnline ? "Chat đang hoạt động" : chatOperatingHours.getOperatingHoursMessage());

        return status;
    }

    // API lấy lịch sử chat
    @GetMapping("/api/chat/history")
    @ResponseBody
    public List<ChatMessage> getChatHistory(@RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String username) {

        if (sessionId != null && !sessionId.isEmpty() && username != null && !username.isEmpty()) {
            return chatMessageRepository.findBySessionIdOrUsername(sessionId, username);
        }

        if (sessionId != null && !sessionId.isEmpty()) {
            return chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        }

        if (username != null && !username.isEmpty()) {
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
            return org.springframework.http.ResponseEntity.ok("Cleared " + messagesToDelete.size() + " messages");
        }

        return org.springframework.http.ResponseEntity.ok("No messages to clear");
    }
}
