/**
 * Advanced Chatbot - Vanilla JS Implementation
 * Provides all the advanced features of the React ChatBotModule system
 * without requiring React compilation or ES6 module resolution
 */

// Import constants and utilities (we'll inline them to avoid module issues)
const API_OPTIONS = [
  {
    id: 'none',
    name: 'None',
    endpoint: '/api/none',
    description: 'No AI service (disabled)',
    enabled: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    endpoint: '/api/anthropic',
    description: 'Claude AI for detailed analysis',
    enabled: false
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    endpoint: '/api/openai',
    description: 'OpenAI GPT models',
    enabled: false
  },
  {
    id: 'google',
    name: 'Google Gemini',
    endpoint: '/api/google',
    description: 'Google Gemini AI',
    enabled: false
  },
  {
    id: 'cohere',
    name: 'Cohere',
    endpoint: '/api/cohere',
    description: 'Cohere AI for enterprise',
    enabled: false
  },
  {
    id: 'replicate',
    name: 'Replicate',
    endpoint: '/api/replicate',
    description: 'Replicate AI models',
    enabled: false
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    endpoint: '/api/perplexity',
    description: 'Perplexity search-augmented AI',
    enabled: false
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    endpoint: '/api/mistral',
    description: 'Mistral AI models',
    enabled: false
  },
  {
    id: 'together',
    name: 'Together AI',
    endpoint: '/api/together',
    description: 'Together AI platform',
    enabled: false
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    endpoint: '/api/deepseek',
    description: 'DeepSeek AI models',
    enabled: true
  }
];

const CHAT_ROLES = [
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
    id: 'fallback',
    name: 'Fallback',
    description: 'Default handler when other APIs fail'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Data analysis and reporting'
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Accessibility features and assistance'
  }
];

const DEFAULT_ROLE_ASSIGNMENTS = {
  reasoning: 'none',
  tools: 'none',
  quotes: 'none',
  photo_uploads: 'none',
  summaries: 'none',
  search: 'none',
  chat: 'none',
  fallback: 'none',
  analytics: 'none',
  accessibility: 'none'
};

/**
 * AI Utility Functions
 */
class AIUtils {
  static async queryAI(prompt, options = {}) {
    const { endpoint = '/api/ai' } = options;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to AI service');
      }
      throw error;
    }
  }

  static async isAIServiceAvailable(endpoint = '/api/ai') {
    try {
      await this.queryAI('test', { endpoint });
      return true;
    } catch (error) {
      console.warn('AI service availability check failed:', error.message);
      return false;
    }
  }

  static sanitizePrompt(input) {
    if (!input || typeof input !== 'string') {
      return '';
    }
    return input.trim().substring(0, 1000);
  }
}

/**
 * Chat Router Functions
 */
