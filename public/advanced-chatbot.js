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
    endpoint: '/api/deepseek',
    description: 'DeepSeek AI models via Hugging Face',
    enabled: true
  },
  {
    id: 'llama2',
    name: 'Llama2 (HuggingFace)',
    endpoint: '/api/llama2',
    description: 'Meta Llama2 models via Hugging Face',
    enabled: true
  },
  {
    id: 'openrouter-gpt4',
    name: 'GPT-4 (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'OpenAI GPT-4 via OpenRouter',
    model: 'openai/gpt-4',
    enabled: true
  },
  {
    id: 'openrouter-claude',
    name: 'Claude 3.5 Sonnet (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Anthropic Claude 3.5 Sonnet via OpenRouter',
    model: 'anthropic/claude-3.5-sonnet',
    enabled: true
  },
  {
    id: 'openrouter-llama',
    name: 'Llama 3.1 70B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Meta Llama 3.1 70B via OpenRouter',
    model: 'meta-llama/llama-3.1-70b-instruct',
    enabled: true
  },
  {
    id: 'openrouter-deepseek',
    name: 'DeepSeek R1 (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'DeepSeek R1 via OpenRouter',
    model: 'deepseek/deepseek-r1',
    enabled: true
  },
  {
    id: 'openrouter-gemini',
    name: 'Gemini Pro (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Google Gemini Pro via OpenRouter',
    model: 'google/gemini-pro',
    enabled: true
  },
  {
    id: 'openrouter-qwen',
    name: 'Qwen 2.5 72B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Qwen 2.5 72B via OpenRouter',
    model: 'qwen/qwen-2.5-72b-instruct',
    enabled: true
  },
  {
    id: 'openrouter-mixtral',
    name: 'Mixtral 8x7B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Mistral Mixtral 8x7B via OpenRouter',
    model: 'mistralai/mixtral-8x7b-instruct',
    enabled: true
  },
  {
    id: 'openrouter-perplexity',
    name: 'Perplexity Llama 3.1 Sonar (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Perplexity Llama 3.1 Sonar for web search and reasoning',
    model: 'perplexity/llama-3.1-sonar-large-128k-online',
    enabled: true
  },
  {
    id: 'openrouter-gemini-pro',
    name: 'Gemini Pro 1.5 (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Google Gemini Pro 1.5 via OpenRouter',
    model: 'google/gemini-pro-1.5',
    enabled: true
  },
  {
    id: 'openrouter-gpt4o',
    name: 'GPT-4o (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'OpenAI GPT-4o via OpenRouter',
    model: 'openai/gpt-4o',
    enabled: true
  },
  {
    id: 'openrouter-claude-opus',
    name: 'Claude 3 Opus (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Anthropic Claude 3 Opus via OpenRouter',
    model: 'anthropic/claude-3-opus',
    enabled: true
  },
  {
    id: 'openrouter-llama-405b',
    name: 'Llama 3.1 405B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Meta Llama 3.1 405B Instruct via OpenRouter',
    model: 'meta-llama/llama-3.1-405b-instruct',
    enabled: true
  },
  {
    id: 'openrouter-wizard-8x22b',
    name: 'WizardLM 8x22B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'WizardLM 8x22B via OpenRouter',
    model: 'microsoft/wizardlm-2-8x22b',
    enabled: true
  },
  {
    id: 'openrouter-nous-hermes',
    name: 'Nous Hermes 2 Mixtral (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Nous Research Hermes 2 Mixtral via OpenRouter',
    model: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
    enabled: true
  },
  {
    id: 'openrouter-mythomax',
    name: 'MythoMax 13B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Gryphe MythoMax 13B via OpenRouter',
    model: 'gryphe/mythomax-l2-13b',
    enabled: true
  },
  {
    id: 'openrouter-yi-34b',
    name: 'Yi 34B Chat (OpenRouter)',
    endpoint: '/api/openrouter',
    description: '01-ai Yi 34B Chat via OpenRouter',
    model: '01-ai/yi-34b-chat',
    enabled: true
  },
  {
    id: 'openrouter-dolphin-mixtral',
    name: 'Dolphin Mixtral 8x7B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Cognitive Computations Dolphin Mixtral via OpenRouter',
    model: 'cognitivecomputations/dolphin-mixtral-8x7b',
    enabled: true
  },
  {
    id: 'openrouter-solar-10b',
    name: 'Solar 10.7B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Upstage Solar 10.7B Instruct via OpenRouter',
    model: 'upstage/solar-1-mini-chat',
    enabled: true
  },
  {
    id: 'openrouter-phind-codellama',
    name: 'Phind CodeLlama 34B (OpenRouter)',
    endpoint: '/api/openrouter',
    description: 'Phind CodeLlama 34B Python via OpenRouter',
    model: 'phind/phind-codellama-34b',
    enabled: true
  },
  {
    id: 'openai',
    name: 'OpenAI GPT (Direct)',
    endpoint: '/api/openai',
    description: 'OpenAI GPT models (direct API)',
    enabled: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude (Direct)',
    endpoint: '/api/anthropic',
    description: 'Claude AI for detailed analysis (direct API)',
    enabled: false
  },
  {
    id: 'google',
    name: 'Google Gemini (Direct)',
    endpoint: '/api/google',
    description: 'Google Gemini AI (direct API)',
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
    name: 'Mistral AI (Direct)',
    endpoint: '/api/mistral',
    description: 'Mistral AI models (direct API)',
    enabled: false
  },
  {
    id: 'together',
    name: 'Together AI',
    endpoint: '/api/together',
    description: 'Together AI platform',
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
  auto: 'openrouter-gpt4',         // Auto mode - GPT-4 for smart detection
  reasoning: 'openrouter-claude',  // Advanced reasoning - Claude 3.5 Sonnet
  tools: 'openrouter-gpt4',        // Tool calling - GPT-4 is excellent at tools
  quotes: 'deepseek',              // Service quotes - DeepSeek for pricing analysis
  photo_uploads: 'openrouter-gpt4', // Photo analysis - GPT-4 Vision
  summaries: 'openrouter-claude',  // Summarization - Claude is great at this
  search: 'openrouter-gemini',     // Search queries - Gemini knowledge
  chat: 'llama2',                  // General chat - Llama2 for conversation
  fallback: 'deepseek',           // Always available fallback - use DeepSeek
  analytics: 'openrouter-claude',  // Data analysis - Claude excels at analysis
  accessibility: 'openrouter-gpt4' // Accessibility support - GPT-4 is helpful
};

