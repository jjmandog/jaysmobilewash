/**
 * Advanced Chatbot - Vanilla JS Implementation
 * Simple working version for debugging
 */

// Define API options
const API_OPTIONS = [
  {
    id: 'auto',
    name: 'Auto (Let AI choose)',
    endpoint: '/api/auto',
    description: 'Automatically selects the best AI model for your query',
    enabled: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Chat (Free)',
    endpoint: '/api/deepseek',
    description: 'DeepSeek AI models via OpenRouter',
    enabled: true
  }
];

// Define default role assignments
const DEFAULT_ROLE_ASSIGNMENTS = {
  auto: 'auto',
  reasoning: 'auto',
  tools: 'auto',
  quotes: 'auto',
  photo_uploads: 'auto',
  summaries: 'auto',
  search: 'auto',
  chat: 'auto',
  analytics: 'auto',
  deep_analysis: 'auto',
  multi_language: 'auto',
  safety: 'auto',
  accessibility: 'auto'
};

// Chat roles
const CHAT_ROLES = [
  {
    id: 'auto',
    name: 'Auto Mode',
    description: 'Smart detection - automatically selects the best mode for your query'
  },
  {
    id: 'chat',
    name: 'Chat',
    description: 'General conversational interactions'
  },
  {
    id: 'quotes',
    name: 'Quotes',
    description: 'Service quotes and pricing estimates'
  }
];

// Simple quote engine
class ChatQuoteEngine {
  constructor() {
    this.services = {
      'basic_wash': { name: 'Basic Wash', price: 25 },
      'premium_wash': { name: 'Premium Wash', price: 45 },
      'full_detail': { name: 'Full Detail', price: 150 },
      'ceramic_coating': { name: 'Ceramic Coating', price: 300 }
    };
  }
  
  generateQuote(message) {
    return `Thanks for your interest! For a detailed quote, please call us at 562-228-9429.`;
  }
}

// Simple conversation memory
class ConversationMemory {
  constructor() {
    this.memories = [];
  }
  
  recordConversation(message, response, metadata) {
    this.memories.push({ message, response, metadata, timestamp: Date.now() });
  }
  
  getLearnedResponse(message) {
    return null;
  }
}

// Main chatbot class
class AdvancedChatBot {
  constructor(containerId) {
    console.log('🔍 Looking for container:', containerId);
    this.container = document.getElementById(containerId);
    console.log('📦 Container found:', this.container);
    
    if (!this.container) {
      console.error('❌ Container not found! Cannot initialize chatbot.');
      return;
    }
    
    this.isOpen = false;
    this.isProcessing = false;
    this.messages = [];
    this.currentRole = 'auto';
    this.selectedModel = 'auto';
    this.assignments = { ...DEFAULT_ROLE_ASSIGNMENTS };
    this.quoteEngine = new ChatQuoteEngine();
    this.memory = new ConversationMemory();
    
    this.uploadedFiles = [];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    this.init();
  }
  
  init() {
    console.log('🔧 Initializing chatbot...');
    this.createChatWidget();
    this.setupEventListeners();
    console.log('✅ Chatbot initialized successfully!');
  }
  
  createChatWidget() {
    console.log('🔧 Creating chat widget...');
    const widget = document.createElement('div');
    widget.className = 'advanced-chatbot-widget';
    widget.innerHTML = `
      <div class="chatbot-toggle" id="chatbot-toggle">
        <span class="chat-icon">🤖</span>
        <span class="chat-text">AI Chat</span>
      </div>
      <div class="chatbot-window" id="chatbot-window" style="display: none;">
        <div class="chatbot-header">
          <div class="chatbot-title">
            <span>Jay's AI Assistant</span>
          </div>
          <div class="header-actions">
            <button class="chatbot-close" id="chatbot-close">✕</button>
          </div>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="message bot-message">
            <div class="message-content">
              Hello! I'm Jay's AI Assistant. I can help with quotes, service information, and more.
            </div>
          </div>
        </div>
        
        <div class="chatbot-input-area">
          <input type="text" class="chatbot-input" id="chatbot-input" 
                 placeholder="Ask about our services, get quotes, or general questions...">
          <button class="chatbot-send" id="chatbot-send">Send</button>
        </div>
      </div>
    `;
    
    this.container.appendChild(widget);
    console.log('✅ Widget created and appended!');
  }
  
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const send = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    
    console.log('🔗 Elements found:', {
      toggle: !!toggle,
      close: !!close,
      send: !!send,
      input: !!input
    });
    
    if (toggle) {
      toggle.addEventListener('click', () => {
        console.log('🎯 Toggle button clicked!');
        this.toggleChat();
      });
      console.log('✅ Toggle event listener attached!');
    }
    
    if (close) {
      close.addEventListener('click', () => this.closeChat());
    }
    
    if (send) {
      send.addEventListener('click', () => this.sendMessage());
    }
    
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }
    
    console.log('✅ All event listeners setup complete!');
  }
  
  toggleChat() {
    console.log('🎯 Toggling chat! Current state:', this.isOpen);
    const chatWindow = document.getElementById('chatbot-window');
    if (this.isOpen) {
      chatWindow.style.display = 'none';
      this.isOpen = false;
      console.log('📤 Chat closed');
    } else {
      chatWindow.style.display = 'block';
      this.isOpen = true;
      console.log('📥 Chat opened');
      const input = document.getElementById('chatbot-input');
      if (input) input.focus();
    }
  }
  
  closeChat() {
    console.log('🔒 Closing chat');
    document.getElementById('chatbot-window').style.display = 'none';
    this.isOpen = false;
  }
  
  sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message || this.isProcessing) return;
    
    console.log('📤 Sending message:', message);
    this.addMessage(message, 'user');
    input.value = '';
    
    // Simple response for testing
    setTimeout(() => {
      this.addMessage('Thanks for your message! This is a test response. For real assistance, please call 562-228-9429.', 'bot');
    }, 500);
  }
  
  addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🤖 DOM loaded, initializing chatbot...');
  if (typeof window !== 'undefined') {
    window.AdvancedChatBot = AdvancedChatBot;
  }
});
