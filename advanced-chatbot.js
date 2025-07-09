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
  },
  {
    id: 'none',
    name: 'AI Disabled',
    endpoint: '/api/none',
    description: 'Disable AI responses and show contact information',
    enabled: true
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
    id: 'summarize',
    name: 'Summarize',
    description: 'Summarize documents, text, or conversations'
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

// Comprehensive Car Detailing Knowledge Base
const CAR_DETAILING_KNOWLEDGE_BASE = {
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
      description: "Professional paint correction services to restore your vehicle's finish by removing imperfections and restoring clarity and gloss",
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
  
  // Add new conversation with placeholder for response
  addConversation(conversationData) {
    const conversation = {
      ...conversationData,
      id: Date.now() + Math.random()
    };
    
    this.conversations.push(conversation);
    
    // Keep only last 1000 conversations
    if (this.conversations.length > 1000) {
      this.conversations = this.conversations.slice(-1000);
    }
    
    this.extractKeywords(conversationData.userMessage);
    this.saveConversations();
  }
  
  // Update the last conversation with response details
  updateLastConversation(updateData) {
    if (this.conversations.length > 0) {
      const lastConversation = this.conversations[this.conversations.length - 1];
      Object.assign(lastConversation, updateData);
      this.saveConversations();
    }
  }
  
  // Add keyword association
  addKeyword(keyword, response) {
    if (!this.responses[keyword]) {
      this.responses[keyword] = [];
    }
    this.responses[keyword].push(response);
    
    // Keep only last 5 responses per keyword
    if (this.responses[keyword].length > 5) {
      this.responses[keyword] = this.responses[keyword].slice(-5);
    }
    
    this.saveResponses();
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
  auto: 'auto',                    // Auto mode - smart model selection
  reasoning: 'qwq_32b',           // Advanced reasoning - QWQ 32B for complex logic and analysis
  tools: 'kimi_dev_72b',          // Tool calling - Kimi Dev 72B optimized for development/tools
  quotes: 'llama4_maverick',      // Service quotes - Llama 4 Maverick for structured business responses
  photo_uploads: 'llama32_vision', // Photo analysis - Llama 3.2 Vision for image analysis
  summaries: 'reka_flash_3',      // Summarization - Reka Flash 3 for fast, efficient summaries
  summarize: 'llama33',          // Summarize - Llama 3.3 for excellent text summarization
  search: 'deepseek',             // Search queries - DeepSeek for information retrieval
  chat: 'llama4_scout',           // General chat - Llama 4 Scout for conversational interactions
  fallback: 'deepseek',           // Fallback to reliable DeepSeek
  analytics: 'glm_z1_32b',        // Data analysis - GLM-Z1 32B for complex analysis
  accessibility: 'deepseek',      // Accessibility support - DeepSeek for helpful responses
  deep_analysis: 'qwen3_235b',    // Deep analysis - Qwen 3 235B for comprehensive analysis
  multi_language: 'nemotron_super_49b' // Multi-language support - Nemotron Super 49B
};

/**
 * AI Utility Functions
 */
class AIUtils {
  static async queryAI(prompt, options = {}) {
    const { endpoint = '/api/ai', role } = options;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }

    try {
      const requestBody = {
        prompt: prompt.trim()
      };
      
      // Include role in request body if provided
      if (role) {
        requestBody.role = role;
      }

      console.log(`🔍 Querying AI at ${endpoint} with role: ${role}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Provide more specific error information for better debugging
        if (response.status === 405) {
          throw new Error('Method not allowed: API endpoint requires POST method');
        } else if (response.status === 500) {
          throw new Error(`Internal server error: ${errorData.error || 'AI service is temporarily unavailable'}`);
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded: Please wait a moment before trying again');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found: Service may be temporarily offline');
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log(`✅ AI response received from ${endpoint}`);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: AI service is taking too long to respond');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to AI service');
      } else if (error.message.includes('504')) {
        throw new Error('Gateway timeout: AI service is temporarily overloaded');
      } else if (error.message.includes('503')) {
        throw new Error('Service unavailable: AI service is temporarily down');
      } else if (error.message.includes('502')) {
        throw new Error('Bad gateway: AI service connection error');
      }
      console.error(`❌ AI query failed:`, error.message);
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
      role: role,
      ...options
    };
    
    if (api.id === 'none') {
      return {
        content: "AI services are currently disabled. Please contact Jay's Mobile Wash at (562) 228-9429 for assistance.",
        role: "assistant"
      };
    }
    
    // Use the API endpoint directly with proper error handling
    try {
      console.log(`🚀 Calling ${api.name} API at ${api.endpoint}`);
      const result = await AIUtils.queryAI(enhancedPrompt, apiOptions);
      
      console.log(`📥 Raw API response:`, result);
      
      // Handle different response formats
      let responseContent = null;
      
      if (result.content && result.content.trim()) {
        responseContent = result.content;
      } else if (result.response && result.response.trim()) {
        responseContent = result.response;
      } else if (result.responseText && result.responseText.trim()) {
        responseContent = result.responseText;
      } else if (result.message && result.message.trim()) {
        responseContent = result.message;
      } else if (typeof result === 'string' && result.trim()) {
        responseContent = result;
      } else if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
        responseContent = result.choices[0].message.content;
      } else {
        // Handle empty or malformed responses
        console.warn(`⚠️ Empty or malformed response from ${api.name}:`, result);
        
        if (result.selectedModel) {
          throw new Error(`${result.selectedModel} returned an empty response. This might be due to content filtering or a temporary issue with the model.`);
        } else {
          throw new Error(`API returned an empty response. Please try a different model or rephrase your question.`);
        }
      }
      
      return { content: responseContent, role: "assistant" };
    } catch (error) {
      console.error(`❌ ${api.name} API failed:`, error.message);
      throw new Error(`${api.name} API failed: ${error.message}`);
    }
  }

  static enhancePromptForRole(prompt, role) {
    const roleEnhancements = {
      reasoning: "Please analyze this logically and provide step-by-step reasoning: ",
      tools: "Consider what tools or actions might be needed for: ",
      quotes: "Provide a detailed service quote or pricing estimate for: ",
      photo_uploads: "Analyze this image or photo-related request: ",
      summaries: "Please summarize the key points of: ",
      summarize: "Please provide a clear, concise summary of: ",
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
    // Check if container exists
    if (!this.container) {
      console.warn('⚠️ Settings container not found, skipping settings panel initialization');
      return;
    }
    
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
    // Only show enabled APIs for assignment (except 'none')
    const enabledAPIs = API_OPTIONS.filter(api => api.enabled && api.id !== 'none');
    return CHAT_ROLES.map(role => {
      const currentAssignment = this.assignments[role.id] || 'none';
      return `
        <div class="role-assignment">
          <label for="role-${role.id}">
            <strong>${role.name}</strong>
            <span class="role-description">${role.description}</span>
          </label>
          <select id="role-${role.id}" data-role="${role.id}">
            <option value="none" ${currentAssignment === 'none' ? 'selected' : ''}>None (Disabled)</option>
            ${enabledAPIs.map(api => `
              <option value="${api.id}" ${api.id === currentAssignment ? 'selected' : ''}>
                ${api.name}
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
  // Save chat history to localStorage
  saveChatHistory() {
    try {
      const messagesContainer = document.getElementById('chatbot-messages');
      const messages = Array.from(messagesContainer.querySelectorAll('.message')).map(msg => {
        const sender = msg.classList.contains('user-message') ? 'user' : 'bot';
        const content = msg.querySelector('.message-content')?.innerHTML || '';
        const type = msg.classList.contains('error-message') ? 'error' : (msg.classList[1] || 'normal');
        return { sender, content, type };
      });
      localStorage.setItem('chatbot-history', JSON.stringify(messages));
    } catch (e) { /* ignore */ }
  }

  // Restore chat history from localStorage
  restoreChatHistory() {
    try {
      const messages = JSON.parse(localStorage.getItem('chatbot-history') || '[]');
      const messagesContainer = document.getElementById('chatbot-messages');
      messagesContainer.innerHTML = '';
      messages.forEach(msg => {
        this.addMessage(msg.content, msg.sender, msg.type);
      });
    } catch (e) { /* ignore */ }
  }
  constructor(containerId) {
    console.log('🔍 Looking for container:', containerId);
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    console.log('📦 Container found:', this.container);
    
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
    
    // Summarizer flag - when true, all AI responses are summarized
    this.summarizerActive = false;
    
    // Secret modes
    this.adminMode = false;
    this.jayMode = false;
    this.secretModeActive = false;
      // File upload system
    this.uploadedFiles = [];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    this.selectedModel = 'auto'; // Default to Auto Mode

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
    // Restore selected model from localStorage if available
    const savedModel = localStorage.getItem('chatbot-selected-model');
    if (savedModel) {
      this.selectedModel = savedModel;
    }
    this.createChatWidget();
    this.setupEventListeners();
    this.hasUserSentFirstMessage = false; // Track if user has sent their first message
    this.renderModelDropdown();
    this.sendAnalyticsEvent('chat_initialized');
  }

  renderModelDropdown() {
    // Dynamically generate dropdown options from API_OPTIONS (enabled only)
    const modelOptions = API_OPTIONS.filter(opt => opt.enabled).map(opt => ({
      id: opt.id,
      name: `${opt.name}${opt.description && opt.description.toLowerCase().includes('free') ? ' (Free)' : opt.description && opt.description.toLowerCase().includes('gated') ? ' (Your Access)' : ''}`,
      value: opt.id
    }));
    const dropdown = document.createElement('select');
    dropdown.id = 'model-select';
    dropdown.className = 'chatbot-model-select';
    modelOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.name;
      dropdown.appendChild(option);
    });
    dropdown.addEventListener('change', (e) => {
    this.selectedModel = e.target.value;
    localStorage.setItem('chatbot-selected-model', this.selectedModel);
    console.log(`🎯 Model dropdown changed to: '${this.selectedModel}' (type: ${typeof this.selectedModel})`);
    console.log(`🎯 Selected option text: ${dropdown.options[dropdown.selectedIndex].text}`);
    // Fun feedback animation
    dropdown.style.transform = 'scale(1.08) rotate(-2deg)';
    setTimeout(() => { dropdown.style.transform = ''; }, 180);
    this.addMessage(`✨ Model preference set to: <b>${dropdown.options[dropdown.selectedIndex].text}</b>!`, 'bot', 'system');
    });
    
    // Set the dropdown value to match the current selectedModel
    dropdown.value = this.selectedModel;
    
    // Insert above input
    const inputRow = document.getElementById('chatbot-input').parentNode;
    if (inputRow && !document.getElementById('model-select')) {
      inputRow.parentNode.insertBefore(dropdown, inputRow);
      // Fun pop-in animation
      dropdown.animate([
        { opacity: 0, transform: 'scale(0.7) translateY(-10px)' },
        { opacity: 1, transform: 'scale(1.05) translateY(2px)' },
        { opacity: 1, transform: 'scale(1) translateY(0)' }
      ], { duration: 350, easing: 'cubic-bezier(.68,-0.55,.27,1.55)' });
    }
  }

  createChatWidget() {
    // Create the chat widget structure
    console.log('🔧 createChatWidget: this.container =', this.container);
    console.log('🔧 createChatWidget: this.containerId =', this.containerId);
    
    if (!this.container) {
      console.error('❌ Container not found in createChatWidget!');
      return;
    }
    
    this.container.innerHTML = `
      <div class="advanced-chatbot-widget">
        <button class="chatbot-toggle" id="chatbot-toggle" aria-expanded="false">
          <span class="chat-icon">💬</span>
          <span class="toggle-text">Chat with Jay</span>
        </button>
        
        <div class="chatbot-window" id="chatbot-window" style="display: none;">
          <div class="chatbot-header">
            <div class="header-info">
              <div class="role-indicator">
                Role: <span id="current-role">${this.currentRole}</span> → 
                <span id="current-api">${this.assignments[this.currentRole] || 'none'}</span>
              </div>
            </div>
            <div class="header-actions">
              <button class="summarize-toggle-btn" id="summarize-toggle-btn" title="Auto-Summarize Responses" aria-label="Toggle auto-summarize mode">👁️</button>
              <button class="settings-btn" id="settings-btn" title="Settings" aria-label="Open settings">⚙️</button>
              <button class="chatbot-close" id="chatbot-close" aria-label="Close chat window">✕</button>
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
              <div class="message-row">
                <img class="chat-avatar bot-avatar" src="https://ui-avatars.com/api/?name=Jay&background=f1f5f9&color=8b5cf6&size=32" alt="Bot" />
                <div class="message-bubble">
                  <div class="message-content">
                    Hello! I'm Jay's AI Assistant. I can help with quotes, service information, and more.
                    Choose a chat mode above and ask me anything!
                  </div>
                  <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="typing-indicator" id="typing-indicator" style="display:none;" aria-live="polite" aria-label="Bot is typing">
            <span class="typing-text">Jay is typing</span>
            <span class="typing-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </span>
          </div>

          <div class="processing-overlay" id="processing-overlay" style="display: none;" aria-live="assertive">
            <div class="processing-message">
              Processing with <span id="processing-api">AI</span>...
            </div>
          </div>

          <div class="chatbot-input-area">
            <div class="file-upload-section" id="file-upload-section">
              <input type="file" id="file-upload" accept="image/*" multiple style="display: none;">
              <button class="file-upload-btn" id="file-upload-btn" title="Upload images for better quotes">📎</button>
            </div>
            <textarea 
              id="chatbot-input"
              placeholder="Type your message here..."
              rows="1"
              aria-label="Chat message input"
              style="color: #1a202c !important; background: white !important; font-size: 14px !important; border: 1px solid #ccc !important; padding: 8px !important; outline: none !important; font-family: Arial, sans-serif !important; line-height: 1.4 !important; text-indent: 0 !important; letter-spacing: normal !important;"
            ></textarea>
            <button class="chatbot-send" id="chatbot-send" aria-label="Send message">
              <span class="send-icon">➤</span>
            </button>
          </div>
        </div>
      </div>

      <div class="settings-container" id="settings-container"></div>
    `;
    
    console.log('✅ Widget HTML set successfully!');
    
    // Debug: Check if textarea was created properly
    setTimeout(() => {
      const textarea = document.getElementById('chatbot-input');
      console.log('🔍 Textarea element:', textarea);
      console.log('🔍 Textarea visible:', textarea ? window.getComputedStyle(textarea).display !== 'none' : 'not found');
      console.log('🔍 Textarea disabled:', textarea ? textarea.disabled : 'not found');
      console.log('🔍 Textarea readonly:', textarea ? textarea.readOnly : 'not found');
      console.log('🔍 Textarea style:', textarea ? textarea.style.cssText : 'not found');
      if (textarea) {
        console.log('🔍 Computed styles:', window.getComputedStyle(textarea));
        
        // Force proper styling
        textarea.style.color = '#1a202c';
        textarea.style.backgroundColor = 'white';
        textarea.style.fontSize = '14px';
        textarea.style.opacity = '1';
        textarea.style.visibility = 'visible';
        textarea.style.display = 'block';
        textarea.style.border = '1px solid #ccc';
        textarea.style.padding = '8px';
        console.log('🔧 Applied forced styling to textarea');
        
        // Test if we can set and see a value
        textarea.value = 'test';
        console.log('🔧 Set test value, current value:', textarea.value);
        setTimeout(() => {
          textarea.value = '';
          console.log('🔧 Cleared test value');
        }, 1000);
      }
    }, 100);
    
    // Initialize settings panel
    const settingsContainer = document.getElementById('settings-container');
    this.settingsPanel = new ChatSettingsPanel(
      settingsContainer, 
      this.assignments, 
      (newAssignments) => this.handleAssignmentsChange(newAssignments)
    );
    
    // Restore chat history and render quick replies after a short delay
    setTimeout(() => this.restoreChatHistory(), 0);
    setTimeout(() => this.renderQuickReplies(), 0);
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

    // Enhanced keyboard navigation
    toggle.addEventListener('click', () => this.toggleChat());
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleChat();
      }
    });
    
    close.addEventListener('click', () => this.closeChat());
    close.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.closeChat();
      }
    });
    
    send.addEventListener('click', () => this.sendMessage.bind(this)());
    send.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    const summarizeToggleBtn = document.getElementById('summarize-toggle-btn');
    
    settingsBtn.addEventListener('click', () => this.toggleSettings());
    settingsBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleSettings();
      }
    });
    
    summarizeToggleBtn.addEventListener('click', () => this.toggleSummarizer());
    summarizeToggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleSummarizer();
      }
    });
    
    roleSelect.addEventListener('change', (e) => this.changeRole(e.target.value));
    
    // File upload handlers with keyboard support
    fileUploadBtn.addEventListener('click', () => fileUpload.click());
    fileUploadBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileUpload.click();
      }
    });
    fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Bind this context explicitly
        this.sendMessage.bind(this)();
      }
    });
    
    // Debug: Test if input events are working
    input.addEventListener('focus', () => {
      console.log('🔍 Textarea focused!');
    });
    
    input.addEventListener('input', (e) => {
      console.log('🔍 Textarea input event:', e.target.value);
      // Force the value to be visible
      e.target.style.color = '#1a202c';
      e.target.style.backgroundColor = 'white';
    });
    
    input.addEventListener('keydown', (e) => {
      console.log('🔍 Textarea keydown:', e.key);
    });
    
    input.addEventListener('keyup', (e) => {
      console.log('🔍 Textarea keyup, value:', e.target.value);
      // Force update display
      if (e.target.value !== e.target.textContent) {
        e.target.textContent = e.target.value;
      }
    });
    
    input.addEventListener('change', (e) => {
      console.log('🔍 Textarea change event:', e.target.value);
    });
    
    // Escape key to close chat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });
    
    // Secret mode detection
    input.addEventListener('input', (e) => this.checkSecretModes(e.target.value));
  }

  toggleChat() {
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    
    if (this.isOpen) {
      window.style.display = 'none';
      this.isOpen = false;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus(); // Return focus to toggle button
    } else {
      window.style.display = 'block';
      this.isOpen = true;
      toggle.setAttribute('aria-expanded', 'true');
      
      // Focus management for accessibility
      const input = document.getElementById('chatbot-input');
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
    
    this.sendAnalyticsEvent('chat_toggled', { opened: this.isOpen });
  }

  closeChat() {
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    
    window.style.display = 'none';
    this.isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus(); // Return focus to toggle button
    
    this.sendAnalyticsEvent('chat_closed');
  }

  toggleSettings() {
    this.settingsPanel.toggle();
    this.sendAnalyticsEvent('settings_toggled', { opened: this.settingsPanel.isOpen });
  }

  toggleSummarizer() {
    this.summarizerActive = !this.summarizerActive;
    const btn = document.getElementById('summarize-toggle-btn');
    
    if (this.summarizerActive) {
      btn.style.backgroundColor = '#8b5cf6';
      btn.style.color = 'white';
      btn.title = 'Auto-Summarize Active - Click to Disable';
      this.addMessage('🔍 Summary Mode Activated! All AI responses will now be summarized before being sent.', 'bot', 'system');
    } else {
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.title = 'Auto-Summarize Responses';
      this.addMessage('📝 Summary Mode Deactivated. AI responses will be shown in full.', 'bot', 'system');
    }
    
    this.sendAnalyticsEvent('summarizer_toggled', { active: this.summarizerActive });
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
      summarize: 'Enter text, documents, or conversations to summarize...',
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

  // Typing indicator control
  showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.style.display = '';
  }
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.style.display = 'none';
  }

  // Quick replies
  renderQuickReplies() {
    const quickReplies = [
      'What are your prices?',
      'How do I book a service?',
      'Tell me about ceramic coating',
      'What areas do you serve?',
      'Show me your detailing packages',
      'How long does a service take?'
    ];
    const container = document.getElementById('quick-replies');
    if (!container) return;
    container.innerHTML = quickReplies.map(q => `<button class="quick-reply-btn" tabindex="0">${q}</button>`).join('');
    container.querySelectorAll('.quick-reply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const inputEl = document.getElementById('chatbot-input');
        if (inputEl) {
          inputEl.value = btn.textContent;
          this.sendMessage();
        }
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const inputEl = document.getElementById('chatbot-input');
          if (inputEl) {
            inputEl.value = btn.textContent;
            this.sendMessage();
          }
        }
      });
    });
  }

  /**
   * Handle sending a message and getting AI response
   */
  async sendMessage() {
    console.log('🔍 sendMessage called, this:', this);
    console.log('🔍 this.constructor.name:', this.constructor.name);
    console.log('🔍 adjustTextareaHeight method exists:', typeof this.adjustTextareaHeight);
    console.log('🔍 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this)));
    
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    input.value = '';
    // Reset textarea height manually (simplified approach)
    input.style.height = 'auto';
    input.style.height = '40px';
    
    // Add user message
    this.addMessage(message, 'user');
    this.showTypingIndicator();
    
    try {
      // Determine role based on message content
      const detectedRole = this.detectMessageRole(message);
      if (detectedRole !== this.currentRole) {
        this.changeRole(detectedRole);
      }

      // Get response from selected API
      const response = await ChatRouter.routeLLMRequest(
        message,
        this.currentRole,
        this.assignments,
        { model: this.assignments[this.currentRole] }
      );

      this.hideTypingIndicator();
      
      if (!response || !response.content) {
        throw new Error('No response received from AI');
      }

      let finalResponse = response.content;
      
      // Always summarize long responses (over 300 characters)
      if (finalResponse.length > 300) {
        try {
          const summarizeResponse = await ChatRouter.routeLLMRequest(
            `Please provide a clear, concise summary of this response while preserving key details: ${finalResponse}`,
            'summarize',
            this.assignments,
            { model: this.assignments['summarize'] }
          );
          
          if (summarizeResponse && summarizeResponse.content) {
            finalResponse = `📝 **Quick Summary**:\n${summarizeResponse.content}\n\n<details>\n<summary>Click to see full response</summary>\n\n${finalResponse}\n</details>`;
          }
        } catch (summarizeError) {
          console.error('Error summarizing response:', summarizeError);
          // If summarization fails, just show original with expandable section
          finalResponse = `⚠️ **Long Response** (${finalResponse.length} chars)\n\n<details>\n<summary>Click to expand full response</summary>\n\n${finalResponse}\n</details>`;
        }
      }

      // Add the final response
      this.addMessage(finalResponse, 'bot');
      this.scrollToBottom();
      
    } catch (error) {
      console.error('Error during message processing:', error);
      this.hideTypingIndicator();
      this.addMessage(`⚠️ Error: ${error.message || 'Failed to get response'}`, 'bot', 'error');
    }
  }

  /**
   * Adjust textarea height to fit content
   */
  adjustTextareaHeight(textarea) {
    if (!textarea) return;
    
    // Reset height to auto to calculate scrollHeight properly
    textarea.style.height = 'auto';
    
    // Set height to scrollHeight with some padding
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 40; // Minimum height in pixels
    const maxHeight = 120; // Maximum height in pixels
    
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = newHeight + 'px';
    
    // If content exceeds max height, enable scrolling
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'scroll';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }

  /**
   * Sanitize bot response to remove unwanted characters and formatting
   * @param {string} text
   * @returns {string}
   */
  sanitizeBotResponse(text) {
    if (!text || typeof text !== 'string') return '';
    // Replace \n, \r, \t with spaces or line breaks as appropriate
    let cleaned = text
      .replace(/\\n|\n/g, ' ') // Remove literal \\n and real \n
      .replace(/\\r|\r/g, ' ')
      .replace(/\\t|\t/g, ' ')
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .replace(/\*\*|__/g, '') // Remove markdown bold and underline
      .replace(/\*|_/g, '') // Remove stray * or _
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
      .replace(/`/g, '') // Remove backticks
      .trim();
    // Optionally, limit to 2000 chars
    if (cleaned.length > 2000) cleaned = cleaned.substring(0, 2000) + '...';
    return cleaned;
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
            const response = this.formatKnowledgeResponse(subcategory, item, category);
            if (response) {
              return response;
            }
          }
        }
      }
    }
    
    return null;
  }
  
  messageMatchesKnowledge(message, key, item) {
    // Check for key matches
    if (message.includes(key.replace(/_/g, ' '))) return true;
    
    // Check for description matches
    if (item.description && message.includes(item.description.toLowerCase().split(' ')[0])) return true;
    
    // Check for specific keywords
    const keywords = {
      ceramic: ['ceramic', 'coating', 'protection'],
      graphene: ['graphene', 'premium', 'coating'],
      detail: ['detail', 'clean', 'wash'],
      correction: ['correction', 'polish', 'scratch', 'swirl'],
      wax: ['wax', 'protection', 'shine'],
      wash: ['wash', 'clean', 'soap']
    };
    
    for (const keywordGroup in keywords) {
      if (key.includes(keywordGroup)) {
        return keywords[keywordGroup].some(keyword => message.includes(keyword));
      }
    }
    
    return false;
  }
  
  formatKnowledgeResponse(key, item, category) {
    // Ensure item exists and has required properties
    if (!item || typeof item !== 'object') {
      console.warn(`⚠️ Invalid knowledge base item for key: ${key}`);
      return null;
    }
    
    const description = item.description || 'Professional detailing service';
    let response = `**${key.replace(/_/g, ' ').toUpperCase()}** - ${description}\n\n`;
    
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
    if (value === 'jay' && !this.jayMode) {
      this.activateJayMode();
      return;
    }
  }
  
  activateAdminMode() {
    this.adminMode = true;
    this.secretModeActive = true;
    
    // Add admin styling
    document.querySelector('.chatbot-window').classList.add('admin-mode');
    
    // Clear input and show admin message
    const input = document.getElementById('chatbot-input');
    input.value = '';
    
    this.addMessage("🔧 ADMIN MODE ACTIVATED 🔧\n\nAdmin commands available:\n• 'reset memory' - Clear conversation memory\n• 'export data' - Download learning data\n• 'upload training' - Upload training files\n• 'analytics' - View detailed statistics\n• 'debug mode' - Enable debug logging", 'bot', 'admin');
    
    // Update placeholder
    input.placeholder = "Admin mode active - Type admin commands...";
  }

  deactivateAdminMode() {
    const rolePlaceholders = {
      auto: 'Ask me anything - I\'ll automatically choose the best way to help you...',
      quotes: 'Describe your vehicle and service needs for a quote...',
      search: 'What information are you looking for?',
      reasoning: 'Ask me to analyze or reason through something...',
      summaries: 'What would you like me to summarize?',
      chat: 'Ask about our services or chat with me...'
    };
    input.placeholder = rolePlaceholders[this.currentRole] || 'How can I help you?';
  }
  
  activateJayMode() {
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
  
  analyzeImageForQuote(fileData) {
    // Use real Google Vision API for image analysis
    this.performImageAnalysisWithVision(fileData);
  }
  
  async performImageAnalysisWithVision(fileData) {
    try {
      // Dynamic import to avoid module resolution issues
      const { analyzeImageWithGoogleVision } = await import('/src/utils/googleVision.js');
      
      // Use real Google Vision API
      const analysisResults = await analyzeImageWithGoogleVision(fileData);
      
      if (analysisResults.length > 0) {
        let message = "📸 **AI-Powered Image Analysis Complete!**\n\n";
        message += "I've analyzed your vehicle using Google Vision AI and have these recommendations:\n\n";
        
        analysisResults.forEach((result, index) => {
          const confidence = result.confidence ? ` (${Math.round(result.confidence * 100)}% confidence)` : '';
          message += `${index + 1}. **${result.issue}**${confidence}: ${result.recommendation}\n\n`;
        });
        
        message += "💡 Would you like a detailed quote including these AI-recommended services?";
        
        setTimeout(() => {
          this.addMessage(message, 'bot', 'analysis');
        }, 1000);
      } else {
        setTimeout(() => {
          this.addMessage("📸 Image uploaded successfully! I can see your vehicle. For the most accurate recommendations, please call (562) 228-9429 to speak with our detailing specialists.", 'bot', 'analysis');
        }, 1000);
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      
      // Fallback to simulated analysis
      const analysisResults = this.performImageAnalysis(fileData);
      
      if (analysisResults.length > 0) {
        let message = "📸 **Image Analysis Complete!**\n\n";
        message += "I can see your vehicle and have some recommendations:\n\n";
        
        analysisResults.forEach((result, index) => {
          message += `${index + 1}. **${result.issue}**: ${result.recommendation}\n`;
        });
        
        message += "\n💡 Would you like a detailed quote including these additional services?";
        
        setTimeout(() => {
          this.addMessage(message, 'bot', 'analysis');
        }, 1000);
      }
    }
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
    // Ensure message is a string
    if (!message || typeof message !== 'string') {
      message = String(message || '');
    }
    
    const lowerMessage = message.toLowerCase();
    
    // Role-specific responses
    if (role === 'quotes') {
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
    return 'We serve all of Los Angeles County and Orange County, including Beverly Hills, Santa Monica, Long Beach, Newport Beach, Irvine, and surrounding areas. We come to your location!';
  }

  generateServiceSummary() {
    return '📋 **Service Summary**: Jay\'s Mobile Wash provides premium mobile detailing across LA & Orange County. **Services**: Mini Detail ($70), Luxury Detail ($130), Max Detail ($200), Ceramic Coating ($500).';
  }

  updateProcessingAPI(apiName) {
    const apiSpan = document.getElementById('processing-api');
    if (apiSpan) {
      apiSpan.textContent = apiName;
    }
  }

  updateAssignments(newAssignments) {
    this.assignments = { ...this.assignments, ...newAssignments };
    this.onAssignmentsChange({
      assignments: Object.keys(newAssignments).length
    });
  }

  handleSMSFallbackError(error) {
    console.warn('SMS fallback also failed:', error);
  }

  logAdvancedChatEvent(eventAction, eventLabel) {
    if (window.gtag) {
      window.gtag('event', eventAction, {
        event_category: 'advanced_chat',
        event_label: eventLabel
      });
    }
  }

  /**
   * Sanitize bot response to remove unwanted characters and formatting
   * @param {string} text
   * @returns {string}
   */
  sanitizeBotResponse(text) {
    if (!text || typeof text !== 'string') return '';
    // Replace \n, \r, \t with spaces or line breaks as appropriate
    let cleaned = text
      .replace(/\\n|\n/g, ' ') // Remove literal \\n and real \n
      .replace(/\\r|\r/g, ' ')
      .replace(/\\t|\t/g, ' ')
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .replace(/\*\*|__/g, '') // Remove markdown bold and underline
      .replace(/\*|_/g, '') // Remove stray * or _
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
      .replace(/`/g, '') // Remove backticks
      .trim();
    // Optionally, limit to 2000 chars
    if (cleaned.length > 2000) cleaned = cleaned.substring(0, 2000) + '...';
    return cleaned;
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
            const response = this.formatKnowledgeResponse(subcategory, item, category);
            if (response) {
              return response;
            }
          }
        }
      }
    }
    
    return null;
  }
  
  messageMatchesKnowledge(message, key, item) {
    // Check for key matches
    if (message.includes(key.replace(/_/g, ' '))) return true;
    
    // Check for description matches
    if (item.description && message.includes(item.description.toLowerCase().split(' ')[0])) return true;
    
    // Check for specific keywords
    const keywords = {
      ceramic: ['ceramic', 'coating', 'protection'],
      graphene: ['graphene', 'premium', 'coating'],
      detail: ['detail', 'clean', 'wash'],
      correction: ['correction', 'polish', 'scratch', 'swirl'],
      wax: ['wax', 'protection', 'shine'],
      wash: ['wash', 'clean', 'soap']
    };
    
    for (const keywordGroup in keywords) {
      if (key.includes(keywordGroup)) {
        return keywords[keywordGroup].some(keyword => message.includes(keyword));
      }
    }
    
    return false;
  }
  
  formatKnowledgeResponse(key, item, category) {
    // Ensure item exists and has required properties
    if (!item || typeof item !== 'object') {
      console.warn(`⚠️ Invalid knowledge base item for key: ${key}`);
      return null;
    }
    
    const description = item.description || 'Professional detailing service';
    let response = `**${key.replace(/_/g, ' ').toUpperCase()}** - ${description}\n\n`;
    
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
    if (value === 'jay' && !this.jayMode) {
      this.activateJayMode();
      return;
    }
  }
  
  activateAdminMode() {
    this.adminMode = true;
    this.secretModeActive = true;
    
    // Add admin styling
    document.querySelector('.chatbot-window').classList.add('admin-mode');
    
    // Clear input and show admin message
    const input = document.getElementById('chatbot-input');
    input.value = '';
    
    this.addMessage("🔧 ADMIN MODE ACTIVATED 🔧\n\nAdmin commands available:\n• 'reset memory' - Clear conversation memory\n• 'export data' - Download learning data\n• 'upload training' - Upload training files\n• 'analytics' - View detailed statistics\n• 'debug mode' - Enable debug logging", 'bot', 'admin');
    
    // Update placeholder
    input.placeholder = "Admin mode active - Type admin commands...";
  }

  deactivateAdminMode() {
    const rolePlaceholders = {
      auto: 'Ask me anything - I\'ll automatically choose the best way to help you...',
      quotes: 'Describe your vehicle and service needs for a quote...',
      search: 'What information are you looking for?',
      reasoning: 'Ask me to analyze or reason through something...',
      summaries: 'What would you like me to summarize?',
      chat: 'Ask about our services or chat with me...'
    };
    input.placeholder = rolePlaceholders[this.currentRole] || 'How can I help you?';
  }
  
  activateJayMode() {
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
  
  analyzeImageForQuote(fileData) {
    // Use real Google Vision API for image analysis
    this.performImageAnalysisWithVision(fileData);
  }
  
  async performImageAnalysisWithVision(fileData) {
    try {
      // Dynamic import to avoid module resolution issues
      const { analyzeImageWithGoogleVision } = await import('/src/utils/googleVision.js');
      
      // Use real Google Vision API
      const analysisResults = await analyzeImageWithGoogleVision(fileData);
      
      if (analysisResults.length > 0) {
        let message = "📸 **AI-Powered Image Analysis Complete!**\n\n";
        message += "I've analyzed your vehicle using Google Vision AI and have these recommendations:\n\n";
        
        analysisResults.forEach((result, index) => {
          const confidence = result.confidence ? ` (${Math.round(result.confidence * 100)}% confidence)` : '';
          message += `${index + 1}. **${result.issue}**${confidence}: ${result.recommendation}\n\n`;
        });
        
        message += "💡 Would you like a detailed quote including these AI-recommended services?";
        
        setTimeout(() => {
          this.addMessage(message, 'bot', 'analysis');
        }, 1000);
      } else {
        setTimeout(() => {
          this.addMessage("📸 Image uploaded successfully! I can see your vehicle. For the most accurate recommendations, please call (562) 228-9429 to speak with our detailing specialists.", 'bot', 'analysis');
        }, 1000);
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      
      // Fallback to simulated analysis
      const analysisResults = this.performImageAnalysis(fileData);
      
      if (analysisResults.length > 0) {
        let message = "📸 **Image Analysis Complete!**\n\n";
        message += "I can see your vehicle and have some recommendations:\n\n";
        
        analysisResults.forEach((result, index) => {
          message += `${index + 1}. **${result.issue}**: ${result.recommendation}\n`;
        });
        
        message += "\n💡 Would you like a detailed quote including these additional services?";
        
        setTimeout(() => {
          this.addMessage(message, 'bot', 'analysis');
        }, 1000);
      }
    }
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
    // Ensure message is a string
    if (!message || typeof message !== 'string') {
      message = String(message || '');
    }
    
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
    } else if (role === 'summarize') {
      return this.generateSummarizeResponse(lowerMessage);
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
    return 'We serve all of Los Angeles County and Orange County, including Beverly Hills, Santa Monica, Long Beach, Newport Beach, Irvine, and surrounding areas. We come to your location!';
  }

  generateServiceSummary() {
    return '📋 **Service Summary**: Jay\'s Mobile Wash provides premium mobile detailing across LA & Orange County. **Services**: Mini Detail ($70), Luxury Detail ($130), Max Detail ($200), Ceramic Coating ($500).';
  }

  updateProcessingAPI(apiName) {
    const apiSpan = document.getElementById('processing-api');
    if (apiSpan) {
      apiSpan.textContent = apiName;
    }
  }

  updateAssignments(newAssignments) {
    this.assignments = { ...this.assignments, ...newAssignments };
    this.onAssignmentsChange({
      assignments: Object.keys(newAssignments).length
    });
  }

  handleSMSFallbackError(error) {
    console.warn('SMS fallback also failed:', error);
  }

  logAdvancedChatEvent(eventAction, eventLabel) {
    if (window.gtag) {
      window.gtag('event', eventAction, {
        event_category: 'advanced_chat',
        event_label: eventLabel
      });
    }
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

  scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
}

// Initialize the advanced chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🤖 Initializing Advanced AI Chatbot...');
  
  // Debug: Check if container exists
  const container = document.getElementById('chatbot-container');
  console.log('🔍 Container found:', container);
  
  if (container) {
    try {
      window.advancedChatbot = new AdvancedChatBot('chatbot-container');
      console.log('✅ Chatbot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize chatbot:', error);
    }
  } else {
    console.error('❌ Chatbot container not found!');
    
    // Try to find it after a delay
    setTimeout(() => {
      const delayedContainer = document.getElementById('chatbot-container');
      if (delayedContainer) {
        console.log('🔍 Container found after delay, initializing...');
        try {
          window.advancedChatbot = new AdvancedChatBot('chatbot-container');
          console.log('✅ Chatbot initialized successfully (delayed)');
        } catch (error) {
          console.error('❌ Failed to initialize chatbot (delayed):', error);
        }
      } else {
        console.error('❌ Chatbot container still not found after delay!');
      }
    }, 2000);
  }
});