class ChatRouter {
  static async routeLLMRequest(prompt, role, assignments = DEFAULT_ROLE_ASSIGNMENTS, options = {}) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }
    
    if (!role || typeof role !== 'string') {
      throw new Error('Role is required and must be a string');
    }
    
    const assignedAPIId = assignments[role];
    if (!assignedAPIId) {
      throw new Error(`No API assigned for role: ${role}`);
    }
    
    const assignedAPI = this.getAPIById(assignedAPIId);
    if (!assignedAPI) {
      throw new Error(`Unknown API: ${assignedAPIId}`);
    }
    
    if (!assignedAPI.enabled) {
      const fallbackAPIId = assignments.fallback || 'none';
      const fallbackAPI = this.getAPIById(fallbackAPIId);
      
      if (!fallbackAPI || !fallbackAPI.enabled) {
        throw new Error(`Assigned API '${assignedAPI.name}' is disabled and no valid fallback available`);
      }
      
      console.warn(`API '${assignedAPI.name}' is disabled, falling back to '${fallbackAPI.name}'`);
      return await this.executeAPICall(prompt, fallbackAPI, role, options);
    }
    
    try {
      return await this.executeAPICall(prompt, assignedAPI, role, options);
    } catch (error) {
      const fallbackAPIId = assignments.fallback;
      if (fallbackAPIId && fallbackAPIId !== assignedAPIId) {
        const fallbackAPI = this.getAPIById(fallbackAPIId);
        
        if (fallbackAPI && fallbackAPI.enabled) {
          console.warn(`Primary API '${assignedAPI.name}' failed, trying fallback '${fallbackAPI.name}':`, error.message);
          try {
            return await this.executeAPICall(prompt, fallbackAPI, role, options);
          } catch (fallbackError) {
            console.error(`Fallback API '${fallbackAPI.name}' also failed:`, fallbackError.message);
            throw new Error(`Both primary API '${assignedAPI.name}' and fallback '${fallbackAPI.name}' failed`);
          }
        }
      }
      
      throw error;
    }
  }

  static async executeAPICall(prompt, api, role, options = {}) {
    const enhancedPrompt = this.enhancePromptForRole(prompt, role);
    
    const apiOptions = {
      endpoint: api.endpoint,
      ...options
    };
    
    if (api.id === 'none') {
      return {
        content: "AI services are currently disabled. Please contact support for assistance.",
        role: "assistant"
      };
    }
    
    if (api.id === 'deepseek') {
      return await AIUtils.queryAI(enhancedPrompt, apiOptions);
    } else {
      const deepseekAPI = this.getAPIById('deepseek');
      if (deepseekAPI && deepseekAPI.enabled) {
        console.warn(`API '${api.name}' not yet implemented, using DeepSeek fallback`);
        return await AIUtils.queryAI(enhancedPrompt, { endpoint: '/api/deepseek' });
      } else {
        throw new Error(`API '${api.name}' not implemented and no fallback available`);
      }
    }
  }

  static enhancePromptForRole(prompt, role) {
    const roleEnhancements = {
      reasoning: "Please analyze this logically and provide step-by-step reasoning: ",
      tools: "Consider what tools or actions might be needed for: ",
      quotes: "Provide a detailed service quote or pricing estimate for: ",
      photo_uploads: "Analyze this image or photo-related request: ",
      summaries: "Please summarize the key points of: ",
      search: "Search for information and provide relevant details about: ",
      chat: "Have a natural conversation about: ",
      fallback: "Please help with: ",
      analytics: "Analyze the data and provide insights about: ",
      accessibility: "Provide accessible information and assistance for: "
    };
    
    const enhancement = roleEnhancements[role] || roleEnhancements.chat;
    return enhancement + prompt;
  }

  static getAPIById(id) {
    return API_OPTIONS.find(api => api.id === id);
  }

  static getRoleById(id) {
    return CHAT_ROLES.find(role => role.id === id);
  }
}

/**
 * Settings Panel Component
 */
