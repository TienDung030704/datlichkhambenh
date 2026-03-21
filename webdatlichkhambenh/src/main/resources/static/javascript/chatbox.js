// Chatbox AI functionality
document.addEventListener('DOMContentLoaded', function() {
  const chatbox = document.getElementById('chatbox');
  const openChatboxBtn = document.getElementById('open-chatbox');
  const closeChatboxBtn = document.getElementById('close-chatbox');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatBody = document.getElementById('chatbox-body');

  // Toggle chatbox visibility
  openChatboxBtn.addEventListener('click', function() {
    chatbox.style.display = 'flex';
    openChatboxBtn.style.display = 'none';
  });

  closeChatboxBtn.addEventListener('click', function() {
    chatbox.style.display = 'none';
    openChatboxBtn.style.display = 'block';
  });

  // Send message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';

    // Show typing indicator
    addTypingIndicator();

    // Send to backend AI
    fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
      // Remove typing indicator
      removeTypingIndicator();

      if (data.success) {
        addMessage(data.message, 'bot');
      } else {
        addMessage('Xin lỗi, có lỗi xảy ra: ' + data.message, 'bot');
      }
    })
    .catch(error => {
      removeTypingIndicator();
      addMessage('Xin lỗi, không thể kết nối với AI. Vui lòng thử lại sau.', 'bot');
      console.error('Error:', error);
    });
  }

  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<em>AI đang trả lời...</em>';
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
      typingDiv.remove();
    }
  }
});