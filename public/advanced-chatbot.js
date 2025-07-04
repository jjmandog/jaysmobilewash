/**
 * Advanced Chatbot - Vanilla JS Implementation
 * Provides all the advanced features of the React ChatBotModule system
 * without requiring React compilation or ES6 module resolution
 * 
 * Features:
 * - Comprehensive car detailing knowledge base
 * - Self-learning conversation memory
 * - File upload for training and quotes
 * - Secret admin mode ("josh" trigger)
 * - Enhanced Jay mode with animations
 * - Image analysis and upselling suggestions
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
    id: 'deepseek',
    name: 'DeepSeek',
    endpoint: '/api/openrouter',
    description: 'DeepSeek AI models via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'google',
    name: 'Google Gemini',
    endpoint: '/api/openrouter',
    description: 'Google Gemini (free via OpenRouter)',
    enabled: true
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    endpoint: '/api/openrouter',
    description: 'Mistral AI (free via OpenRouter)',
    enabled: true
  },
  {
    id: 'llama',
    name: 'Llama 3',
    endpoint: '/api/openrouter',
    description: 'Meta Llama 3 (free via OpenRouter)',
    enabled: true
  },
  // All other paid or disabled APIs remain disabled
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    endpoint: '/api/anthropic',
    description: 'Claude AI (disabled)',
    enabled: false
  },
  {
    id: 'cohere',
    name: 'Cohere',
    endpoint: '/api/cohere',
    description: 'Cohere AI (disabled)',
    enabled: false
  },
  {
    id: 'replicate',
    name: 'Replicate',
    endpoint: '/api/replicate',
    description: 'Replicate AI models (disabled)',
    enabled: false
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    endpoint: '/api/perplexity',
    description: 'Perplexity AI (disabled)',
    enabled: false
  },
  {
    id: 'together',
    name: 'Together AI',
    endpoint: '/api/together',
    description: 'Together AI platform (disabled)',
    enabled: false
  }
];

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

// Comprehensive Car Detailing Knowledge Base
const CAR_DETAILING_KNOWLEDGE_BASE = {
  // Service Categories
  services: {
    washing: {
      basic_wash: {
        description: "Basic exterior wash with soap and water",
        process: ["Pre-rinse", "Two-bucket wash method", "Rinse", "Dry with microfiber"],
        price_range: "$20-40",
        time: "30-45 minutes",
        benefits: ["Removes surface dirt", "Maintains paint health", "Prevents contamination buildup"]
      },
      detailed_wash: {
        description: "Comprehensive wash including wheels and trim",
        process: ["Pre-rinse", "Wheel cleaning", "Paint decontamination", "Two-bucket wash", "Clay bar treatment", "Rinse and dry"],
        price_range: "$50-80",
        time: "60-90 minutes",
        benefits: ["Deep cleaning", "Removes bonded contaminants", "Prepares for protection"]
      }
    },
    detailing: {
      mini_detail: {
        description: "Basic interior and exterior cleaning",
        includes: ["Exterior wash", "Interior vacuum", "Dashboard wipe", "Window cleaning"],
        price: "$70",
        time: "1-1.5 hours",
        best_for: "Regular maintenance, light contamination"
      },
      luxury_detail: {
        description: "Comprehensive interior and exterior detailing",
        includes: ["Premium wash", "Clay bar", "Interior deep clean", "Leather conditioning", "Tire shine", "Window treatment"],
        price: "$130",
        time: "2-3 hours",
        best_for: "Monthly maintenance, moderate contamination"
      },
      max_detail: {
        description: "Premium full-service detailing",
        includes: ["Complete wash", "Paint decontamination", "Interior extraction", "Leather treatment", "Engine bay cleaning", "Tire/wheel detail"],
        price: "$200",
        time: "3-4 hours",
        best_for: "Deep cleaning, heavily soiled vehicles"
      }
    },
    protection: {
      ceramic_coating: {
        description: "Professional nano-ceramic paint protection",
        benefits: ["2+ year protection", "Hydrophobic properties", "UV resistance", "Enhanced gloss", "Easier maintenance"],
        process: ["Paint correction", "Surface preparation", "Coating application", "Curing time"],
        price: "$450",
        durability: "2-3 years",
        maintenance: "Wash every 2 weeks, no wax needed"
      },
      graphene_coating: {
        description: "Premium graphene-enhanced ceramic coating",
        benefits: ["3+ year protection", "Superior heat dissipation", "Anti-static properties", "Self-healing properties", "Ultimate gloss"],
        process: ["Multi-stage paint correction", "Intensive preparation", "Graphene coating application", "Extended curing"],
        price: "$800",
        durability: "3-5 years",
        maintenance: "Wash monthly, annual maintenance coating"
      },
      paint_protection_film: {
        description: "Clear urethane film for physical protection",
        benefits: ["Rock chip protection", "Self-healing", "Maintains resale value", "Invisible protection"],
        areas: ["Front bumper", "Hood", "Side mirrors", "Door edges", "Full vehicle"],
        price_range: "$800-2500",
        durability: "7-10 years"
      }
    },
    paint_correction: {
      single_stage: {
        description: "Light polish to remove minor swirls and scratches",
        removes: ["Light swirl marks", "Minor scratches", "Water spots", "Light oxidation"],
        price_range: "$300-500",
        time: "4-6 hours"
      },
      multi_stage: {
        description: "Comprehensive paint correction process",
        stages: ["Heavy cutting compound", "Medium polish", "Fine finishing polish"],
        removes: ["Deep scratches", "Heavy swirl marks", "Paint defects", "Severe oxidation"],
        price_range: "$600-1200",
        time: "8-12 hours"
      }
    }
  },
  
  // Technical Knowledge
  techniques: {
    two_bucket_method: {
      description: "Proper washing technique to prevent scratches",
      equipment: ["Wash bucket with soap", "Rinse bucket with clean water", "Grit guards", "Quality wash mitt"],
      process: ["Dip mitt in soap bucket", "Wash small section", "Rinse mitt in clean water", "Repeat"]
    },
    clay_bar_treatment: {
      description: "Removes bonded contaminants from paint",
      when_needed: ["Before polishing", "Before coating", "When paint feels rough", "Every 6-12 months"],
      process: ["Clean and wet surface", "Knead clay bar", "Glide over wet paint", "Wipe clean"],
      benefits: ["Smooth paint surface", "Better polish results", "Improved coating adhesion"]
    }
  },
  
  // Common Issues and Solutions
  problems: {
    swirl_marks: {
      causes: ["Improper washing technique", "Dirty wash media", "Automatic car washes", "Poor quality towels"],
      solutions: ["Paint correction", "Proper washing technique", "Quality microfiber towels", "Two-bucket method"],
      prevention: ["Use clean wash media", "Straight line motions", "Quality tools", "Regular maintenance"]
    },
    water_spots: {
      causes: ["Mineral-rich water", "Washing in direct sunlight", "Not drying properly", "Sprinkler overspray"],
      solutions: ["Polish or compound", "Water spot remover", "Paint correction", "Professional treatment"],
      prevention: ["Wash in shade", "Use filtered water", "Dry immediately", "Apply protection"]
    },
    oxidation: {
      causes: ["UV exposure", "Lack of protection", "Environmental factors", "Age of paint"],
      solutions: ["Paint correction", "Polishing compound", "Professional restoration", "Protection application"],
      prevention: ["Regular waxing", "Covered parking", "UV protection", "Maintenance schedule"]
    }
  },
  
  // Product Knowledge
  products: {
    soaps: {
      ph_neutral: "Safe for all surfaces, won't strip protection",
      degreasing: "For heavy contamination, engine bays",
      foam_cannons: "Pre-wash foam for lubrication and cleaning"
    },
    protection: {
      carnauba_wax: "Natural protection, warm glow, 2-3 months durability",
      synthetic_wax: "Longer lasting, easier application, 4-6 months",
      ceramic_coating: "Long-term protection, hydrophobic, 2+ years",
      graphene_coating: "Premium protection, heat dissipation, 3+ years"
    },
    tools: {
      microfiber_towels: "Lint-free, safe for paint, various weaves for different tasks",
      wash_mitts: "Natural or synthetic, gentle on paint",
      foam_guns: "Pre-wash lubrication, safer cleaning",
      clay_bars: "Contamination removal, paint smoothing"
    }
  },
  
  // Environmental Factors
  environmental: {
    weather_effects: {
      sun: "UV damage, water spotting during wash, accelerated drying",
      rain: "Water spotting, contamination, need for covered drying",
      wind: "Dust contamination, quick drying, debris issues",
      humidity: "Slower drying, potential water spots, mold/mildew risk"
    },
    seasonal_care: {
      spring: "Pollen removal, thorough cleaning after winter",
      summer: "UV protection crucial, frequent washing due to heat",
      fall: "Leaf stain removal, preparation for winter",
      winter: "Salt damage prevention, less frequent washing, protection focus"
    }
  },
  
  // Vehicle-Specific Knowledge
  vehicle_types: {
    luxury_vehicles: {
      considerations: ["Premium products only", "Extra care required", "Specialized techniques", "Higher service prices"],
      common_issues: ["Sensitive paint", "Complex surfaces", "Advanced technology integration"]
    },
    classic_cars: {
      considerations: ["Gentle techniques", "Period-appropriate products", "Preservation focus", "Expert knowledge required"],
      special_care: ["Single-stage paint", "Chrome care", "Interior preservation", "Original finish maintenance"]
    },
    daily_drivers: {
      focus: ["Practical protection", "Cost-effective solutions", "Regular maintenance", "Durability priority"],
      services: ["Regular detailing", "Protection application", "Problem prevention", "Value maintenance"]
    }
  }
};

// Self-Learning Conversation Memory System
class ConversationMemory {
  constructor() {
    this.conversations = this.loadConversations();
    this.keywords = this.loadKeywords();
    this.responses = this.loadResponses();
    this.userPreferences = this.loadUserPreferences();
  }
  
  loadConversations() {
    try {
      return JSON.parse(localStorage.getItem('chatbot-conversations') || '[]');
    } catch (error) {
      console.warn('Failed to load conversations:', error);
      return [];
    }
  }
  
  saveConversations() {
    try {
      localStorage.setItem('chatbot-conversations', JSON.stringify(this.conversations));
    } catch (error) {
      console.warn('Failed to save conversations:', error);
    }
  }
  
  loadKeywords() {
    try {
      const saved = localStorage.getItem('chatbot-keywords');
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Map(parsed); // Convert array of entries back to Map
      }
      return new Map();
    } catch (error) {
      return new Map();
    }
  }
  
  saveKeywords() {
    try {
      localStorage.setItem('chatbot-keywords', JSON.stringify([...this.keywords.entries()]));
    } catch (error) {
      console.warn('Failed to save keywords:', error);
    }
  }
  
  loadResponses() {
    try {
      return JSON.parse(localStorage.getItem('chatbot-learned-responses') || '{}');
    } catch (error) {
      return {};
    }
  }
  
  saveResponses() {
    try {
      localStorage.setItem('chatbot-learned-responses', JSON.stringify(this.responses));
    } catch (error) {
      console.warn('Failed to save responses:', error);
    }
  }
  
  loadUserPreferences() {
    try {
      return JSON.parse(localStorage.getItem('chatbot-user-preferences') || '{}');
    } catch (error) {
      return {};
    }
  }
  
  saveUserPreferences() {
    try {
      localStorage.setItem('chatbot-user-preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }
  
  recordConversation(userMessage, botResponse, context = {}) {
    const conversation = {
      timestamp: Date.now(),
      userMessage: userMessage,
      botResponse: botResponse,
      context: context,
      id: Date.now() + Math.random()
    };
    
    this.conversations.push(conversation);
    
    // Keep only last 1000 conversations
    if (this.conversations.length > 1000) {
      this.conversations = this.conversations.slice(-1000);
    }
    
    this.extractKeywords(userMessage);
    this.saveConversations();
  }
  
  extractKeywords(message) {
    const words = message.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) { // Only meaningful words
        const count = this.keywords.get(word) || 0;
        this.keywords.set(word, count + 1);
      }
    });
    this.saveKeywords();
  }
  
  findSimilarConversations(message, limit = 5) {
    const messageWords = message.toLowerCase().split(/\s+/);
    const scored = this.conversations.map(conv => {
      const convWords = conv.userMessage.toLowerCase().split(/\s+/);
      const commonWords = messageWords.filter(word => convWords.includes(word));
      const score = commonWords.length / Math.max(messageWords.length, convWords.length);
      return { ...conv, similarity: score };
    });
    
    return scored
      .filter(conv => conv.similarity > 0.2)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
  
  getLearnedResponse(message) {
    const similar = this.findSimilarConversations(message, 1);
    if (similar.length > 0 && similar[0].similarity > 0.7) {
      return similar[0].botResponse;
    }
    return null;
  }
  
  updateUserPreference(key, value) {
    this.userPreferences[key] = value;
    this.saveUserPreferences();
  }
  
  getUserPreference(key, defaultValue = null) {
    return this.userPreferences[key] || defaultValue;
  }
}

const DEFAULT_ROLE_ASSIGNMENTS = {
  auto: 'mistralai/mistral-7b-instruct', // Auto mode - Mistral 7B Instruct (Free)
  reasoning: 'mistralai/mistral-7b-instruct', // Advanced reasoning
  tools: 'mistralai/mistral-7b-instruct', // Tool calling
  quotes: 'mistralai/mistral-7b-instruct', // Service quotes
  photo_uploads: 'mistralai/mistral-7b-instruct', // Photo analysis
  summaries: 'mistralai/mistral-7b-instruct', // Summarization
  search: 'mistralai/mistral-7b-instruct', // Search queries
  chat: 'mistralai/mistral-7b-instruct', // General chat
  fallback: 'mistralai/mistral-7b-instruct', // Always available fallback
  analytics: 'mistralai/mistral-7b-instruct', // Data analysis
  accessibility: 'mistralai/mistral-7b-instruct' // Accessibility support
};

/**
 * AI Utility Functions
 */
