package com.webdatlichkhambenh.repository;

import com.webdatlichkhambenh.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Find messages by Session ID
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(String sessionId);

    // Find messages for a specific user (Sender OR Recipient)
    List<ChatMessage> findBySenderOrRecipientOrderByTimestampAsc(String sender, String recipient);

    // Find messages between two users (e.g. User & Admin) - A bit more complex,
    // but for now finding by Session/User is enough for the Widget.

    // Custom query to find by SessionId OR Username (Sender/Recipient)
    // Custom query to find by SessionId OR Username (Sender/Recipient)
    // NOTE: This might be risky if usernames are not unique.
    // Ensure we only fetch messages relevant to THIS user.
    @org.springframework.data.jpa.repository.Query("SELECT m FROM ChatMessage m WHERE m.sessionId = :sessionId OR (m.sender = :username OR m.recipient = :username) ORDER BY m.timestamp ASC")
    List<ChatMessage> findBySessionIdOrUsername(
            @org.springframework.data.repository.query.Param("sessionId") String sessionId,
            @org.springframework.data.repository.query.Param("username") String username);
}
