let stompClient = null;
let username = null;

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    // Sự kiện UI
    const widgetBtn = document.getElementById('chatWidgetBtn');
    if (widgetBtn) widgetBtn.addEventListener('click', toggleChat);
    
    const closeBtn = document.getElementById('closeChatBtn');
    if (closeBtn) closeBtn.addEventListener('click', toggleChat);
    
    const sendBtn = document.getElementById('sendChatBtn');
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    
    const input = document.getElementById('chatInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

     // Nút Đăng nhập
    const loginBtn = document.getElementById('chatLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleChatLogin);
    }
    
    // Nút thao tác nhanh
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            sendText(this.textContent);
        });
    });

    // Sự kiện Xóa Chat
    const clearBtn = document.getElementById('clearChatBtn');
    if (clearBtn) clearBtn.addEventListener('click', showDeleteConfirm);

    // Sự kiện Modal
    const modal = document.getElementById('deleteConfirmModal');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        if(modal) modal.classList.remove('active');
    });

    if (confirmBtn) confirmBtn.addEventListener('click', () => {
        if(modal) modal.classList.remove('active');
        performClearChat();
    });
    
    // Kiểm tra trạng thái chat và khởi tạo
    checkChatStatusAndInit();
});

function showDeleteConfirm(e) {
     e.stopPropagation();
     const modal = document.getElementById('deleteConfirmModal');
     if (modal) modal.classList.add('active');
}

async function performClearChat() {
    const sessionId = getSessionId();
    const currentUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    let usernameParam = '';
    
    if (currentUser) {
        try {
            const userObj = JSON.parse(currentUser);
            usernameParam = userObj.username;
        } catch (e) {}
    } else {
        usernameParam = localStorage.getItem('chat_guest_name') || '';
    }
    
    try {
        const url = `/api/chat/clear?sessionId=${sessionId}&username=${usernameParam}`;
        await fetch(url, { method: 'DELETE' });
        
        // Xóa giao diện
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                    <em>Đã xóa lịch sử trò chuyện</em>
                </div>
            `;
            // Thêm lại lời chào của Bot
             setTimeout(() => {
                const welcomeDiv = document.createElement('div');
                welcomeDiv.className = 'message received';
                welcomeDiv.innerHTML = `<strong>Medical Bot</strong><br>Chào bạn! Tôi là <b>Trợ lý ảo Y tế</b>.<br>Bạn cần giúp đỡ gì thêm không?`;
                chatMessages.appendChild(welcomeDiv);
            }, 1000);
        }
    } catch (error) {
        console.error("Lỗi xóa chat:", error);
        alert("Lỗi khi xóa lịch sử chat.");
    }
}

async function checkChatStatusAndInit() {
    try {
        const response = await fetch('/api/chat/status');
        const {isOnline, message} = await response.json();
        
        if (!isOnline) {
            showOfflineNotice(message);
            return;
        }
        
        // Chat đang online, khởi tạo bình thường
        checkUserAndInit();
    } catch (e) {
        console.error("Lỗi kiểm tra trạng thái chat:", e);
        // Nếu lỗi API, giả định là online
        checkUserAndInit();
    }
}

function showOfflineNotice(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    chatMessages.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 10px;">🔴</div>
            <div style="font-weight: bold; margin-bottom: 10px;">Hết giờ làm việc</div>
            <div style="color: #666; font-size: 13px; white-space: pre-line; margin-bottom: 15px;">${message}</div>
            <button onclick="goToContact()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Gửi Liên Hệ
            </button>
        </div>
    `;
    
    // Vô hiệu hóa input
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    if (chatInput) chatInput.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
}

function goToContact() {
    window.location.href = '/html/contact.html';
}

const getSessionId = () => {
    let sid = localStorage.getItem('chat_session_id');
    if (!sid) {
        sid = 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chat_session_id', sid);
    }
    return sid;
};

function checkUserAndInit() {
    // Đảm bảo session ID tồn tại
    getSessionId();

    // 1. Kiểm tra nếu đã đăng nhập (User đã đăng ký)
    const currentUserStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    if (currentUserStr) {
        try {
            const user = JSON.parse(currentUserStr);
            if (user && (user.fullName || user.username)) {
                username = user.fullName || user.username;
                
                // Tải lịch sử ngay
                if (!window.chatHistoryLoaded) {
                    loadHistory();
                    window.chatHistoryLoaded = true;
                }
                
                connect();
                return;
            }
        } catch (e) { console.error("Lỗi parse user", e); }
    }

    // 2. Kiểm tra nếu là Khách cũ
    const savedGuest = localStorage.getItem('chat_guest_name');
    if (savedGuest) {
        username = savedGuest;
        
        // Tải lịch sử ngay
        if (!window.chatHistoryLoaded) {
            loadHistory();
            window.chatHistoryLoaded = true;
        }
        
        connect();
    } else {
        // 3. Hiển thị màn hình đăng nhập Chat
        showLoginScreen();
    }
}

function showLoginScreen() {
    const loginOverlay = document.getElementById('chatLoginOverlay');
    const chatMsgs = document.getElementById('chatMessages');
    const inputArea = document.querySelector('.chat-input-area');
    const quickActions = document.querySelector('.quick-actions');

    if (loginOverlay) {
        loginOverlay.classList.add('active');
        // Ẩn các phần tử khác
        if(chatMsgs) chatMsgs.style.display = 'none';
        if(inputArea) inputArea.style.display = 'none';
        if(quickActions) quickActions.style.display = 'none';
    }
}

function handleChatLogin() {
    const nameInput = document.getElementById('chatNameInput');
    const name = nameInput.value.trim();
    
    if (name) {
        username = name;
        localStorage.setItem('chat_guest_name', username); // Lưu cho lần sau
        
        // Ẩn overlay, hiện chat
        const loginOverlay = document.getElementById('chatLoginOverlay');
        const chatMsgs = document.getElementById('chatMessages');
        const inputArea = document.querySelector('.chat-input-area');
        const quickActions = document.querySelector('.quick-actions');
        
        loginOverlay.classList.remove('active');
        if(chatMsgs) chatMsgs.style.display = 'flex';
        if(inputArea) inputArea.style.display = 'flex';
        if(quickActions) quickActions.style.display = 'flex';
        
        // Tải lịch sử ngay
        if (!window.chatHistoryLoaded) {
            loadHistory();
            window.chatHistoryLoaded = true;
        }

        // Kết nối
        connect();
    } else {
        alert("Vui lòng nhập tên của bạn!");
    }
}

function connect() {
    if (stompClient && stompClient.connected) return;

    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; 
    
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    stompClient.subscribe('/topic/public', onMessageReceived);
    
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN', sessionId: getSessionId()})
    );
    
    // Bật input nếu đang tắt
    document.getElementById('chatInput').disabled = false;
}