class AIUtils {
  static async queryAI(prompt, options = {}) {
    const { endpoint = '/api/ai', role, messages, model } = options;

    // Support both legacy (prompt) and new (messages) format
    let requestBody = {};
    if (Array.isArray(messages) && messages.length > 0) {
      requestBody.messages = messages;
    } else {
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        throw new Error('Prompt is required and must be a non-empty string');
      }
      requestBody.prompt = prompt.trim();
    }
    if (role) {
      requestBody.role = role;
    }
    if (model) {
      requestBody.model = model;
    }

    console.log(`🌐 AIUtils.queryAI calling endpoint: ${endpoint} with role: ${role} and model: '${model}'`);
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error response:', errorData);
        if (response.status === 405) {
          throw new Error('Method not allowed: API endpoint requires POST method');
        } else if (response.status === 500) {
          throw new Error('Internal server error: AI service is temporarily unavailable');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded: Please wait a moment before trying again');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found: Service may be temporarily offline');
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ API Response data:', data);
      return data;
    } catch (error) {
      console.error('💥 AIUtils.queryAI error:', error);
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
    // Accepts prompt and/or messages for memory support
    if ((!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) && (!options.messages || !Array.isArray(options.messages) || options.messages.length === 0)) {
      throw new Error('Prompt or messages array is required');
    }
    if (!role || typeof role !== 'string') {
      throw new Error('Role is required and must be a string');
    }

    // If this is an image analysis request, route to Hugging Face endpoint
    if (role === 'photo_uploads' && options.image) {
      // Call Hugging Face image analysis endpoint
      return await this.executeAPICall(prompt, { id: 'huggingface', name: 'Hugging Face', endpoint: '/api/image-analysis', enabled: true }, role, options);
    }

    // Use new OpenRouter endpoint for all text chat
    const openrouterAPI = { id: 'openrouter', name: 'OpenRouter', endpoint: '/api/openrouter', enabled: true };
    return await this.executeAPICall(prompt, openrouterAPI, role, options);
  }

  static async executeAPICall(prompt, api, role, options = {}) {
    console.log(`🚀 ChatRouter executing API call: ${api.name} (${api.id}) for role: ${role}`);
    const enhancedPrompt = this.enhancePromptForRole(prompt, role);
    const apiOptions = {
      endpoint: api.endpoint,
      ...options
    };
    if (api.id === 'none') {
      console.log('⚠️  API is set to "none" - returning disabled message');
      return {
        content: "AI services are currently disabled. Please contact support for assistance.",
        role: "assistant"
      };
    }
    // All OpenRouter-powered models use /api/openrouter
    if (
      api.id === 'openrouter' ||
      api.id === 'deepseek' ||
      api.id === 'google' ||
      api.id === 'mistral' ||
      api.id === 'llama'
    ) {
      console.log('🔗 Calling OpenRouter API at /api/openrouter...');
      const queryOptions = { endpoint: '/api/openrouter', role, messages: options.messages };
      if (options.model) queryOptions.model = options.model;
      console.log(`🔗 ChatRouter queryOptions:`, queryOptions);
      const result = await AIUtils.queryAI(enhancedPrompt, queryOptions);
      console.log('✅ OpenRouter API result:', result);
      return result;
    }
    // Fallback for any other API
    throw new Error(`API '${api.name}' not implemented and no fallback available`);
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
  // Extracts and stores user info (name, car, etc) from user messages
  extractAndStoreUserInfo(message) {
    // Name detection (simple regex for "my name is ..." or "I'm ...")
    const nameMatch = message.match(/(?:my name is|i'm|i am|im)\s+([A-Za-z]{2,30})/i);
    if (nameMatch) {
      this.sessionUserInfo = this.sessionUserInfo || {};
      this.sessionUserInfo.name = nameMatch[1];
    }
    // Car detection ("my car is ..." or "i drive a ...")
    const carMatch = message.match(/(?:my car is|i drive a|i have a)\s+([A-Za-z0-9\- ]{2,40})/i);
    if (carMatch) {
      this.sessionUserInfo = this.sessionUserInfo || {};
      this.sessionUserInfo.car = carMatch[1];
    }
  }
  scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    // Multiple approaches to ensure scrolling works
    const scrollToEnd = () => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      // Extra guarantee: scroll last child into view
      if (messagesContainer.lastElementChild) {
        messagesContainer.lastElementChild.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    };
    // Immediate scroll
    scrollToEnd();
    // Delayed scroll to ensure DOM is updated
    setTimeout(scrollToEnd, 30);
    setTimeout(scrollToEnd, 150);
    setTimeout(scrollToEnd, 400);
  }

  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('❌ Container not found! Cannot initialize chatbot.');
      return;
    }

    this.isOpen = false;
    this.isProcessing = false;
    this.settingsOpen = false;
    this.messages = [];
    this.assignments = { ...DEFAULT_ROLE_ASSIGNMENTS };
    this.currentRole = 'auto';
    this.settingsPanel = null;
    this.quoteEngine = new ChatQuoteEngine();
    this.memory = new ConversationMemory();

    // Secret modes
    this.adminMode = false;
    this.jayMode = false;
    this.secretModeActive = false;

    // File upload system
    this.uploadedFiles = [];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    this.selectedModel = '';


    this.loadAssignments();
    this.init();
  }

  renderModelDropdown() {
    // Add a dropdown for model selection above the chat input
    const modelOptions = [
      { id: '', name: 'Auto (Let AI choose)', value: '' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (Free)', value: 'deepseek/deepseek-chat' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B Instruct (Free)', value: 'mistralai/mistral-7b-instruct' },
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B Instruct (Free)', value: 'meta-llama/llama-3-8b-instruct' },
      { id: 'anthropic/claude-2', name: 'Claude 2 (Free)', value: 'anthropic/claude-2' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Free)', value: 'openai/gpt-3.5-turbo' },
      { id: 'qwen/qwen-2-7b-instruct', name: 'Qwen 2 7B Instruct (Free)', value: 'qwen/qwen-2-7b-instruct' },
      { id: 'microsoft/phi-3-medium-4k-instruct', name: 'Phi-3 Medium (Free)', value: 'microsoft/phi-3-medium-4k-instruct' },
      { id: 'huggingfaceh4/zephyr-7b-beta', name: 'Zephyr 7B Beta (Free)', value: 'huggingfaceh4/zephyr-7b-beta' },
      { id: 'openchat/openchat-7b', name: 'OpenChat 7B (Free)', value: 'openchat/openchat-7b' },
      { id: 'nvidia/llama-3.3-nemotron-super-49b-v1', name: 'Llama 3.3 Nemotron Super 49B (Free)', value: 'nvidia/llama-3.3-nemotron-super-49b-v1' }
    ];

    const dropdown = document.createElement('select');
    dropdown.id = 'model-select';
    dropdown.className = 'model-select-dropdown';
    dropdown.disabled = true; // Make dropdown unclickable by default
    
    // Add proper styling for scrolling and disabled state
    dropdown.style.cssText = `
      max-height: 200px;
      overflow-y: auto;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      margin: 5px 0;
      width: 100%;
      background-color: #f5f5f5;
      color: #999;
      cursor: not-allowed;
      opacity: 0.6;
    `;

    modelOptions.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.name;
      dropdown.appendChild(opt);
    });

    const container = document.getElementById('chatbot-container');
    container.insertBefore(dropdown, container.firstChild);

    // Store reference to dropdown for admin mode toggle
    this.modelDropdown = dropdown;
    
    // Add admin mode toggle functionality
    const input = document.getElementById('chatbot-input');
    input.addEventListener('input', () => {
      if (input.value.trim().toLowerCase() === 'josh') {
        this.activateAdminMode();
      }
    });
        console.log('Admin mode activated: Model selection enabled.');
      }
    });
  }

  loadAssignments() {
    try {
      const saved = localStorage.getItem('chatbot-role-assignments');
      if (saved) {
        this.assignments = JSON.parse(saved);
      } else {
        this.assignments = { ...DEFAULT_ROLE_ASSIGNMENTS };
      }
    } catch (error) {
      console.warn('Failed to load saved assignments:', error);
      this.assignments = { ...DEFAULT_ROLE_ASSIGNMENTS };
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
    this.hasUserSentFirstMessage = false; // Track if user has sent their first message
    this.renderModelDropdown();
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
            <button class="settings-btn" id="settings-btn" title="Settings (Admin Only)" disabled style="opacity: 0.5; cursor: not-allowed;">⚙️</button>
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
          <div class="file-upload-section" id="file-upload-section">
            <input type="file" id="file-upload" accept="image/*" multiple style="display: none;">
            <button class="file-upload-btn" id="file-upload-btn" title="Upload images for better quotes">📎</button>
          </div>
          <div class="uploaded-files" id="uploaded-files"></div>
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
    const fileUploadBtn = document.getElementById('file-upload-btn');
    const fileUpload = document.getElementById('file-upload');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.closeChat());
    send.addEventListener('click', () => this.sendMessage());
    settingsBtn.addEventListener('click', () => this.toggleSettings());
    roleSelect.addEventListener('change', (e) => this.changeRole(e.target.value));
    
    // File upload handlers
    fileUploadBtn.addEventListener('click', () => fileUpload.click());
    fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    // Secret mode detection
    input.addEventListener('input', (e) => this.checkSecretModes(e.target.value));
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
    // Check if admin mode is active
    if (!this.adminMode) {
      this.addMessage("🔒 Settings panel is restricted to admin users only. Type 'josh' to activate admin mode.", 'bot', 'warning');
      return;
    }
    
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
      auto: 'Ask me anything - I\'ll automatically choose the best way to help you...',
      quotes: 'Describe your vehicle and service needs for a quote...',
      search: 'What information are you looking for?',
      reasoning: 'Ask me to analyze or reason through something...',
      summaries: 'What would you like me to summarize?',
      chat: 'Ask about our services or chat with me...'
    };
    
    input.placeholder = rolePlaceholders[newRole] || 'How can I help you?';
    this.sendAnalyticsEvent('role_changed', { role: newRole });
  }

  /**
   * Auto-detect the best role for the given message
   * @param {string} message - User's message
   * @returns {string} - Best role to handle the message
   */
  detectBestRole(message) {
    const msgLower = message.toLowerCase();
    console.log('[AUTO MODE] Analyzing message for best role:', msgLower);
    // Quote-related keywords
    if (msgLower.includes('quote') || msgLower.includes('price') || msgLower.includes('cost') || 
        msgLower.includes('how much') || msgLower.includes('estimate') || msgLower.includes('pricing')) {
      console.log('[AUTO MODE] Detected role: quotes');
      return 'quotes';
    }
    // Search-related keywords
    if (msgLower.includes('find') || msgLower.includes('search') || msgLower.includes('where') || 
        msgLower.includes('when') || msgLower.includes('location') || msgLower.includes('hours')) {
      console.log('[AUTO MODE] Detected role: search');
      return 'search';
    }
    // Summary-related keywords
    if (msgLower.includes('summarize') || msgLower.includes('summary') || msgLower.includes('explain') || 
        msgLower.includes('tell me about') || msgLower.includes('what is')) {
      console.log('[AUTO MODE] Detected role: summaries');
      return 'summaries';
    }
    // Reasoning-related keywords
    if (msgLower.includes('why') || msgLower.includes('how') || msgLower.includes('analyze') || 
        msgLower.includes('compare') || msgLower.includes('recommend') || msgLower.includes('best')) {
      console.log('[AUTO MODE] Detected role: reasoning');
      return 'reasoning';
    }
    // Photo upload context
    if (this.uploadedFiles.length > 0) {
      console.log('[AUTO MODE] Detected role: photo_uploads (file uploaded)');
      return 'photo_uploads';
    }
    // Default to chat for conversational messages
    console.log('[AUTO MODE] Defaulted to role: chat');
    return 'chat';
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message || this.isProcessing) return;

    // DEBUG: Check model selection state
    const modelDropdown = document.getElementById('model-select');
    console.log(`🔍 sendMessage() DEBUG:`);
    console.log(`🔍 this.selectedModel: '${this.selectedModel}' (type: ${typeof this.selectedModel})`);
    console.log(`🔍 modelDropdown exists: ${!!modelDropdown}`);
    if (modelDropdown) {
      console.log(`🔍 modelDropdown.value: '${modelDropdown.value}'`);
      console.log(`🔍 modelDropdown.selectedIndex: ${modelDropdown.selectedIndex}`);
      console.log(`🔍 modelDropdown.options[selectedIndex].text: '${modelDropdown.options[modelDropdown.selectedIndex]?.text}'`);
      // FORCE SYNC: Ensure selectedModel matches dropdown value
      this.selectedModel = modelDropdown.value;
      console.log(`🔍 FORCE SYNC: this.selectedModel now: '${this.selectedModel}'`);
    }

    // Extract and store user info from this message
    this.extractAndStoreUserInfo(message);


    // Add user message to local messages array (for memory)
    this.addMessage(message, 'user');
    input.value = '';

    // Build full conversation history for memory, with system message if user info is known
    const messages = [];
    if (this.sessionUserInfo && (this.sessionUserInfo.name || this.sessionUserInfo.car)) {
      let sysMsg = 'You are Jay\'s Mobile Wash AI assistant.';
      if (this.sessionUserInfo.name) sysMsg += ` The user\'s name is ${this.sessionUserInfo.name}.`;
      if (this.sessionUserInfo.car) sysMsg += ` Their car is a ${this.sessionUserInfo.car}.`;
      sysMsg += ' Always use this info to personalize your responses.';
      messages.push({ role: 'system', content: sysMsg });
    }
    for (const msg of this.messages) {
      if (msg.type === 'user') {
        messages.push({ role: 'user', content: msg.text });
      } else if (msg.type === 'bot') {
        // Only include model/system messages if not a system/model change notification
        if (!msg.text.startsWith('✨ Model preference set to:')) {
          messages.push({ role: 'assistant', content: msg.text });
        }
      }
    }

    // Only after the first user message, start AI/model analysis and response
    if (!this.hasUserSentFirstMessage) {
      this.hasUserSentFirstMessage = true;
    }

    this.isProcessing = true;
    this.showProcessing();

    try {
      let response;

      // Check for basefile knowledge first
      const basefileResponse = this.searchKnowledgeBase(message);
      if (basefileResponse) {
        response = { content: basefileResponse };
      } else {
        // Check learned responses from memory
        const learnedResponse = this.memory.getLearnedResponse(message);
        if (learnedResponse) {
          response = { content: learnedResponse };
        } else {
          // On first user message, analyze and select best role/model
          let effectiveRole = this.currentRole;
          if (this.currentRole === 'auto') {
            effectiveRole = this.detectBestRole(message);
            if (!this.assignments[effectiveRole]) effectiveRole = 'chat';
            console.log(`Auto mode: selected role '${effectiveRole}' for message: "${message.substring(0, 50)}..."`);
          }
          // Call OpenRouter with proper error handling
          try {
            console.log(`🔗 Calling ChatRouter for OpenRouter with role: ${effectiveRole} and model: '${this.selectedModel}'`);
            console.log(`🔗 Model dropdown current value: '${document.getElementById('model-select')?.value}'`);
            console.log(`🔗 Selected model type: ${typeof this.selectedModel}`);
            response = await ChatRouter.routeLLMRequest(message, effectiveRole, this.assignments, { model: this.selectedModel, messages });
            console.log('✅ AI response received:', response);
            
            // Log and show which model was actually used
            if (response.model) {
              console.log(`🤖 Model used: ${response.model}`);
              // Add a small indicator of which model responded
              const modelName = response.model.split('/').pop().split(':')[0];
              this.addMessage(`🤖 _Answered by: ${modelName}_`, 'bot', 'model-info');
            }
          } catch (aiError) {
            console.error('❌ AI API Error Details:', aiError);
            
            // Show user-friendly error message
            let errorMessage = 'Sorry, I encountered an error. Let me try to help you anyway.';
            if (aiError.message.includes('429') || aiError.message.includes('rate limit')) {
              errorMessage = 'The AI service is busy right now. Please wait a moment and try again.';
            } else if (aiError.message.includes('404') || aiError.message.includes('not found')) {
              errorMessage = 'AI service is temporarily offline. Using fallback response.';
            } else if (aiError.message.includes('network') || aiError.message.includes('fetch')) {
              errorMessage = 'Connection issue detected. Please check your internet and try again.';
            }
            
            this.addMessage(`⚠️ ${errorMessage}`, 'bot', 'error');
            response = { content: this.generateSmartResponse(message, effectiveRole) };
          }
        }
      }

      // Try to extract model info from response (if backend returns it in future)
      let modelUsed = null;
      if (response.model) modelUsed = response.model;
      // If not, infer from role (matches backend modelMap)
      if (!modelUsed) {
        const modelMap = {
          reasoning: 'google/gemma-7b-it:free',
          tools: 'mistralai/mistral-7b-instruct:free',
          quotes: 'meta-llama/llama-3-8b-instruct:free',
          photo_uploads: 'google/gemma-7b-it:free',
          summaries: 'mistralai/mistral-7b-instruct:free',
          search: 'google/gemma-7b-it:free',
          analytics: 'meta-llama/llama-3-8b-instruct:free',
          accessibility: 'mistralai/mistral-7b-instruct:free',
          chat: 'deepseek/deepseek-chat',
          fallback: 'deepseek/deepseek-chat'
        };
        let effectiveRole = this.currentRole;
        if (this.currentRole === 'auto') {
          effectiveRole = this.detectBestRole(message);
          if (!this.assignments[effectiveRole]) effectiveRole = 'chat';
        }
        modelUsed = modelMap[effectiveRole] || modelMap['fallback'];
      }
    const responseText = response.content || response.response || response.generated_text || JSON.stringify(response, null, 2);
    this.addMessage(responseText, 'bot', 'normal', modelUsed);
      // Model used is now shown in the message itself; no need to call displayModelUsed

      // Record conversation for learning
      this.memory.recordConversation(message, responseText, {
        role: this.currentRole,
        hasImages: this.uploadedFiles.length > 0,
        timestamp: Date.now(),
        model: modelUsed
      });

      // Clear uploaded files after processing
      this.clearUploadedFiles();

      this.sendAnalyticsEvent('chat_query_success', {
        role: this.currentRole,
        api: this.assignments[this.currentRole],
        usedBasefile: !!basefileResponse,
        usedMemory: !!this.memory.getLearnedResponse(message)
      });
    } catch (error) {
      console.error('Chat error:', error);

      // Provide user-friendly error messages instead of technical ones
      let userFriendlyMessage;
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
        userFriendlyMessage = "🔌 I'm having trouble connecting to my AI services right now. Let me help you with what I know! Please try again in a moment, or feel free to call us directly at 562-228-9429 for immediate assistance.";
      } else if (error.message.includes('405') || error.message.includes('Method not allowed')) {
        userFriendlyMessage = "⚙️ There's a temporary technical issue with my AI features. Don't worry - I can still help you with basic questions about our services! For detailed quotes and booking, please call 562-228-9429.";
      } else if (error.message.includes('500') || error.message.includes('Internal server error')) {
        userFriendlyMessage = "🛠️ My AI brain is taking a quick break for maintenance. I can still assist you with general information about Jay's Mobile Wash services. For immediate help, please call 562-228-9429!";
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        userFriendlyMessage = "⏰ My AI is taking longer than usual to respond. Let me give you some quick help instead! For faster service, please call us at 562-228-9429.";
      } else {
        userFriendlyMessage = "🤖 I'm experiencing a temporary glitch, but I'm still here to help! Let me share what I know about our mobile detailing services, or feel free to call 562-228-9429 for immediate assistance.";
      }

      // Add the user-friendly error message instead of technical fallback
      this.addMessage(userFriendlyMessage, 'bot', 'error');

      // Then provide a helpful fallback response
      const fallbackResponse = this.generateSmartResponse(message, this.currentRole);
      this.addMessage(fallbackResponse, 'bot');

      this.sendAnalyticsEvent('chat_query_error', {
        role: this.currentRole,
        error: error.message,
        userFriendlyErrorShown: true
      });
    } finally {
      this.isProcessing = false;
      this.hideProcessing();
    }
  }

  searchKnowledgeBase(message) {
    const lowerMessage = message.toLowerCase();
    
    // Search through car detailing knowledge base
    for (const category in CAR_DETAILING_KNOWLEDGE_BASE) {
    }
  }

  searchKnowledgeBase(message) {
    const lowerMessage = message.toLowerCase();
    
    // Search through car detailing knowledge base
    for (const category in CAR_DETAILING_KNOWLEDGE_BASE) {
      const categoryData = CAR_DETAILING_KNOWLEDGE_BASE[category];
      
      if (typeof categoryData === 'object') {
        for (const subcategory in categoryData) {
          const item = categoryData[subcategory];
          
          // Check if message relates to this knowledge item
          if (this.messageMatchesKnowledge(lowerMessage, subcategory, item)) {
            return this.formatKnowledgeResponse(subcategory, item, category);
          }
        }
      }
    }
    
    return null;
  }
  
  messageMatchesKnowledge(message, key, item) {
    // Only match for company-specific topics
    const companyKeywords = [
      'jay', 'mobile wash', 'jays mobile wash', 'service', 'services', 'pricing', 'price', 'cost', 'quote', 'estimate',
      'location', 'where', 'area', 'county', 'address', 'contact', 'phone', 'email', 'hours', 'open', 'close',
      'book', 'booking', 'appointment', 'schedule', 'owner', 'founder', 'team', 'business', 'company', 'detail', 'detailing',
      'ceramic', 'graphene', 'coating', 'paint correction', 'mini detail', 'luxury detail', 'max detail', 'package', 'packages'
    ];
    // Only match if the message contains a company keyword and the key is a service or business info
    const msgLower = message.toLowerCase();
    if (companyKeywords.some(kw => msgLower.includes(kw))) {
      // Only match for service, protection, paint_correction, or direct business info
      const allowedCategories = [
        'basic_wash', 'detailed_wash', 'mini_detail', 'luxury_detail', 'max_detail',
        'ceramic_coating', 'graphene_coating', 'paint_protection_film', 'single_stage', 'multi_stage',
        'service', 'services', 'pricing', 'price', 'cost', 'quote', 'estimate',
        'location', 'contact', 'phone', 'email', 'hours', 'package', 'packages'
      ];
      if (allowedCategories.some(cat => key.includes(cat))) return true;
    }
    return false;
  }
  
  formatKnowledgeResponse(key, item, category) {
    let response = `**${key.replace(/_/g, ' ').toUpperCase()}** - ${item.description}\n\n`;
    
    if (item.price || item.price_range) {
      response += `💰 **Price**: ${item.price || item.price_range}\n`;
    }
    
    if (item.time) {
      response += `⏱️ **Duration**: ${item.time}\n`;
    }
    
    if (item.benefits) {
      response += `✅ **Benefits**: ${item.benefits.join(', ')}\n`;
    }
    
    if (item.includes) {
      response += `📋 **Includes**: ${item.includes.join(', ')}\n`;
    }
    
    if (item.process) {
      response += `🔧 **Process**: ${item.process.join(' → ')}\n`;
    }
    
    response += `\n📞 Call (562) 228-9429 to book this service!`;
    
    return response;
  }

  checkSecretModes(inputValue) {
    const value = inputValue.toLowerCase();
    
    // Check for admin mode toggle ("josh")
    if (value === 'josh') {
      if (this.adminMode) {
        this.deactivateAdminMode();
      } else {
        this.activateAdminMode();
      }
      return;
    }
    
    // Check for Jay mode ("jay")
    if (value === 'jay') {
      if (this.jayMode) {
        this.deactivateJayMode();
      } else {
        this.activateJayMode();
      }
      return;
    }
  }
  
  activateAdminMode() {
    this.adminMode = true;
    this.secretModeActive = true;
    document.querySelector('.chatbot-window').classList.add('admin-mode');
    const input = document.getElementById('chatbot-input');
    input.value = '';
    
    // Enable model dropdown
    if (this.modelDropdown) {
      this.modelDropdown.disabled = false;
      this.modelDropdown.style.cssText = `
        max-height: 200px;
        overflow-y: auto;
        padding: 8px;
        border: 1px solid #007bff;
        border-radius: 4px;
        font-size: 14px;
        margin: 5px 0;
        width: 100%;
        background-color: #ffffff;
        color: #000;
        cursor: pointer;
        opacity: 1;
      `;
      console.log('✅ Model dropdown enabled');
    }
    
    // Enable settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.disabled = false;
      settingsBtn.style.opacity = '1';
      settingsBtn.style.cursor = 'pointer';
      settingsBtn.title = 'Settings (Admin Mode Active)';
      console.log('✅ Settings button enabled');
    }
    
    this.addMessage("🔧 ADMIN MODE ACTIVATED 🔧\n\nAdmin features unlocked:\n• Model selection dropdown is now enabled\n• Settings panel is now accessible\n• Advanced admin commands available:\n  - 'reset memory' - Clear conversation memory\n  - 'export data' - Download learning data\n  - 'upload training' - Upload training files\n  - 'analytics' - View detailed statistics\n  - 'debug mode' - Enable debug logging\n  - 'open kb panel' - Open Knowledge Base Editor", 'bot', 'admin');
    input.placeholder = "Admin mode active - Type admin commands...";

    // Add admin panel button if not present
    if (!document.getElementById('kb-admin-panel-btn')) {
      const header = document.querySelector('.chatbot-header .header-actions');
      const btn = document.createElement('button');
      btn.id = 'kb-admin-panel-btn';
      btn.className = 'kb-admin-btn';
      btn.textContent = '🗂️ KB Editor';
      btn.title = 'Open Knowledge Base Editor';
      btn.onclick = () => this.openKnowledgeBasePanel();
      header.appendChild(btn);
    }
  }

  openKnowledgeBasePanel() {
    // Create or show the KB editor panel
    let panel = document.getElementById('kb-admin-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'kb-admin-panel';
      panel.className = 'kb-admin-panel';
      panel.innerHTML = `
        <div class="kb-panel-header">
          <span>Knowledge Base Editor</span>
          <button id="kb-close-btn">✕</button>
        </div>
        <textarea id="kb-json-editor" style="width:100%;height:300px;font-size:13px;">${JSON.stringify(CAR_DETAILING_KNOWLEDGE_BASE, null, 2)}</textarea>
        <div style="margin-top:10px;display:flex;gap:10px;">
          <button id="kb-save-btn">Save</button>
          <button id="kb-reload-btn">Reload</button>
        </div>
        <div id="kb-save-status" style="margin-top:8px;font-size:12px;"></div>
      `;
      document.body.appendChild(panel);
      document.getElementById('kb-close-btn').onclick = () => panel.remove();
      document.getElementById('kb-save-btn').onclick = () => this.saveKnowledgeBaseFromEditor();
      document.getElementById('kb-reload-btn').onclick = () => {
        document.getElementById('kb-json-editor').value = JSON.stringify(CAR_DETAILING_KNOWLEDGE_BASE, null, 2);
        document.getElementById('kb-save-status').textContent = '';
      };
    } else {
      panel.style.display = 'block';
    }
  }

  saveKnowledgeBaseFromEditor() {
    const textarea = document.getElementById('kb-json-editor');
    const status = document.getElementById('kb-save-status');
    try {
      const newKB = JSON.parse(textarea.value);
      window.CAR_DETAILING_KNOWLEDGE_BASE = newKB;
      status.textContent = '✅ Knowledge base updated (in-memory, reload to reset).';
      status.style.color = 'green';
    } catch (e) {
      status.textContent = '❌ Invalid JSON: ' + e.message;
      status.style.color = 'red';
    }
  }

  deactivateAdminMode() {
    this.adminMode = false;
    this.secretModeActive = false;
    
    // Remove admin styling
    document.querySelector('.chatbot-window').classList.remove('admin-mode');
    
    // Disable model dropdown
    if (this.modelDropdown) {
      this.modelDropdown.disabled = true;
      this.modelDropdown.style.cssText = `
        max-height: 200px;
        overflow-y: auto;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        margin: 5px 0;
        width: 100%;
        background-color: #f5f5f5;
        color: #999;
        cursor: not-allowed;
        opacity: 0.6;
      `;
      console.log('🔒 Model dropdown disabled');
    }
    
    // Disable settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.disabled = true;
      settingsBtn.style.opacity = '0.5';
      settingsBtn.style.cursor = 'not-allowed';
      settingsBtn.title = 'Settings (Admin Only)';
      console.log('🔒 Settings button disabled');
    }
    
    // Clear input and show deactivation message
    const input = document.getElementById('chatbot-input');
    input.value = '';
    
    // Show fun deactivation message
    this.addMessage("🎉 ADMIN MODE DEACTIVATED! 🎉\n\nThanks for the admin session, Josh! 🚀\nReturning to normal chat mode...\n\n✨ All admin features locked! Model selection and settings are now protected. ✨", 'bot', 'system');
    
    // Restore normal placeholder based on current role
    const rolePlaceholders = {
      auto: 'Ask me anything - I\'ll automatically choose the best way to help you...',
      quotes: 'Describe your vehicle and service needs for a quote...',
      search: 'What information are you looking for?',
      reasoning: 'Ask me to analyze or reason through something...',
      summaries: 'What would you like me to summarize?',
      chat: 'Ask about our services or chat with me...'
    };
    input.placeholder = rolePlaceholders[this.currentRole] || 'How can I help you?';
    
    // Remove admin KB panel button
    const kbBtn = document.getElementById('kb-admin-panel-btn');
    if (kbBtn) {
      kbBtn.remove();
    }
  }
  
  activateJayMode() {
    this.jayMode = true;
    this.secretModeActive = true;
    
    // Add Jay mode styling (lighter theme)
    document.querySelector('.chatbot-window').classList.remove('dark-mode');
    document.querySelector('.chatbot-window').classList.add('jay-mode');
    
    this.jayMode = true;
    this.secretModeActive = true;
    
    // Add Jay mode styling (lighter theme)
    document.querySelector('.chatbot-window').classList.remove('dark-mode');
    document.querySelector('.chatbot-window').classList.add('jay-mode');
    
    // Clear input and show Jay mode message
    const input = document.getElementById('chatbot-input');
    input.value = '';
    
    // Trigger beat animation if available
    if (window.JayAudio) {
      window.JayAudio.triggerBeat(0.8);
    }
    
    this.addMessage("🎵 JAY MODE ACTIVATED! 🎵\n\nSpecial features unlocked:\n• Enhanced beat detection and animations\n• Premium service insights\n• VIP customer treatment\n• Advanced car knowledge\n• Exclusive detailing tips", 'bot', 'jay');
    
    // Update placeholder
    input.placeholder = "Jay mode - Ask me anything about premium detailing...";
    
    // Add pulsing animation to chat toggle
    document.getElementById('chatbot-toggle').classList.add('jay-mode-pulse');
  }

  deactivateJayMode() {
    this.jayMode = false;
    this.secretModeActive = false;
    
    // Remove Jay mode styling
    document.querySelector('.chatbot-window').classList.remove('jay-mode');
    
    // Clear input and show deactivation message
    const input = document.getElementById('chatbot-input');
    input.value = '';
    
    this.addMessage("🌟 JAY MODE DEACTIVATED! 🌟\n\nThanks for the premium session! ✨\nReturning to standard chat mode...\n\n🎵 All special features are now disabled until you type 'jay' again! 🎵", 'bot', 'system');
    
    // Update placeholder
    const rolePlaceholders = {
      auto: 'Ask me anything - I\'ll automatically choose the best way to help you...',
      quotes: 'Describe your vehicle and service needs for a quote...',
      search: 'What information are you looking for?',
      reasoning: 'Ask me to analyze or reason through something...',
      summaries: 'What would you like me to summarize?',
      chat: 'Ask about our services or chat with me...'
    };
    input.placeholder = rolePlaceholders[this.currentRole] || 'How can I help you?';
    
    // Remove pulsing animation from chat toggle
    document.getElementById('chatbot-toggle').classList.remove('jay-mode-pulse');
  }

  handleFileUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (this.validateFile(file)) {
        this.processUploadedFile(file);
      }
    });
    
    // Clear the input to allow re-uploading the same file
    event.target.value = '';
  }
  
  validateFile(file) {
    // Check file type
    if (!this.allowedFileTypes.includes(file.type)) {
      this.addMessage(`❌ File type not supported: ${file.type}. Please upload images only.`, 'bot', 'error');
      return false;
    }
    
    // Check file size
    if (file.size > this.maxFileSize) {
      this.addMessage(`❌ File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`, 'bot', 'error');
      return false;
    }
    
    return true;
  }
  
  processUploadedFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target.result,
        timestamp: Date.now()
      };
      
      this.uploadedFiles.push(fileData);
      this.displayUploadedFile(fileData);
      
      // Auto-analyze image for quote optimization
      this.analyzeImageForQuote(fileData);
    };
    
    reader.readAsDataURL(file);
  }
  
  displayUploadedFile(fileData) {
    const container = document.getElementById('uploaded-files');
    
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';
    fileElement.innerHTML = `
      <img src="${fileData.data}" alt="${fileData.name}" class="uploaded-image">
      <div class="file-info">
        <span class="file-name">${fileData.name}</span>
        <button class="remove-file" data-timestamp="${fileData.timestamp}">✕</button>
      </div>
    `;
    
    container.appendChild(fileElement);
    
    // Add remove handler
    fileElement.querySelector('.remove-file').addEventListener('click', (e) => {
      const timestamp = parseInt(e.target.dataset.timestamp);
      this.removeUploadedFile(timestamp);
      fileElement.remove();
    });
  }
  
  removeUploadedFile(timestamp) {
    this.uploadedFiles = this.uploadedFiles.filter(file => file.timestamp !== timestamp);
  }
  
  clearUploadedFiles() {
    this.uploadedFiles = [];
    document.getElementById('uploaded-files').innerHTML = '';
  }
  
  // Image analysis with Google Vision is deprecated/removed
  analyzeImageForQuote(fileData) {
    setTimeout(() => {
      this.addMessage("❌ Image analysis is currently unavailable. Please try again later or contact support.", 'bot', 'error');
    }, 1000);
  }
  
  performImageAnalysis(fileData) {
    // This is a simplified simulation - in a real implementation, 
    // this would use computer vision APIs
    const possibleIssues = [
      {
        issue: "Paint Swirl Marks Detected",
        recommendation: "Paint correction would restore that showroom shine. Add single-stage correction (+$300) or multi-stage for deeper scratches (+$600)."
      },
      {
        issue: "Wheel Contamination Visible", 
        recommendation: "Professional wheel cleaning and ceramic coating for wheels (+$150) would provide long-lasting protection."
      },
      {
        issue: "Water Spots on Paint",
        recommendation: "Paint decontamination and ceramic coating (+$450) would prevent future water spotting and make maintenance easier."
      },
      {
        issue: "Oxidized Headlights",
        recommendation: "Headlight restoration service (+$80) would improve visibility and vehicle appearance."
      },
      {
        issue: "Interior Wear Visible",
        recommendation: "Leather conditioning and interior protection (+$100) would restore and preserve your interior."
      }
    ];
    
    // Randomly select 1-3 issues for demonstration
    const numIssues = Math.floor(Math.random() * 3) + 1;
    const selectedIssues = [];
    
    for (let i = 0; i < numIssues; i++) {
      const randomIndex = Math.floor(Math.random() * possibleIssues.length);
      const issue = possibleIssues[randomIndex];
      
      if (!selectedIssues.find(s => s.issue === issue.issue)) {
        selectedIssues.push(issue);
      }
    }
    
    return selectedIssues;
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

  generateSummaryResponse(message) {
    return 'Here\'s a summary: Jay\'s Mobile Wash offers three main categories: Mobile Detailing ($70-$200), Ceramic Coating ($450), and Graphene Coating ($800). We serve LA/OC areas with mobile convenience. Call (562) 228-9429 for service details.';
  }

  addMessage(content, sender, type = 'normal', modelUsed = null) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message ${type === 'error' ? 'error-message' : ''}`;
    let modelInfo = '';
    if (modelUsed) {
      modelInfo = `<div class="model-used">Model: <span>${modelUsed}</span></div>`;
    }
    messageDiv.innerHTML = `
      <div class="message-content">${content}</div>
      ${modelInfo}
      <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    // Multiple approaches to ensure scrolling works
    const scrollToEnd = () => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      // Extra guarantee: scroll last child into view
      if (messagesContainer.lastElementChild) {
        messagesContainer.lastElementChild.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    };
    
    // Immediate scroll
    scrollToEnd();
    // Delayed scroll to ensure DOM is updated
    setTimeout(scrollToEnd, 30);
    setTimeout(scrollToEnd, 150);
    setTimeout(scrollToEnd, 400);
  }

  showProcessing() {
    const overlay = document.getElementById('processing-overlay');
    const apiSpan = document.getElementById('processing-api');
    apiSpan.textContent = this.assignments[this.currentRole] || 'AI';
    overlay.style.display = 'flex';
    
    // Ensure scrolling still works when processing is shown
    this.scrollToBottom();
  }

  hideProcessing() {
    document.getElementById('processing-overlay').style.display = 'none';
    
    // Ensure scrolling works after hiding processing
    this.scrollToBottom();
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
  window.advancedChatbot = new AdvancedChatBot('chatbot-container');
});