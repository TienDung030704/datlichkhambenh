let stompClient = null;
let currentSessionId = null;
let activeSessions = [];

document.addEventListener('DOMContentLoaded', () => {
    initAdminChat();
    
    const sendBtn = document.getElementById('sendConsoleBtn');
    if (sendBtn) sendBtn.addEventListener('click', sendAdminMessage);
    
    const input = document.getElementById('consoleInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendAdminMessage();
        });
    }

    // Refresh sessions every 30 seconds
    setInterval(fetchActiveSessions, 30000);
});

function initAdminChat() {
    fetchActiveSessions();
    connectWebSocket();
}

async function fetchActiveSessions() {
    try {
        const response = await fetch('/api/chat/active-sessions');
        activeSessions = await response.json();
        renderUserList();
    } catch (e) {
        console.error("Lỗi tải danh sách session", e);
    }
}

function renderUserList() {
    const listEl = document.getElementById('chatUserList');
    if (!listEl) return;
    
    if (activeSessions.length === 0) {
        listEl.innerHTML = '<div class="user-item" style="justify-content: center; color: #94a3b8; font-style: italic; font-size: 13px;">Chưa có ai nhắn tin</div>';
        return;
    }
    
    listEl.innerHTML = '';
    activeSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'user-item' + (currentSessionId === session.sessionId ? ' active' : '');
        
        const initials = (session.sender || 'K').substring(0, 1).toUpperCase();
        const time = new Date(session.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        
        item.innerHTML = `
            <div class="user-avatar-small">${initials}</div>
            <div class="user-info-brief">
                <div class="user-name">${session.sender} <small style="float:right; font-weight:normal; color:#94a3b8">${time}</small></div>
                <div class="user-last-msg">${session.lastMessage}</div>
            </div>
        `;
        
        item.onclick = () => selectSession(session.sessionId, session.sender);
        listEl.appendChild(item);
    });
}

async function selectSession(sessionId, senderName) {
    currentSessionId = sessionId;
    document.getElementById('chatHeaderTitle').textContent = `Đang chat với: ${senderName}`;
    document.getElementById('livechatSection').querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
    
    // Highlight selected
    renderUserList(); 
    
    // Tải lịch sử cho session này
    loadSessionHistory(sessionId);
}

async function loadSessionHistory(sessionId) {
    const messagesEl = document.getElementById('consoleMessages');
    messagesEl.innerHTML = '<div class="console-message bot">Đang tải lịch sử...</div>';
    
    try {
        const response = await fetch(`/api/chat/history?sessionId=${sessionId}`);
        if (!response.ok) throw new Error("Server error: " + response.status);
        const history = await response.json();
        
        messagesEl.innerHTML = '';
        if (history.length === 0) {
            messagesEl.innerHTML = '<div class="console-message bot">Chưa có nội dung hội thoại.</div>';
        } else {
            history.forEach(msg => renderConsoleMessage(msg));
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
    } catch (e) {
        console.error("Lỗi history:", e);
        messagesEl.innerHTML = `<div class="console-message bot">Lỗi khi tải lịch sử: ${e.message}</div>`;
    }
}

function renderConsoleMessage(message) {
    const messagesEl = document.getElementById('consoleMessages');
    const msgDiv = document.createElement('div');
    
    const senderType = (message.senderType || 'USER').toLowerCase();
    msgDiv.className = `console-message ${senderType}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    const content = message.content || (message.type === 'JOIN' ? '[Tham gia chat]' : message.type === 'LEAVE' ? '[Rời chat]' : '');
    
    // Bubble
    msgDiv.innerHTML = `<div>${content.replace(/\n/g, '<br>')}</div>`;
    
    // Meta (Outside the bubble for better alignment control)
    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';
    metaDiv.textContent = `${message.sender} • ${time}`;
    
    messagesEl.appendChild(msgDiv);
    messagesEl.appendChild(metaDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    
    stompClient.connect({}, () => {
        stompClient.subscribe('/topic/admin_messages', (payload) => {
            const message = JSON.parse(payload.body);
            
            // Nếu tin nhắn thuộc session đang chọn, hiển thị ngay
            if (message.sessionId === currentSessionId) {
                renderConsoleMessage(message);
            }
            
            // Cập nhật danh sách session
            updateSessionListOnMessage(message);
        });
    });
}

function updateSessionListOnMessage(message) {
    const idx = activeSessions.findIndex(s => s.sessionId === message.sessionId);
    if (idx !== -1) {
        activeSessions[idx].lastMessage = message.content;
        activeSessions[idx].timestamp = message.timestamp;
        activeSessions[idx].sender = message.sender;
    } else {
        activeSessions.unshift({
            sessionId: message.sessionId,
            sender: message.sender,
            lastMessage: message.content,
            timestamp: message.timestamp,
            senderType: message.senderType
        });
    }
    
    // Sort logic
    activeSessions.sort((a, b) => b.timestamp - a.timestamp);
    renderUserList();
}

function sendAdminMessage() {
    const input = document.getElementById('consoleInput');
    const content = input.value.trim();
    
    if (content && currentSessionId && stompClient) {
        const chatMessage = {
            sender: "Tiếp tân",
            senderType: "STAFF",
            content: content,
            type: 'CHAT',
            sessionId: currentSessionId
        };
        
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        input.value = '';
    } else if (!currentSessionId) {
        alert("Vui lòng chọn một khách hàng để trả lời!");
    }
}