function onError(error) {
    console.error("Lỗi Chat:", error);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    if (content) {
        sendText(content);
        input.value = '';
    }
}

function sendText(content) {
    if (stompClient) {
        const chatMessage = {
            sender: username,
            content: content,
            type: 'CHAT',
            sessionId: getSessionId()
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    } else {
        alert("Chưa kết nối tới máy chủ chat. Vui lòng thử lại giây lát.");
    }
}

function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    const api = document.getElementById('chatMessages');
    
    // Lọc quyền riêng tư: Chỉ hiện tin nhắn liên quan đến mình
    const mySessionId = getSessionId();
    const isRelated = (message.recipient === username) || 
                      (message.sender === username) || 
                      (message.recipient === 'ALL') ||
                      (message.recipient === localStorage.getItem('chat_guest_name')) ||
                      (message.sessionId === mySessionId);

    if (!isRelated) {
        return; 
    }
    
    // Render tin nhắn
    renderMessageElement(message, api);
    api.scrollTop = api.scrollHeight;
    
    // Lưu tạm vào history local (không bắt buộc vì đã có server)
    saveMessageToHistory(message);
}    


function saveMessageToHistory(message) {
    let history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    // Giới hạn 50 tin nhắn
    if (history.length > 50) history.shift();
    history.push(message);
    localStorage.setItem('chat_history', JSON.stringify(history));
}

async function loadHistory() {
    const sessionId = getSessionId();
    let url = `/api/chat/history?sessionId=${sessionId}`;
    
    // Nếu là User đăng ký, gửi thêm username để lấy lịch sử cũ
    const currentUserStr = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    if (currentUserStr) {
        try {
            const user = JSON.parse(currentUserStr);
            const regUsername = user.username || user.fullName;
            if (regUsername) {
                url += `&username=${encodeURIComponent(regUsername)}`;
            }
        } catch(e) {}
    } else if (username && username !== localStorage.getItem('chat_guest_name')) {
         url += `&username=${encodeURIComponent(username)}`;
    }
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Thất bại tải lịch sử");
        
        const history = await response.json();
        
        const api = document.getElementById('chatMessages');
        if (!api) return;
        
        // Giữ lại tin nhắn chào mừng mặc định nếu có, sau đó append history
        history.forEach(msg => {
             renderMessageElement(msg, api);
        });
        api.scrollTop = api.scrollHeight;
        
    } catch (e) {
        console.error("Lỗi tải lịch sử", e);
        // Fallback: Sử dụng LocalStorage nếu API lỗi
        const rawHistory = localStorage.getItem('chat_history');
        if (rawHistory) {
            let history = JSON.parse(rawHistory);
            const api = document.getElementById('chatMessages');
            history.forEach(msg => renderMessageElement(msg, api));
        }
    }
}

function renderMessageElement(message, api) {
    const mySessionId = getSessionId();
    const savedGuestName = localStorage.getItem('chat_guest_name');
     
    const isRelated = (message.recipient === username) || 
                      (message.sender === username) || 
                      (message.recipient === 'ALL') ||
                      (message.recipient === savedGuestName) ||
                      (message.sender === savedGuestName) || 
                      (message.sessionId === mySessionId);
     
    if (!isRelated) {
        return;
    }
     
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (message.type === 'JOIN' || message.type === 'LEAVE') {
        return;
    }
    
    // Xác định tin nhắn của "Tôi"
    // Bot và Admin KHÔNG bao giờ là "Tôi"
    const isBot = message.sender === 'Medical Bot';
    const isAdmin = message.sender === 'Admin' || message.sender === 'Administrator' || message.sender === 'Tiếp tân';
    
    let isMe = false;
    if (!isBot && !isAdmin) {
         isMe = (message.sender === username) || 
                (savedGuestName && message.sender === savedGuestName) || 
                (message.sessionId && message.sessionId === mySessionId);
    }
        
    if (isMe) {
        messageElement.classList.add('sent');
        messageElement.textContent = message.content;
    } else {
        messageElement.classList.add('received');
        
        const senderName = isAdmin ? 'Tiếp tân' : message.sender;
        
        // Render HTML cho Bot/Admin (cần unescape nếu bị escape)
        let contentHtml = message.content;
        
        if (contentHtml.includes("&lt;") && contentHtml.includes("&gt;")) {
            const txt = document.createElement("textarea");
            txt.innerHTML = contentHtml;
            contentHtml = txt.value;
        }

        messageElement.innerHTML = `<strong>${senderName}</strong><br><span>${contentHtml}</span>`;
    }
    api.appendChild(messageElement);
}

function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.classList.toggle('active');
}