/**
 * AI Utility Functions
 */
class AIUtils {
  static async queryAI(prompt, options = {}) {
    const { endpoint = '/api/ai', role, model } = options;

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

      // Include model in request body if provided (for OpenRouter)
      if (model) {
        requestBody.model = model;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Provide more specific error information for better debugging
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
      return await AIUtils.queryAI(enhancedPrompt, { endpoint: '/api/deepseek', role });
    } else if (api.id === 'llama2') {
      return await AIUtils.queryAI(enhancedPrompt, { endpoint: '/api/llama2', role });
    } else if (api.id === 'openai') {
      return await AIUtils.queryAI(enhancedPrompt, { endpoint: '/api/openai', role });
    } else if (api.id.startsWith('openrouter-')) {
      // All OpenRouter models use the same endpoint but different model parameters
      const requestBody = {
        prompt: enhancedPrompt,
        role: role,
        model: api.model || 'deepseek/deepseek-r1-0528-qwen3-8b:free'
      };
      return await AIUtils.queryAI(enhancedPrompt, { 
        endpoint: '/api/openrouter', 
        role: role,
        model: api.model 
      });
    } else {
      // For other APIs, fall back to DeepSeek instead of OpenAI
      const deepseekAPI = this.getAPIById('deepseek');
      if (deepseekAPI && deepseekAPI.enabled) {
        console.warn(`API '${api.name}' not yet implemented, using DeepSeek fallback`);
        return await AIUtils.queryAI(enhancedPrompt, { endpoint: '/api/deepseek', role });
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
    console.log('🔍 Looking for container:', containerId);
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
    // Persistent memory for the current chat session
    this.sessionMemory = this.loadSessionMemory();
    this.memory = this.sessionMemory;
    
    // Secret modes
    this.adminMode = false;
    this.jayMode = false;
    this.secretModeActive = false;
    
    // File upload system
    this.uploadedFiles = [];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    this.loadAssignments();
    this.init();

    // Rating system state
    this.lastBotMessageId = null;
    this.ratings = this.loadRatings();
    this.isRatingActive = false;
  }

  // Load persistent memory for the current chat session
  loadSessionMemory() {
    try {
      const saved = localStorage.getItem('chatbot-session-memory');
      if (saved) {
        const obj = JSON.parse(saved);
        const mem = new ConversationMemory();
        mem.conversations = obj.conversations || [];
        mem.keywords = new Map(obj.keywords || []);
        mem.responses = obj.responses || {};
        mem.userPreferences = obj.userPreferences || {};
        return mem;
      }
    } catch (e) {}
    return new ConversationMemory();
  }

  // Save session memory after each message
  saveSessionMemory() {
    try {
      localStorage.setItem('chatbot-session-memory', JSON.stringify({
        conversations: this.memory.conversations,
        keywords: [...this.memory.keywords.entries()],
        responses: this.memory.responses,
        userPreferences: this.memory.userPreferences
      }));
    } catch (e) {}
  }

  // Clear session memory (call when chat is closed)
  clearSessionMemory() {
    localStorage.removeItem('chatbot-session-memory');
    this.memory = new ConversationMemory();
    this.saveSessionMemory();
  }

  // Ratings persistence
  loadRatings() {
    try {
      return JSON.parse(localStorage.getItem('chatbot-ratings') || '[]');
    } catch (e) { return []; }
  }
  saveRatings() {
    try {
      localStorage.setItem('chatbot-ratings', JSON.stringify(this.ratings));
    } catch (e) {}
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
    console.log('🔧 Creating chat widget...');
    const widget = document.createElement('div');
    widget.className = 'advanced-chatbot-widget';
    console.log('🔧 Widget created:', widget);
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
    
    console.log('🔧 Appending widget to container...');
    this.container.appendChild(widget);
    console.log('✅ Widget appended successfully!');
    
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
    // Clear session memory when chat is closed
    this.clearSessionMemory();
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

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message || this.isProcessing) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    
    // SMS notification fully removed for compliance and privacy
    
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
          // Determine the effective role for processing
          let effectiveRole = this.currentRole;
          if (this.currentRole === 'auto') {
            effectiveRole = this.detectBestRole(message);
            console.log(`Auto mode detected best role: ${effectiveRole} for message: "${message.substring(0, 50)}..."`);
          }
          
          // Fall back to AI or smart responses
          const assignedAPI = this.assignments[effectiveRole];
          
          if (assignedAPI === 'none' || !assignedAPI) {
            response = { content: this.generateSmartResponse(message, effectiveRole) };
          } else {
            try {
              response = await ChatRouter.routeLLMRequest(message, effectiveRole, this.assignments);
            } catch (aiError) {
              console.warn('AI failed, using smart fallback:', aiError);
              response = { content: this.generateSmartResponse(message, effectiveRole) };
            }
          }
        }
      }
      
