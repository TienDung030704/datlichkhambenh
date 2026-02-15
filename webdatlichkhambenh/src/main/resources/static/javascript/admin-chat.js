let stompClient = null;
let currentRecipient = null; 
const ADMIN_USERNAME = 'Admin';

// Store conversations: { username: { messages: [], unread: 0, lastSeen: timestamp } }
let conversations = {};

document.addEventListener('DOMContentLoaded', () => {
    connect();

    // Event Listeners
    document.getElementById('sendConsoleBtn').addEventListener('click', sendAdminMessage);
    document.getElementById('consoleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAdminMessage();
    });
});

function connect() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; 
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    stompClient.subscribe('/topic/public', onMessageReceived);
    addSystemMessage('Hệ thống Chat đã sẵn sàng.');
}

function onError(error) {
    console.error("Link error:", error);
    addSystemMessage('Mất kết nối server. Vui lòng F5.');
}

function sendAdminMessage() {
    if (!currentRecipient) {
        alert("Vui lòng chọn khách hàng để trả lời!");
        return;
    }

    const input = document.getElementById('consoleInput');
    const content = input.value.trim();
    
    if (content) {
        // Standardize manual send to use the global function so logic is consistent
        sendDirectMessage(currentRecipient, content);
        input.value = '';
    }
}

// Global function to send message from other modules (e.g., Contact Panel)
window.sendDirectMessage = function(recipient, content) {
    if (!recipient || !content) return;

    const chatMessage = {
        sender: ADMIN_USERNAME,
        content: content,
        type: 'CHAT',
        recipient: recipient,
        timestamp: Date.now() // Add local timestamp/id
    };
    
    // 1. Optimistic Update: Show immediately
    addMessageToConversation(recipient, chatMessage);

    // 2. Send to Server
    if (stompClient) {
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    } else {
        console.error("Stomp client not connected");
        // We might want to show an error state on the message if send fails, 
        // but for now let's assume connectivity.
    }
    
    // Ensure user list is updated (if new user)
    renderUserList();
};

// Map to track SessionID -> Username
let sessionIdMap = {};

function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    
    if (message.type === 'JOIN' || message.type === 'LEAVE') {
        return;
    }

    // IGNORE ECHO: If message is from Me (Admin), ignore it because we already rendered it optimistically.
    if (message.sender === ADMIN_USERNAME) {
        return;
    }

    // Determine who this conversation belongs to
    // Since we ignored Admin sender, it must be from User or Bot
    let conversationUser = null;

    if (message.sender === 'Medical Bot') {
        conversationUser = message.recipient;
    } else {
        conversationUser = message.sender;
    }
    
    // --- Session ID Logic & Merging ---
    if (message.sessionId) {
        const sid = message.sessionId;
        const trackedUser = sessionIdMap[sid];
        
        // If we know this session, but the username is different -> MERGE
        if (trackedUser && trackedUser !== conversationUser && conversationUser !== 'Medical Bot') {
            console.log(`[Session Merge] ${trackedUser} -> ${conversationUser}`);
            
            // If trackedUser has history, move it to conversationUser
            if (conversations[trackedUser]) {
                const oldData = conversations[trackedUser];
                
                if (!conversations[conversationUser]) {
                    conversations[conversationUser] = oldData; // Move reference
                } else {
                    // Merge messages if target already exists (rare but possible)
                    conversations[conversationUser].messages = [
                        ...conversations[conversationUser].messages,
                        ...oldData.messages
                    ];
                    // Sort by timestamp if needed, but usually append is fine
                }
                
                // Remove old user
                delete conversations[trackedUser];
                
                // Update Maps
                sessionIdMap[sid] = conversationUser;
                
                // Update UI: If we were viewing the old user, switch view
                if (currentRecipient === trackedUser) {
                    currentRecipient = conversationUser;
                    const headerTitle = document.getElementById('chatHeaderTitle');
                    if(headerTitle) headerTitle.textContent = `Chat với: ${conversationUser}`;
                }
                
                // Re-render User List to reflect change
                renderUserList();
            }
        } else {
            // New session or same user
            sessionIdMap[sid] = conversationUser;
        }
    }
    // ----------------------------------

    if (!conversationUser) return;

    // Add message to storage
    addMessageToConversation(conversationUser, message);
    
    // Play sound if message from user and not currently selected
    if (message.sender !== ADMIN_USERNAME && message.sender !== 'Medical Bot') {
         // new Audio('/sounds/notify.mp3').play().catch(e => {}); 
    }
}

