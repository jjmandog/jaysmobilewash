/**
 * Chat Bot - Minimal Version
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("Chat Bot initialized");
  
  const chatToggle = document.getElementById('chat-toggle-btn');
  const chatContainer = document.getElementById('chat-container');
  const chatInput = document.getElementById('chat-input-field');
  const sendButton = document.getElementById('chat-send-btn');
  const messagesContainer = document.getElementById('chat-messages');
  
  // Toggle chat open/closed
  if (chatToggle && chatContainer) {
    chatToggle.addEventListener('click', function() {
      const isExpanded = chatToggle.getAttribute('aria-expanded') === 'true';
      chatToggle.setAttribute('aria-expanded', !isExpanded);
      chatContainer.setAttribute('aria-hidden', isExpanded);
      chatContainer.style.display = isExpanded ? 'none' : 'block';
    });
  }
  
  // Handle sending messages
  if (sendButton && chatInput && messagesContainer) {
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  function sendMessage() {
    if (!chatInput.value.trim()) return;
    
    // Add user message
    addMessage(chatInput.value, 'user');
    
    // Simulate response
    setTimeout(function() {
      const responses = [
        "Thanks for your message! To get an accurate quote, please call us at 562-228-9429.",
        "We offer various detailing packages starting at $70. Would you like to book an appointment?",
        "Our team serves all of Los Angeles and Orange County. When would you like us to come detail your vehicle?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, 'system');
    }, 1000);
    
    // Clear input
    chatInput.value = '';
  }
  
  function addMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