      const responseText = response.content || response.generated_text || JSON.stringify(response, null, 2);
      this.addMessage(responseText, 'bot');
      
      // Record conversation for learning
      this.memory.recordConversation(message, responseText, {
        role: this.currentRole,
        hasImages: this.uploadedFiles.length > 0,
        timestamp: Date.now()
      });
      this.saveSessionMemory();
      // Show rating UI for this bot message
      this.lastBotMessageId = this.memory.conversations.length > 0 ? this.memory.conversations[this.memory.conversations.length - 1].id : null;
      this.showRatingUI(this.lastBotMessageId);
      // Clear uploaded files after processing
      this.clearUploadedFiles();
      this.sendAnalyticsEvent('chat_query_success', {
        role: this.currentRole,
        api: this.assignments[this.currentRole],
        usedBasefile: !!basefileResponse,
        usedMemory: !!this.memory.getLearnedResponse(message)
      });
  // Show rating UI below the last bot message
  showRatingUI(messageId) {
    if (!messageId) return;
    const messagesDiv = document.getElementById('chatbot-messages');
    if (!messagesDiv) return;
    // Remove any existing rating UI
    const old = document.getElementById('chatbot-rating-ui');
    if (old) old.remove();
    // Find the last bot message element
    const botMessages = messagesDiv.querySelectorAll('.bot-message');
    if (botMessages.length === 0) return;
    const lastBot = botMessages[botMessages.length - 1];
    // Create rating UI
    const ratingDiv = document.createElement('div');
    ratingDiv.id = 'chatbot-rating-ui';
    ratingDiv.style.margin = '8px 0 0 0';
    ratingDiv.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;font-size:15px;">
        <span>Rate this answer:</span>
        <button class="chatbot-rating-star" data-rating="1">★</button>
        <button class="chatbot-rating-star" data-rating="2">★</button>
        <button class="chatbot-rating-star" data-rating="3">★</button>
        <button class="chatbot-rating-star" data-rating="4">★</button>
        <button class="chatbot-rating-star" data-rating="5">★</button>
        <input type="text" id="chatbot-rating-feedback" placeholder="Optional feedback..." style="margin-left:8px;font-size:13px;padding:2px 6px;border-radius:4px;border:1px solid #ccc;" maxlength="120">
        <button id="chatbot-rating-submit" style="margin-left:4px;font-size:13px;">Submit</button>
      </div>
    `;
    lastBot.appendChild(ratingDiv);
    // Add event listeners
    ratingDiv.querySelectorAll('.chatbot-rating-star').forEach(btn => {
      btn.addEventListener('click', e => {
        ratingDiv.querySelectorAll('.chatbot-rating-star').forEach(b => b.style.color = '');
        e.target.style.color = '#fbbf24';
        ratingDiv.dataset.selected = e.target.dataset.rating;
      });
    });
    ratingDiv.querySelector('#chatbot-rating-submit').addEventListener('click', () => {
      const rating = parseInt(ratingDiv.dataset.selected || '0');
      const feedback = ratingDiv.querySelector('#chatbot-rating-feedback').value.trim();
      if (rating > 0) {
        this.saveRating(messageId, rating, feedback);
        this.showRatingThankYou(rating);
      } else {
        alert('Please select a star rating.');
      }
    });
    this.isRatingActive = true;
  }

  // Save rating for a message
  saveRating(messageId, rating, feedback) {
    this.ratings.push({
      messageId,
      rating,
      feedback,
      timestamp: Date.now()
    });
    this.saveRatings();
    // Optionally, use feedback to improve memory (simple example: store good feedback as learned response)
    if (rating >= 4 && feedback) {
      // Find the conversation
      const conv = this.memory.conversations.find(c => c.id === messageId);
      if (conv) {
        this.memory.responses[conv.userMessage] = conv.botResponse + '\n\nUser feedback: ' + feedback;
        this.saveSessionMemory();
      }
    }
  }

  // Show thank you after rating
  showRatingThankYou(rating) {
    const ratingDiv = document.getElementById('chatbot-rating-ui');
    if (ratingDiv) {
      ratingDiv.innerHTML = `<span style='color:#22c55e;font-weight:600;'>Thank you for your feedback! (${rating}★)</span>`;
      setTimeout(() => { if (ratingDiv) ratingDiv.remove(); }, 2000);
    }
    this.isRatingActive = false;
  }

  // Add message to chat
  addMessage(content, sender, type = 'normal') {
    const messagesDiv = document.getElementById('chatbot-messages');
    if (!messagesDiv) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message ${type}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = content.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(messageContent);
    messagesDiv.appendChild(messageDiv);
    
    this.scrollToBottom();
  }

  // Show processing overlay
  showProcessing() {
    const overlay = document.getElementById('processing-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      const apiSpan = document.getElementById('processing-api');
      if (apiSpan) {
        apiSpan.textContent = this.assignments[this.currentRole] || 'AI';
      }
    }
  }

  // Hide processing overlay
  hideProcessing() {
    const overlay = document.getElementById('processing-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // Scroll to bottom of messages
  scrollToBottom() {
    const messagesDiv = document.getElementById('chatbot-messages');
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }

  // Handle assignment changes
  handleAssignmentsChange(newAssignments) {
    this.assignments = newAssignments;
    this.saveAssignments();
    // Update current API display
    document.getElementById('current-api').textContent = this.assignments[this.currentRole] || 'none';
  }

  // Send analytics event (placeholder)
  sendAnalyticsEvent(eventName, data = {}) {
    console.log('Analytics:', eventName, data);
  }

  // Missing generateSearchResponse, generateReasoningResponse, generateSummaryResponse functions
  generateSearchResponse(message) {
    if (message.includes('hours') || message.includes('time')) {
      return 'We\'re available 7 days a week! Call (562) 228-9429 to schedule. Our typical hours are flexible to accommodate your schedule.';
    } else if (message.includes('location') || message.includes('where')) {
      return 'We provide mobile service throughout Los Angeles County and Orange County. We come directly to your location - home, office, or anywhere convenient for you!';
    } else if (message.includes('contact') || message.includes('phone')) {
      return 'You can reach us at (562) 228-9429 or email info@jaysmobilewash.net. We\'re here to help with all your mobile detailing needs!';
    }
    return 'I can help you find information about our services, locations, hours, and contact details. What specific information are you looking for?';
  }

  generateReasoningResponse(message) {
    if (message.includes('why') && message.includes('ceramic')) {
      return 'Ceramic coating is recommended because it provides 2+ years of protection, makes your car easier to wash, enhances gloss, and protects against UV damage. It\'s a great investment for maintaining your vehicle\'s value and appearance.';
    } else if (message.includes('why') && message.includes('detail')) {
      return 'Regular detailing is important because it removes contaminants that can damage your paint, maintains your vehicle\'s value, improves safety (clean windows/lights), and keeps your car looking and feeling great.';
    } else if (message.includes('how') && message.includes('choose')) {
      return 'Choose based on your needs: Mini Detail ($70) for basic maintenance, Luxury Detail ($130) for comprehensive care, or Max Detail ($200) for deep cleaning. Consider your vehicle\'s condition and how often you detail.';
    }
    return 'I can help analyze your detailing needs and explain the reasoning behind our service recommendations. What would you like me to analyze for you?';
  }

  generateSummaryResponse(message) {
    if (message.includes('services') || message.includes('what')) {
      return '**Jay\'s Mobile Wash Services Summary:**\n\n• **Mini Detail** ($70): Basic wash & interior\n• **Luxury Detail** ($130): Comprehensive cleaning\n• **Max Detail** ($200): Premium full service\n• **Ceramic Coating** ($450): 2+ year protection\n• **Graphene Coating** ($800): Premium 3+ year protection\n\nWe serve LA & Orange County with mobile service. Call (562) 228-9429 to book!';
    }
    return 'I can summarize our services, processes, or pricing for you. What would you like me to summarize?';
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