function addMessageToConversation(username, message) {
    if (!conversations[username]) {
        conversations[username] = { messages: [], unread: 0 };
        renderUserList(); // New user appeared
    }
    
    conversations[username].messages.push(message);
    
    // Check if we need to update unread count
    // If we are NOT viewing this user, and it's an incoming message (not from Admin/Bot)
    if (currentRecipient !== username && message.sender !== ADMIN_USERNAME && message.sender !== 'Medical Bot') {
        conversations[username].unread++;
        updateUserListEntry(username);
    }
    
    // If we ARE viewing this user, render the message
    if (currentRecipient === username) {
        renderMessage(message);
        scrollToBottom();
    }
}

function selectUser(username) {
    currentRecipient = username;
    
    // Reset unread
    if (conversations[username]) {
        conversations[username].unread = 0;
    }
    
    // Update active class in list
    updateUserListEntry(username); // To remove badge
    document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.getElementById(`user-${username}`);
    if (activeItem) activeItem.classList.add('active');
    
    // Update Header
    document.getElementById('chatHeaderTitle').textContent = `Chat với: ${username}`;
    document.getElementById('consoleInput').placeholder = `Nhập tin nhắn trả lời ${username}...`;
    document.getElementById('consoleInput').focus();
    
    // Render History
    const chatArea = document.getElementById('consoleMessages');
    chatArea.innerHTML = ''; // Clear
    
    if (conversations[username]) {
        conversations[username].messages.forEach(msg => renderMessage(msg));
    }
    
    scrollToBottom();
}

function renderUserList() {
    const list = document.getElementById('chatUserList');
    list.innerHTML = '';
    
    const users = Object.keys(conversations);
    
    if (users.length === 0) {
        list.innerHTML = '<div class="user-item" style="justify-content: center; color: #94a3b8; font-style: italic; font-size: 13px;">Chưa có ai nhắn tin</div>';
        return;
    }
    
    users.forEach(username => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.id = `user-${username}`;
        div.onclick = () => selectUser(username);
        
        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar-small';
        avatar.textContent = username.charAt(0).toUpperCase();
        
        // Info
        const info = document.createElement('div');
        info.style.flex = '1';
        info.style.display = 'flex';
        info.style.flexDirection = 'column';
        
        const name = document.createElement('span');
        name.style.fontWeight = '500';
        name.textContent = username;
        
        const preview = document.createElement('span');
        preview.style.fontSize = '12px';
        preview.style.color = '#64748b';
        preview.className = 'msg-preview';
        preview.textContent = 'Bấm để xem...';
        
        info.appendChild(name);
        info.appendChild(preview);
        
        // Badge
        const badge = document.createElement('div');
        badge.className = 'unread-badge'; // CSS needed
        badge.style.background = '#ef4444';
        badge.style.color = 'white';
        badge.style.fontSize = '10px';
        badge.style.padding = '2px 6px';
        badge.style.borderRadius = '10px';
        badge.style.display = 'none';
        badge.id = `badge-${username}`;
        
        div.appendChild(avatar);
        div.appendChild(info);
        div.appendChild(badge);
        
        list.appendChild(div);
        
        // Update state if exists
        updateUserListEntry(username);
    });
}

function updateUserListEntry(username) {
    const badge = document.getElementById(`badge-${username}`);
    const unread = conversations[username]?.unread || 0;
    
    if (badge) {
        if (unread > 0) {
            badge.style.display = 'block';
            badge.textContent = unread;
            const item = document.getElementById(`user-${username}`);
            if(item) item.style.fontWeight = 'bold';
        } else {
            badge.style.display = 'none';
             const item = document.getElementById(`user-${username}`);
            if(item) item.style.fontWeight = 'normal';
        }
    }
}

function renderMessage(message) {
    const chatArea = document.getElementById('consoleMessages');
    const div = document.createElement('div');
    div.classList.add('console-message');
    
    // Same logic as before but simplified
    if (message.sender === ADMIN_USERNAME) {
        div.classList.add('sent');
        div.innerHTML = `<div class="message-meta">Bạn</div><div>${message.content}</div>`;
    } else if (message.sender === 'Medical Bot') {
         div.classList.add('bot');
         div.innerHTML = `<div class="message-meta">Bot trả lời</div><div>${message.content}</div>`;
    } else {
        div.classList.add('received');
        div.innerHTML = `<div class="message-meta">${message.sender}</div><div>${message.content}</div>`;
    }
    
    chatArea.appendChild(div);
}

function scrollToBottom() {
    const chatArea = document.getElementById('consoleMessages');
    chatArea.scrollTop = chatArea.scrollHeight;
}

function addSystemMessage(text) {
    const chatArea = document.getElementById('consoleMessages');
    // Only show system messages if no user selected or in a general log?
    // For now, just log to console to not clutter specific chat
    console.log("System:", text);
}
