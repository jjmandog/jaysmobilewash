graph TD
  A[Chatbot Roles]
  A1[auto<br/>(Auto Router)<br/>Summarizer: YES]
  A2[reasoning<br/>(Reasoning Handler)<br/>Summarizer: YES]
  A3[tools<br/>(Tools Handler)<br/>Summarizer: MAYBE]
  A4[quotes<br/>(ChatQuoteEngine)<br/>Summarizer: NO]
  A5[photo_uploads<br/>(Vision Handler)<br/>Summarizer: MAYBE]
  A6[summaries<br/>(Summarizer Handler)<br/>Summarizer: N/A]
  A7[search<br/>(Search Handler)<br/>Summarizer: MAYBE]
  A8[chat<br/>(Chat Handler)<br/>Summarizer: MAYBE]
  A9[analytics<br/>(Analytics Handler)<br/>Summarizer: MAYBE]
  A10[deep_analysis<br/>(Deep Analysis Handler)<br/>Summarizer: YES]
  A11[multi_language<br/>(Translation Handler)<br/>Summarizer: MAYBE]
  A12[safety<br/>(Safety Handler)<br/>Summarizer: MAYBE]
  A13[accessibility<br/>(Accessibility Handler)<br/>Summarizer: MAYBE]

  A --> A1
  A --> A2
  A --> A3
  A --> A4
  A --> A5
  A --> A6
  A --> A7
  A --> A8
  A --> A9
  A --> A10
  A --> A11
  A --> A12
  A --> A13graph TD
  A[Chatbot Roles]
  A1[auto<br/>(Auto Router)<br/>Summarizer: YES]
  A2[reasoning<br/>(Reasoning Handler)<br/>Summarizer: YES]
  A3[tools<br/>(Tools Handler)<br/>Summarizer: MAYBE]
  A4[quotes<br/>(ChatQuoteEngine)<br/>Summarizer: NO]
  A5[photo_uploads<br/>(Vision Handler)<br/>Summarizer: MAYBE]
  A6[summaries<br/>(Summarizer Handler)<br/>Summarizer: N/A]
  A7[search<br/>(Search Handler)<br/>Summarizer: MAYBE]
  A8[chat<br/>(Chat Handler)<br/>Summarizer: MAYBE]
  A9[analytics<br/>(Analytics Handler)<br/>Summarizer: MAYBE]
  A10[deep_analysis<br/>(Deep Analysis Handler)<br/>Summarizer: YES]
  A11[multi_language<br/>(Translation Handler)<br/>Summarizer: MAYBE]
  A12[safety<br/>(Safety Handler)<br/>Summarizer: MAYBE]
  A13[accessibility<br/>(Accessibility Handler)<br/>Summarizer: MAYBE]

  A --> A1
  A --> A2
  A --> A3
  A --> A4
  A --> A5
  A --> A6
  A --> A7
  A --> A8
  A --> A9
  A --> A10
  A --> A11
  A --> A12
  A --> A13/**
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
  },
  {
    id: 'qwq_32b',
    name: 'QWQ 32B (Free)',
    endpoint: '/api/qwq-32b',
    description: 'ArliAI QWQ 32B ArliAI RPR V1 for advanced reasoning',
    enabled: true
  },
  {
    id: 'glm_z1_32b',
    name: 'GLM-Z1 32B (Free)',
    endpoint: '/api/glm-z1-32b',
    description: 'THUDM GLM-Z1 32B for complex analysis',
    enabled: true
  },
  {
    id: 'kimi_vl_a3b',
    name: 'Kimi VL A3B (Free)',
    endpoint: '/api/kimi-vl-a3b',
    description: 'Moonshot Kimi VL A3B Thinking for visual reasoning',
    enabled: true
  },
  {
    id: 'kimi_dev_72b',
    name: 'Kimi Dev 72B (Free)',
    endpoint: '/api/kimi-dev-72b',
    description: 'Moonshot Kimi Dev 72B for development tasks',
    enabled: true
  },
  {
    id: 'moonlight_16b',
    name: 'Moonlight 16B (Free)',
    endpoint: '/api/moonlight-16b',
    description: 'Moonshot Moonlight 16B A3B Instruct',
    enabled: true
  },
  {
    id: 'nemotron_super_49b',
    name: 'Nemotron Super 49B (Free)',
    endpoint: '/api/nemotron-super-49b',
    description: 'NVIDIA Llama 3.3 Nemotron Super 49B V1',
    enabled: true
  },
  {
    id: 'llama4_maverick',
    name: 'Llama 4 Maverick (Free)',
    endpoint: '/api/llama4-maverick',
    description: 'Meta Llama 4 Maverick for advanced reasoning',
    enabled: true
  },
  {
    id: 'llama4_scout',
    name: 'Llama 4 Scout (Free)',
    endpoint: '/api/llama4-scout',
    description: 'Meta Llama 4 Scout for general tasks',
    enabled: true
  },
  {
    id: 'qwerky_72b',
    name: 'Qwerky 72B (Free)',
    endpoint: '/api/qwerky-72b',
    description: 'Featherless Qwerky 72B for creative tasks',
    enabled: true
  },
  {
    id: 'reka_flash_3',
    name: 'Reka Flash 3 (Free)',
    endpoint: '/api/reka-flash-3',
    description: 'Reka AI Reka Flash 3 for fast responses',
    enabled: true
  },
  {
    id: 'dolphin_mistral_24b',
    name: 'Dolphin Mistral 24B (Free)',
    endpoint: '/api/dolphin-mistral-24b',
    description: 'Cognitive Computations Dolphin 3.0 R1 Mistral 24B',
    enabled: true
  },
  {
    id: 'llama32_vision',
    name: 'Llama 3.2 11B Vision (Free)',
    endpoint: '/api/llama32-vision',
    description: 'Meta Llama 3.2 11B Vision Instruct for image analysis',
    enabled: true
  },
  {
    id: 'qwen3_235b',
    name: 'Qwen 3 235B A22B (Free)',
    endpoint: '/api/qwen3-235b',
    description: 'Alibaba Qwen 3 235B A22B for advanced reasoning',
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
    id: 'reasoning',
    name: 'Reasoning',
    description: 'Complex problem solving and logical analysis'
  },
  {
    id: 'tools',
    name: 'Tools',
    description: 'Tool calling and function execution'
  },
  {
    id: 'quotes',
    name: 'Quotes',
    description: 'Service quotes and pricing estimates'
  },
  {
    id: 'photo_uploads',
    name: 'Photo Uploads',
    description: 'Photo analysis and upload handling'
  },
  {
    id: 'summaries',
    name: 'Summaries',
    description: 'Content summarization and key points'
  },
  {
    id: 'search',
    name: 'Search',
    description: 'Information search and retrieval'
  },
  {
    id: 'chat',
    name: 'Chat',
    description: 'General conversational interactions'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Data analysis and business insights'
  },
  {
    id: 'deep_analysis',
    name: 'Deep Analysis',
    description: 'Comprehensive and thorough analysis'
  },
  {
    id: 'multi_language',
    name: 'Multi-Language',
    description: 'Multilingual support and translation'
  },
  {
    id: 'safety',
    name: 'Safety',
    description: 'Security and safety-focused responses'
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Accessibility features and assistance'
  }
];

// Enhanced quote engine
class ChatQuoteEngine {
  constructor() {
    this.services = {
      'basic_wash': { 
        name: 'Basic Wash', 
        price: 25, 
        description: 'Exterior wash, wheels, and basic interior vacuum',
        duration: '30-45 minutes'
      },
      'premium_wash': { 
        name: 'Premium Wash', 
        price: 45, 
        description: 'Complete wash, wax, interior detail, tire shine',
        duration: '60-90 minutes'
      },
      'full_detail': { 
        name: 'Full Detail', 
        price: 150, 
        description: 'Complete interior/exterior detail, clay bar, polish',
        duration: '3-4 hours'
      },
      'ceramic_coating': { 
        name: 'Ceramic Coating', 
        price: 300, 
        description: 'Premium protection with 2-year ceramic coating',
        duration: '4-6 hours'
      },
      'paint_correction': {
        name: 'Paint Correction',
        price: 200,
        description: 'Remove swirls, scratches, and paint imperfections',
        duration: '4-5 hours'
      },
      'interior_detail': {
        name: 'Interior Detail',
        price: 75,
        description: 'Deep clean seats, carpets, dashboard, and all surfaces',
        duration: '2-3 hours'
      }
    };
    
    this.vehicleMultipliers = {
      'small': 1.0,    // Sedan, coupe
      'medium': 1.2,   // SUV, truck
      'large': 1.4,    // Large SUV, van
      'luxury': 1.3    // Luxury vehicles
    };
  }
  
  generateQuote(message, uploadedFiles = []) {
    const msgLower = message.toLowerCase();
    let recommendedServices = [];
    let vehicleType = this.detectVehicleType(msgLower);
    let multiplier = this.vehicleMultipliers[vehicleType] || 1.0;
    
    // Detect requested services
    Object.keys(this.services).forEach(serviceKey => {
      const service = this.services[serviceKey];
      if (this.serviceKeywordMatch(msgLower, serviceKey)) {
        recommendedServices.push({
          ...service,
          key: serviceKey,
          adjustedPrice: Math.round(service.price * multiplier)
        });
      }
    });
    
    // If no specific service detected, recommend based on keywords
    if (recommendedServices.length === 0) {
      if (msgLower.includes('quick') || msgLower.includes('basic') || msgLower.includes('cheap')) {
        recommendedServices.push({
          ...this.services.basic_wash,
          key: 'basic_wash',
          adjustedPrice: Math.round(this.services.basic_wash.price * multiplier)
        });
      } else if (msgLower.includes('premium') || msgLower.includes('complete') || msgLower.includes('everything')) {
        recommendedServices.push({
          ...this.services.full_detail,
          key: 'full_detail',
          adjustedPrice: Math.round(this.services.full_detail.price * multiplier)
        });
      } else {
        // Default recommendation
        recommendedServices.push({
          ...this.services.premium_wash,
          key: 'premium_wash',
          adjustedPrice: Math.round(this.services.premium_wash.price * multiplier)
        });
      }
    }
    
    // Generate quote response
    let quoteResponse = `🚗 **Quote for your ${vehicleType} vehicle:**\n\n`;
    
    recommendedServices.forEach(service => {
      quoteResponse += `**${service.name}** - $${service.adjustedPrice}\n`;
      quoteResponse += `${service.description}\n`;
      quoteResponse += `⏱️ Duration: ${service.duration}\n\n`;
    });
    
    if (uploadedFiles.length > 0) {
      quoteResponse += `📸 I see you've uploaded ${uploadedFiles.length} photo(s). This helps me provide a more accurate quote!\n\n`;
    }
    
    quoteResponse += `📞 **To book or get a detailed quote:** 562-228-9429\n`;
    quoteResponse += `🌐 **Online booking:** jaysmobilewash.com\n`;
    quoteResponse += `📍 **Service area:** Los Angeles, Orange County, Beverly Hills`;
    
    return quoteResponse;
  }
  
  serviceKeywordMatch(message, serviceKey) {
    const keywords = {
      'basic_wash': ['basic', 'wash', 'simple', 'quick', 'exterior'],
      'premium_wash': ['premium', 'complete wash', 'full wash', 'wax'],
      'full_detail': ['detail', 'complete detail', 'full detail', 'everything'],
      'ceramic_coating': ['ceramic', 'coating', 'protection', 'long term'],
      'paint_correction': ['paint correction', 'scratch', 'swirl', 'polish'],
      'interior_detail': ['interior', 'inside', 'seats', 'carpet', 'dashboard']
    };
    
    return keywords[serviceKey]?.some(keyword => message.includes(keyword)) || false;
  }
  
  detectVehicleType(message) {
    if (message.includes('sedan') || message.includes('coupe') || message.includes('small')) {
      return 'small';
    } else if (message.includes('suv') || message.includes('truck') || message.includes('pickup')) {
      return 'medium';
    } else if (message.includes('large') || message.includes('van') || message.includes('suburban')) {
      return 'large';
    } else if (message.includes('luxury') || message.includes('bmw') || message.includes('mercedes') || 
               message.includes('audi') || message.includes('lexus') || message.includes('tesla')) {
      return 'luxury';
    }
    return 'medium'; // Default assumption
  }
}

// Enhanced conversation memory
class ConversationMemory {
  constructor() {
    this.memories = this.loadMemories();
    this.maxMemories = 100; // Limit to prevent storage bloat
  }
  
  loadMemories() {
    try {
      const saved = localStorage.getItem('chatbot-conversation-memory');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load conversation memory:', error);
      return [];
    }
  }
  
  saveMemories() {
    try {
      // Keep only the most recent memories
      if (this.memories.length > this.maxMemories) {
        this.memories = this.memories.slice(-this.maxMemories);
      }
      localStorage.setItem('chatbot-conversation-memory', JSON.stringify(this.memories));
    } catch (error) {
      console.warn('Failed to save conversation memory:', error);
    }
  }
  
  recordConversation(message, response, metadata) {
    const memory = {
      message: message.toLowerCase().trim(),
      response: response,
      metadata: metadata,
      timestamp: Date.now(),
      useCount: 0
    };
    
    this.memories.push(memory);
    this.saveMemories();
  }
  
  getLearnedResponse(message) {
    const msgLower = message.toLowerCase().trim();
    
    // Look for exact or similar matches
    const match = this.memories.find(memory => {
      const similarity = this.calculateSimilarity(msgLower, memory.message);
      return similarity > 0.8; // 80% similarity threshold
    });
    
    if (match) {
      match.useCount++;
      this.saveMemories();
      return `💭 From memory: ${match.response}`;
    }
    
    return null;
  }
  
  calculateSimilarity(str1, str2) {
    // Simple similarity calculation
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }
  
  getMemoryStats() {
    return {
      totalMemories: this.memories.length,
      recentMemories: this.memories.filter(m => Date.now() - m.timestamp < 24 * 60 * 60 * 1000).length,
      mostUsed: this.memories.sort((a, b) => b.useCount - a.useCount).slice(0, 5)
    };
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
            <div class="role-indicator">
              Role: <span id="current-role">${this.currentRole}</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="settings-btn" id="settings-btn" title="Settings">⚙️</button>
            <button class="chatbot-close" id="chatbot-close">✕</button>
          </div>
        </div>
        
        <div class="role-selector" style="padding: 10px; border-bottom: 1px solid #eee;">
          <label for="role-select">Chat Mode:</label>
          <select id="role-select">
            ${CHAT_ROLES.map(role => `
              <option value="${role.id}" ${role.id === this.currentRole ? 'selected' : ''}>
                ${role.name}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="message bot-message">
            <div class="message-content">
              Hello! I'm Jay's AI Assistant. I can help with quotes, service information, and more.
            </div>
          </div>
        </div>
        
        <div class="chatbot-input-area">
          <div class="file-upload-section" style="margin-bottom: 5px;">
            <input type="file" id="file-upload" accept="image/*" multiple style="display: none;">
            <button class="file-upload-btn" id="file-upload-btn" title="Upload images for better quotes" style="margin-right: 5px;">📎</button>
            <div class="uploaded-files" id="uploaded-files" style="display: inline-block;"></div>
          </div>
          <input type="text" class="chatbot-input" id="chatbot-input" 
                 placeholder="Ask about our services, get quotes, or general questions...">
          <button class="chatbot-send" id="chatbot-send">Send</button>
        </div>
      </div>
    `;
    
    this.container.appendChild(widget);
    console.log('✅ Widget created and appended!');
    
    // Model dropdown
    const modelDropdown = document.createElement('select');
    modelDropdown.id = 'chatbot-model-select';
    modelDropdown.className = 'chatbot-model-select';
    API_OPTIONS.filter(opt => opt.enabled).forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.id;
      option.textContent = opt.name;
      modelDropdown.appendChild(option);
    });
    // Restore last selected model
    const savedModel = localStorage.getItem('chatbot-selected-model');
    if (savedModel && API_OPTIONS.some(opt => opt.id === savedModel)) {
      modelDropdown.value = savedModel;
      this.selectedModel = savedModel;
    }
    modelDropdown.addEventListener('change', (e) => {
      this.selectedModel = e.target.value;
      localStorage.setItem('chatbot-selected-model', this.selectedModel);
      this.addMessage(`Model set to: <b>${modelDropdown.options[modelDropdown.selectedIndex].text}</b>`, 'bot');
    });
    // Insert dropdown above input
    setTimeout(() => {
      const inputArea = this.container.querySelector('.chatbot-input-area');
      if (inputArea && !document.getElementById('chatbot-model-select')) {
        inputArea.parentNode.insertBefore(modelDropdown, inputArea);
      }
    }, 0);
  }
  
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const send = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const settingsBtn = document.getElementById('settings-btn');
    const roleSelect = document.getElementById('role-select');
    const fileUploadBtn = document.getElementById('file-upload-btn');
    const fileUpload = document.getElementById('file-upload');
    
    console.log('🔗 Elements found:', {
      toggle: !!toggle,
      close: !!close,
      send: !!send,
      input: !!input,
      settingsBtn: !!settingsBtn,
      roleSelect: !!roleSelect,
      fileUploadBtn: !!fileUploadBtn,
      fileUpload: !!fileUpload
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
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.toggleSettings());
    }
    
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => this.changeRole(e.target.value));
    }
    
    if (fileUploadBtn && fileUpload) {
      fileUploadBtn.addEventListener('click', () => fileUpload.click());
      fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
    }
    
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
      
      // Secret mode detection
      input.addEventListener('input', (e) => this.checkSecretModes(e.target.value));
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
    this.isProcessing = true;

    // Determine effective role
    let effectiveRole = this.currentRole;
    if (this.currentRole === 'auto') {
      effectiveRole = this.detectBestRole(message);
      console.log(`🎯 Auto mode detected best role: ${effectiveRole} for message: "${message.substring(0, 50)}..."`);
    }

    // Find selected model's endpoint
    const selectedModelId = this.selectedModel || 'auto';
    const selectedModel = API_OPTIONS.find(opt => opt.id === selectedModelId && opt.enabled);
    const endpoint = selectedModel ? selectedModel.endpoint : '/api/auto';
    
    console.log('🎯 Using endpoint:', endpoint, 'for model:', selectedModelId, 'with role:', effectiveRole);

    // Prepare request body
    const requestBody = {
      prompt: message,  // Use 'prompt' for auto mode compatibility
      message: message, // Keep 'message' for other endpoints
      role: effectiveRole,
      hasFiles: this.uploadedFiles.length > 0,
      adminMode: this.adminMode,
      jayMode: this.jayMode
    };

    // Add file information if present
    if (this.uploadedFiles.length > 0) {
      requestBody.fileInfo = this.uploadedFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }));
      // Add messages array for auto mode vision detection
      requestBody.messages = [{
        type: 'image',
        attachments: this.uploadedFiles.map(f => ({ type: f.type, name: f.name }))
      }];
    }

    // Show loading message
    const loadingMsg = this.addMessage('🤔 Thinking...', 'bot');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
      .then(res => res.json())
      .then(data => {
        // Remove loading message
        if (loadingMsg && loadingMsg.parentNode) {
          loadingMsg.parentNode.removeChild(loadingMsg);
        }

        // Display AI response
        let aiText = data.content || data.generated_text || data.response || JSON.stringify(data, null, 2);
        aiText = this.sanitizeBotResponse(aiText);
        
        // Add auto mode info if present
        if (data.autoMode && selectedModelId === 'auto') {
          const autoInfo = `🤖 *Auto Mode: Selected ${data.autoMode.selectedModel} (${data.autoMode.reason})*\n\n`;
          aiText = autoInfo + aiText;
        }
        
        // Add special mode prefixes
        if (this.jayMode) {
          aiText = `🌟 **Jay:** ${aiText}`;
        } else if (this.adminMode) {
          aiText = `🔓 **Admin:** ${aiText}`;
        }
        
        this.addMessage(aiText, 'bot');
        
        // Record conversation
        this.memory.recordConversation(message, aiText, {
          model: selectedModelId,
          endpoint: endpoint,
          role: effectiveRole,
          hasFiles: this.uploadedFiles.length > 0,
          adminMode: this.adminMode,
          jayMode: this.jayMode,
          autoMode: data.autoMode || null,
          actualModel: data.autoMode ? data.autoMode.selectedModel : selectedModelId,
          timestamp: Date.now()
        });
        
        // Clear uploaded files after successful processing
        this.clearUploadedFiles();
        
        this.isProcessing = false;
      })
      .catch(err => {
        // Remove loading message
        if (loadingMsg && loadingMsg.parentNode) {
          loadingMsg.parentNode.removeChild(loadingMsg);
        }
        
        console.error('AI API error:', err);
        
        // Provide user-friendly error messages
        let errorMessage;
        if (err.message.includes('Network error') || err.message.includes('fetch')) {
          errorMessage = "🔌 I'm having trouble connecting to my AI services right now. Please try again in a moment, or call us at 562-228-9429 for immediate assistance.";
        } else if (err.message.includes('405') || err.message.includes('Method not allowed')) {
          errorMessage = "⚙️ I'm experiencing a temporary technical issue. For immediate help, please call 562-228-9429.";
        } else {
          errorMessage = "🤖 I'm experiencing a temporary glitch. For immediate assistance, please call 562-228-9429.";
        }
        
        this.addMessage(errorMessage, 'bot');
        this.isProcessing = false;
      });
  }
  
  addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv; // Return for later removal/manipulation
  }
  
  sanitizeBotResponse(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Clean up common AI response artifacts
    let cleaned = text
      .replace(/\\n|\n/g, ' ') // Remove line breaks
      .replace(/\\r|\r/g, ' ') // Remove carriage returns
      .replace(/\\t|\t/g, ' ') // Remove tabs
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .replace(/\*\*|__/g, '') // Remove markdown bold
      .replace(/\*|_/g, '') // Remove stray markdown
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
      .replace(/`/g, '') // Remove backticks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .trim();
    
    // Limit length to prevent overly long responses
    if (cleaned.length > 2000) {
      cleaned = cleaned.substring(0, 2000) + '...';
    }
    
    return cleaned;
  }
  
  changeRole(newRole) {
    this.currentRole = newRole;
    const roleIndicator = document.getElementById('current-role');
    if (roleIndicator) {
      roleIndicator.textContent = newRole;
    }
    
    // Update placeholder based on role
    const input = document.getElementById('chatbot-input');
    if (input) {
      const rolePlaceholders = {
        auto: 'Ask me anything - I\'ll automatically choose the best way to help you...',
        quotes: 'Describe your vehicle and service needs for a quote...',
        search: 'What information are you looking for?',
        reasoning: 'Ask me to analyze or reason through something...',
        summaries: 'What would you like me to summarize?',
        chat: 'Ask about our services or chat with me...',
        photo_uploads: 'Upload photos and ask about your vehicle...'
      };
      
      input.placeholder = rolePlaceholders[newRole] || 'How can I help you?';
    }
    
    this.addMessage(`🎭 Chat mode changed to: <b>${CHAT_ROLES.find(r => r.id === newRole)?.name || newRole}</b>`, 'bot');
  }
  
  toggleSettings() {
    // Simple settings toggle - could expand this later
    this.addMessage('⚙️ Settings panel coming soon! For now, use the model dropdown and role selector above.', 'bot');
  }
  
  handleFileUpload(event) {
    const files = Array.from(event.target.files);
    const uploadedFilesDiv = document.getElementById('uploaded-files');
    
    files.forEach(file => {
      if (this.validateFile(file)) {
        this.uploadedFiles.push({
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          timestamp: Date.now()
        });
        
        // Display uploaded file
        const fileSpan = document.createElement('span');
        fileSpan.textContent = `📎 ${file.name}`;
        fileSpan.style.cssText = 'margin-right: 5px; padding: 2px 5px; background: #e0e0e0; border-radius: 3px; font-size: 12px;';
        uploadedFilesDiv.appendChild(fileSpan);
        
        this.addMessage(`📎 File uploaded: <b>${file.name}</b> (${(file.size / 1024).toFixed(1)}KB)`, 'bot');
      }
    });
    
    // Clear the input
    event.target.value = '';
  }
  
  validateFile(file) {
    if (!this.allowedFileTypes.includes(file.type)) {
      this.addMessage(`❌ File type not supported: ${file.type}. Please upload images only.`, 'bot');
      return false;
    }
    
    if (file.size > this.maxFileSize) {
      this.addMessage(`❌ File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is ${this.maxFileSize / 1024 / 1024}MB.`, 'bot');
      return false;
    }
    
    return true;
  }
  
  checkSecretModes(inputValue) {
    const value = inputValue.toLowerCase().trim();
    
    // Admin mode trigger
    if (value === 'josh' && !this.adminMode) {
      this.activateAdminMode();
    }
    
    // Jay mode trigger
    if (value === 'jay' && !this.jayMode) {
      this.activateJayMode();
    }
    
    // Deactivate modes
    if (value === 'normal' && (this.adminMode || this.jayMode)) {
      this.deactivateSpecialModes();
    }
  }
  
  activateAdminMode() {
    this.adminMode = true;
    this.addMessage('🔓 <b>Admin Mode Activated!</b> You now have access to advanced features and settings.', 'bot');
    const toggle = document.getElementById('chatbot-toggle');
    if (toggle) {
      toggle.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
    }
  }
  
  activateJayMode() {
    this.jayMode = true;
    this.addMessage('🌟 <b>Jay Mode Activated!</b> Hey there! This is Jay personally assisting you. What can I help you with today?', 'bot');
    const toggle = document.getElementById('chatbot-toggle');
    if (toggle) {
      toggle.style.background = 'linear-gradient(45deg, #ffd700, #ff8c00)';
      toggle.classList.add('jay-mode-pulse');
    }
  }
  
  deactivateSpecialModes() {
    this.adminMode = false;
    this.jayMode = false;
    this.addMessage('🔄 <b>Normal Mode Restored.</b> Back to standard AI assistant functionality.', 'bot');
    const toggle = document.getElementById('chatbot-toggle');
    if (toggle) {
      toggle.style.background = '';
      toggle.classList.remove('jay-mode-pulse');
    }
  }
  
  clearUploadedFiles() {
    this.uploadedFiles = [];
    const uploadedFilesDiv = document.getElementById('uploaded-files');
    if (uploadedFilesDiv) {
      uploadedFilesDiv.innerHTML = '';
    }
  }
  
  detectBestRole(message) {
    const msgLower = message.toLowerCase();
    
    // Quote-related keywords
    if (msgLower.includes('quote') || msgLower.includes('price') || msgLower.includes('cost') || 
        msgLower.includes('how much') || msgLower.includes('estimate') || msgLower.includes('pricing')) {
      return 'quotes';
    }
    
    // Search-related keywords
    if (msgLower.includes('find') || msgLower.includes('search') || msgLower.includes('where') || 
        msgLower.includes('when') || msgLower.includes('location') || msgLower.includes('hours')) {
      return 'search';
    }
    
    // Summary-related keywords
    if (msgLower.includes('summarize') || msgLower.includes('summary') || msgLower.includes('explain') || 
        msgLower.includes('tell me about') || msgLower.includes('what is')) {
      return 'summaries';
    }
    
    // Reasoning-related keywords
    if (msgLower.includes('why') || msgLower.includes('how') || msgLower.includes('analyze') || 
        msgLower.includes('compare') || msgLower.includes('recommend') || msgLower.includes('best')) {
      return 'reasoning';
    }
    
    // Photo upload context
    if (this.uploadedFiles.length > 0) {
      return 'photo_uploads';
    }
    
    // Default to chat for conversational messages
    return 'chat';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🤖 DOM loaded, initializing chatbot...');
  if (typeof window !== 'undefined') {
    window.AdvancedChatBot = AdvancedChatBot;
  }
});