class ChatSettingsPanel {
  constructor(container, assignments, onAssignmentsChange) {
    this.container = container;
    this.assignments = assignments;
    this.onAssignmentsChange = onAssignmentsChange;
    this.isOpen = false;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-settings-panel" style="display: none;">
        <div class="settings-header">
          <h3>API Settings</h3>
          <button class="settings-close" id="settings-close">✕</button>
        </div>
        <div class="settings-content">
          <p>Configure which AI API to use for each chat role:</p>
          <div class="role-assignments" id="role-assignments">
            ${this.renderRoleAssignments()}
          </div>
          <div class="settings-actions">
            <button class="btn-primary" id="save-settings">Save Settings</button>
            <button class="btn-secondary" id="reset-settings">Reset to Default</button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  renderRoleAssignments() {
    return CHAT_ROLES.map(role => {
      const currentAssignment = this.assignments[role.id] || 'none';
      return `
        <div class="role-assignment">
          <label for="role-${role.id}">
            <strong>${role.name}</strong>
            <span class="role-description">${role.description}</span>
          </label>
          <select id="role-${role.id}" data-role="${role.id}">
            ${API_OPTIONS.map(api => `
              <option value="${api.id}" ${api.id === currentAssignment ? 'selected' : ''}>
                ${api.name} ${api.enabled ? '' : '(Disabled)'}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    }).join('');
  }

  setupEventListeners() {
    const closeBtn = this.container.querySelector('#settings-close');
    const saveBtn = this.container.querySelector('#save-settings');
    const resetBtn = this.container.querySelector('#reset-settings');

    closeBtn.addEventListener('click', () => this.hide());
    saveBtn.addEventListener('click', () => this.saveSettings());
    resetBtn.addEventListener('click', () => this.resetSettings());
  }

  show() {
    this.container.querySelector('.chat-settings-panel').style.display = 'block';
    this.isOpen = true;
  }

  hide() {
    this.container.querySelector('.chat-settings-panel').style.display = 'none';
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  saveSettings() {
    const newAssignments = {};
    const selects = this.container.querySelectorAll('select[data-role]');
    
    selects.forEach(select => {
      const role = select.dataset.role;
      const apiId = select.value;
      newAssignments[role] = apiId;
    });

    this.assignments = newAssignments;
    this.onAssignmentsChange(newAssignments);
    this.hide();
  }

  resetSettings() {
    this.assignments = { ...DEFAULT_ROLE_ASSIGNMENTS };
    this.render();
    this.onAssignmentsChange(this.assignments);
  }
}

/**
 * Quote Engine Component
 */
class ChatQuoteEngine {
  constructor() {
    this.isGenerating = false;
    this.quote = null;
    this.error = null;
    this.formData = {
      serviceType: '',
      vehicleSize: '',
      condition: '',
      location: '',
      additionalServices: []
    };
  }

  async generateQuote(assignments = DEFAULT_ROLE_ASSIGNMENTS) {
    if (!this.formData.serviceType || !this.formData.vehicleSize) {
      throw new Error('Please select service type and vehicle size');
    }

    this.isGenerating = true;
    this.error = null;

    try {
      const prompt = this.buildQuotePrompt();
      const response = await ChatRouter.routeLLMRequest(prompt, 'quotes', assignments);
      
      this.quote = {
        services: this.formData,
        response: response.content || response.generated_text || JSON.stringify(response),
        timestamp: new Date().toISOString()
      };

      return this.quote;
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  buildQuotePrompt() {
    const { serviceType, vehicleSize, condition, location, additionalServices } = this.formData;
    
    return `Generate a detailed quote for Jay's Mobile Wash service:
      Service Type: ${serviceType}
      Vehicle Size: ${vehicleSize}
      Condition: ${condition}
      Location: ${location}
      Additional Services: ${additionalServices.join(', ') || 'None'}
      
      Please provide a professional quote with pricing breakdown and service details.`;
  }

  updateFormData(field, value) {
    this.formData[field] = value;
  }

  toggleAdditionalService(service) {
    const services = this.formData.additionalServices;
    if (services.includes(service)) {
      this.formData.additionalServices = services.filter(s => s !== service);
    } else {
      this.formData.additionalServices.push(service);
    }
  }
}

/**
 * Main Advanced ChatBot Component
 */
class AdvancedChatBot {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isOpen = false;
    this.isProcessing = false;
    this.settingsOpen = false;
    this.messages = [];
    this.assignments = { ...DEFAULT_ROLE_ASSIGNMENTS };
    this.currentRole = 'chat';
    this.settingsPanel = null;
    this.quoteEngine = new ChatQuoteEngine();
    
    this.loadAssignments();
    this.init();
  }

  loadAssignments() {
    try {
      const saved = localStorage.getItem('chatbot-role-assignments');
      if (saved) {
        this.assignments = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load saved assignments:', error);
    }
  }

  saveAssignments() {
    try {
      localStorage.setItem('chatbot-role-assignments', JSON.stringify(this.assignments));
    } catch (error) {
      console.warn('Failed to save assignments:', error);
    }
  }

  init() {
    this.createChatWidget();
    this.setupEventListeners();
    this.sendAnalyticsEvent('chat_initialized');
  }

  createChatWidget() {
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
              Role: <span id="current-role">${this.currentRole}</span> → 
              <span id="current-api">${this.assignments[this.currentRole] || 'none'}</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="settings-btn" id="settings-btn" title="Settings">⚙️</button>
            <button class="chatbot-close" id="chatbot-close">✕</button>
          </div>
        </div>
        
        <div class="role-selector">
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
              Choose a chat mode above and ask me anything!
            </div>
          </div>
        </div>

        <div class="processing-overlay" id="processing-overlay" style="display: none;">
          <div class="processing-message">
            Processing with <span id="processing-api">AI</span>...
          </div>
        </div>

        <div class="chatbot-input-area">
          <input type="text" class="chatbot-input" id="chatbot-input" 
                 placeholder="Ask about our services, get quotes, or general questions...">
          <button class="chatbot-send" id="chatbot-send">Send</button>
        </div>
      </div>

      <div class="settings-container" id="settings-container"></div>
    `;
    
    this.container.appendChild(widget);
    
    // Initialize settings panel
    const settingsContainer = document.getElementById('settings-container');
    this.settingsPanel = new ChatSettingsPanel(
      settingsContainer, 
      this.assignments, 
      (newAssignments) => this.handleAssignmentsChange(newAssignments)
    );
  }

  setupEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const send = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const settingsBtn = document.getElementById('settings-btn');
    const roleSelect = document.getElementById('role-select');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.closeChat());
    send.addEventListener('click', () => this.sendMessage());
    settingsBtn.addEventListener('click', () => this.toggleSettings());
    roleSelect.addEventListener('change', (e) => this.changeRole(e.target.value));
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  toggleChat() {
    const window = document.getElementById('chatbot-window');
    if (this.isOpen) {
      window.style.display = 'none';
      this.isOpen = false;
    } else {
      window.style.display = 'block';
      this.isOpen = true;
      document.getElementById('chatbot-input').focus();
    }
    
    this.sendAnalyticsEvent('chat_toggled', { opened: this.isOpen });
  }

  closeChat() {
    document.getElementById('chatbot-window').style.display = 'none';
    this.isOpen = false;
    this.sendAnalyticsEvent('chat_closed');
  }

  toggleSettings() {
    this.settingsPanel.toggle();
    this.sendAnalyticsEvent('settings_toggled', { opened: this.settingsPanel.isOpen });
  }

  changeRole(newRole) {
    this.currentRole = newRole;
    document.getElementById('current-role').textContent = newRole;
    document.getElementById('current-api').textContent = this.assignments[newRole] || 'none';
    
    // Update placeholder based on role
    const input = document.getElementById('chatbot-input');
    const rolePlaceholders = {
      quotes: 'Describe your vehicle and service needs for a quote...',
      search: 'What information are you looking for?',
      reasoning: 'Ask me to analyze or reason through something...',
      summaries: 'What would you like me to summarize?',
      chat: 'Ask about our services or chat with me...'
    };
    
    input.placeholder = rolePlaceholders[newRole] || 'How can I help you?';
    this.sendAnalyticsEvent('role_changed', { role: newRole });
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message || this.isProcessing) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    
    this.isProcessing = true;
    this.showProcessing();
    
    try {
      // Check if AI is available, otherwise fall back to smart responses
      const assignedAPI = this.assignments[this.currentRole];
      let response;
      
      if (assignedAPI === 'none' || !assignedAPI) {
        // Use intelligent fallback responses
        response = { content: this.generateSmartResponse(message, this.currentRole) };
      } else {
        // Try AI first
        try {
          response = await ChatRouter.routeLLMRequest(message, this.currentRole, this.assignments);
        } catch (aiError) {
          console.warn('AI failed, using smart fallback:', aiError);
          response = { content: this.generateSmartResponse(message, this.currentRole) };
        }
      }
      
      const responseText = response.content || response.generated_text || JSON.stringify(response, null, 2);
      this.addMessage(responseText, 'bot');
      
      this.sendAnalyticsEvent('chat_query_success', {
        role: this.currentRole,
        api: this.assignments[this.currentRole]
      });
    } catch (error) {
      console.error('Chat error:', error);
      // Final fallback to basic response
      const fallbackResponse = this.generateSmartResponse(message, this.currentRole);
      this.addMessage(fallbackResponse, 'bot');
      
      this.sendAnalyticsEvent('chat_query_error', {
        role: this.currentRole,
        error: error.message
      });
    } finally {
      this.isProcessing = false;
      this.hideProcessing();
    }
  }

  generateSmartResponse(message, role) {
    const lowerMessage = message.toLowerCase();
    
    // Role-specific responses
    if (role === 'quotes') {
      return this.generateQuoteResponse(lowerMessage);
    } else if (role === 'search') {
      return this.generateSearchResponse(lowerMessage);
    } else if (role === 'reasoning') {
      return this.generateReasoningResponse(lowerMessage);
    } else if (role === 'summaries') {
      return this.generateSummaryResponse(lowerMessage);
    }
    
    // General chat responses
    const responses = {
      'hello': 'Hello! I\'m Jay\'s AI Assistant. I can help with quotes, service information, and more. What can I do for you?',
      'hi': 'Hi there! How can I assist you with Jay\'s Mobile Wash services today?',
      'price': 'Our services range from $70 for Mini Detail to $800 for Graphene Coating. Would you like a detailed quote for your specific needs?',
      'pricing': 'Our pricing varies by service: Mini Detail ($70), Luxury Detail ($130), Max Detail ($200), Ceramic Coating ($450), Graphene Coating ($800). What service interests you?',
      'book': 'Great! To book our services, please call (562) 228-9429 or visit our website. What type of service would you like to schedule?',
      'booking': 'I\'d be happy to help you book! Call us at (562) 228-9429 and mention what service you need. We serve all of LA and Orange County.',
      'contact': 'You can reach Jay\'s Mobile Wash at (562) 228-9429 or email info@jaysmobilewash.net. We provide mobile service throughout Los Angeles and Orange County.',
      'location': 'We provide mobile detailing throughout Los Angeles County and Orange County. We come directly to your location for convenience!',
      'service': 'We offer comprehensive mobile detailing ($70-$200), professional Ceramic Coating ($450), and premium Graphene Coating ($800). Which service interests you most?',
      'services': 'Our main services include: Mobile Detailing (Mini $70, Luxury $130, Max $200), Ceramic Coating ($450), and Graphene Coating ($800). What would you like to know more about?',
      'ceramic': 'Our Ceramic Coating service is $450 and includes professional paint correction with a 2-year warranty. It provides excellent protection and shine. Would you like to schedule this service?',
      'detailing': 'We have three mobile detailing packages: Mini Detail ($70) - basic wash and interior; Luxury Detail ($130) - comprehensive cleaning; Max Detail ($200) - premium full service. Which fits your needs?',
      'how': 'I can help you with service information, pricing, booking details, and answer questions about our mobile detailing process. What specifically would you like to know?',
      'what': 'Jay\'s Mobile Wash offers premium mobile car detailing and ceramic coating services. We come to your location in LA and Orange County. What service are you interested in?'
    };

    // Find matching response
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Default intelligent response
    if (lowerMessage.includes('?')) {
      return 'That\'s a great question! For detailed information about our services, pricing, or scheduling, please call us at (562) 228-9429. Our team can provide personalized assistance for your mobile detailing needs.';
    }

    return 'Thanks for your message! I\'m here to help with Jay\'s Mobile Wash services. For immediate assistance, call (562) 228-9429. What specific service can I help you learn about?';
  }

  generateQuoteResponse(message) {
    if (message.includes('sedan') || message.includes('car')) {
      return 'For a sedan, our pricing typically ranges from $70 (Mini Detail) to $200 (Max Detail). Add Ceramic Coating for $450 or Graphene for $800. Call (562) 228-9429 for an exact quote based on your vehicle\'s condition and location.';
    } else if (message.includes('suv') || message.includes('truck')) {
      return 'SUVs and trucks start at $90 for Mini Detail, $150 for Luxury, and $250 for Max Detail. Ceramic Coating is $500, Graphene is $850. Call (562) 228-9429 for precise pricing based on size and condition.';
    }
    
    return 'I\'d be happy to provide a quote! Our services range from $70-$800 depending on vehicle size and service level. For an accurate quote, please call (562) 228-9429 and describe your vehicle and desired services.'; 
  }

  generateSearchResponse(message) {
    if (message.includes('location') || message.includes('area')) {
      return 'We serve all of Los Angeles County and Orange County, including Beverly Hills, Santa Monica, Long Beach, Newport Beach, Irvine, and surrounding areas. We come to your location!';
    } else if (message.includes('hours') || message.includes('time')) {
      return 'We operate Monday-Friday 8AM-6PM and weekends 9AM-5PM. We schedule appointments at your convenience within our service areas.';
    }
    
    return 'I can help you find information about our services, coverage areas, pricing, or scheduling. What specific information are you looking for?';
  }

  generateReasoningResponse(message) {
    return 'Let me analyze that for you: Based on the information provided, I recommend considering your vehicle\'s condition, usage patterns, and protection goals. For detailed analysis and recommendations, our specialists at (562) 228-9429 can provide personalized advice.';
  }

  generateSummaryResponse(message) {
    return 'Here\'s a summary: Jay\'s Mobile Wash offers three main categories: Mobile Detailing ($70-$200), Ceramic Coating ($450), and Graphene Coating ($800). We serve LA/OC areas with mobile convenience. Call (562) 228-9429 for service details.';
  }

  addMessage(content, sender, type = 'normal') {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message ${type === 'error' ? 'error-message' : ''}`;
    messageDiv.innerHTML = `
      <div class="message-content">${content}</div>
      <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showProcessing() {
    const overlay = document.getElementById('processing-overlay');
    const apiSpan = document.getElementById('processing-api');
    apiSpan.textContent = this.assignments[this.currentRole] || 'AI';
    overlay.style.display = 'flex';
  }

  hideProcessing() {
    document.getElementById('processing-overlay').style.display = 'none';
  }

  handleAssignmentsChange(newAssignments) {
    this.assignments = newAssignments;
    this.saveAssignments();
    
    // Update current API display
    document.getElementById('current-api').textContent = this.assignments[this.currentRole] || 'none';
    
    this.sendAnalyticsEvent('assignments_updated', {
      assignments: Object.keys(newAssignments).length
    });
  }

  sendAnalyticsEvent(eventName, data = {}) {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'advanced_chat',
          ...data
        });
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }
}

// Initialize the advanced chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🤖 Initializing Advanced AI Chatbot...');
  new AdvancedChatBot('chatbot-container');
});