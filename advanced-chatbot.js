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
    id: 'auto',
    name: 'Auto Mode',
    description: 'Automatically selects the best chat method based on your input'
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

/**
 * Fleet Management System 🚗🚙🚕
 * Manages multiple vehicles for businesses and families
 */
class FleetManager {
  constructor() {
    this.fleet = this.loadFleet();
    this.currentVehicle = null;
  }
  
  loadFleet() {
    try {
      return JSON.parse(localStorage.getItem('chatbot-fleet') || '[]');
    } catch (error) {
      console.warn('Failed to load fleet:', error);
      return [];
    }
  }
  
  saveFleet() {
    try {
      localStorage.setItem('chatbot-fleet', JSON.stringify(this.fleet));
    } catch (error) {
      console.warn('Failed to save fleet:', error);
    }
  }
  
  addVehicle(vehicleData) {
    const vehicle = {
      id: Date.now() + Math.random(),
      ...vehicleData,
      addedDate: new Date().toISOString(),
      lastService: null,
      serviceHistory: [],
      nextServiceDue: null,
      totalSpent: 0
    };
    
    this.fleet.push(vehicle);
    this.saveFleet();
    return vehicle;
  }
  
  removeVehicle(vehicleId) {
    this.fleet = this.fleet.filter(v => v.id !== vehicleId);
    this.saveFleet();
  }
  
  updateVehicle(vehicleId, updates) {
    const vehicle = this.fleet.find(v => v.id === vehicleId);
    if (vehicle) {
      Object.assign(vehicle, updates);
      this.saveFleet();
    }
    return vehicle;
  }
  
  recordService(vehicleId, serviceData) {
    const vehicle = this.fleet.find(v => v.id === vehicleId);
    if (vehicle) {
      const service = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...serviceData
      };
      
      vehicle.serviceHistory.push(service);
      vehicle.lastService = service.date;
      vehicle.totalSpent += serviceData.cost || 0;
      
      // Calculate next service due (3 months for maintenance)
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 3);
      vehicle.nextServiceDue = nextDue.toISOString();
      
      this.saveFleet();
      return service;
    }
    return null;
  }
  
  getFleetSummary() {
    const totalVehicles = this.fleet.length;
    const totalSpent = this.fleet.reduce((sum, v) => sum + v.totalSpent, 0);
    const vehiclesDue = this.fleet.filter(v => 
      v.nextServiceDue && new Date(v.nextServiceDue) <= new Date()
    ).length;
    
    return {
      totalVehicles,
      totalSpent,
      vehiclesDue,
      avgSpentPerVehicle: totalVehicles > 0 ? totalSpent / totalVehicles : 0
    };
  }
  
  optimizeSchedule() {
    // AI-powered fleet scheduling optimization
    const dueForService = this.fleet.filter(v => 
      v.nextServiceDue && new Date(v.nextServiceDue) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
    );
    
    // Group by location for efficient routing
    const locationGroups = {};
    dueForService.forEach(vehicle => {
      const location = vehicle.location || 'Unknown';
      if (!locationGroups[location]) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(vehicle);
    });
    
    // Calculate bulk pricing
    const bulkDiscount = dueForService.length >= 3 ? 0.15 : dueForService.length >= 2 ? 0.10 : 0;
    
    return {
      vehiclesDue: dueForService,
      locationGroups,
      bulkDiscount,
      estimatedSavings: dueForService.length * 130 * bulkDiscount // Assuming avg $130 service
    };
  }
  
  getBulkPricing(vehicleCount) {
    // Dynamic bulk pricing that adjusts based on fleet size
    let discount = 0;
    if (vehicleCount >= 10) discount = 0.25; // 25% for 10+ vehicles
    else if (vehicleCount >= 5) discount = 0.20; // 20% for 5-9 vehicles  
    else if (vehicleCount >= 3) discount = 0.15; // 15% for 3-4 vehicles
    else if (vehicleCount >= 2) discount = 0.10; // 10% for 2 vehicles
    
    return {
      discount,
      description: vehicleCount >= 10 ? 'Enterprise Fleet Discount' :
                  vehicleCount >= 5 ? 'Business Fleet Discount' :
                  vehicleCount >= 3 ? 'Multi-Vehicle Discount' :
                  vehicleCount >= 2 ? 'Family Fleet Discount' : 'Standard Pricing'
    };
  }
}

/**
 * Enhanced Self-Learning Conversation Memory System with Real-Time Learning Loop 🔄
 */
class ConversationMemory {
  constructor() {
    this.conversations = this.loadConversations();
    this.keywords = this.loadKeywords();
    this.responses = this.loadResponses();
    this.userPreferences = this.loadUserPreferences();
    this.satisfactionRatings = this.loadSatisfactionRatings();
    this.conversationPatterns = this.loadConversationPatterns();
    this.learningStats = this.loadLearningStats();
  }
  
  loadSatisfactionRatings() {
    try {
      return JSON.parse(localStorage.getItem('chatbot-satisfaction') || '[]');
    } catch (error) {
      return [];
    }
  }
  
  saveSatisfactionRatings() {
    try {
      localStorage.setItem('chatbot-satisfaction', JSON.stringify(this.satisfactionRatings));
    } catch (error) {
      console.warn('Failed to save satisfaction ratings:', error);
    }
  }
  
  loadConversationPatterns() {
    try {
      return JSON.parse(localStorage.getItem('chatbot-patterns') || '{}');
    } catch (error) {
      return {};
    }
  }
  
  saveConversationPatterns() {
    try {
      localStorage.setItem('chatbot-patterns', JSON.stringify(this.conversationPatterns));
    } catch (error) {
      console.warn('Failed to save conversation patterns:', error);
    }
  }
  
  loadLearningStats() {
    try {
      return JSON.parse(localStorage.getItem('chatbot-learning-stats') || '{"totalInteractions": 0, "successfulResponses": 0, "learningAccuracy": 0}');
    } catch (error) {
      return {"totalInteractions": 0, "successfulResponses": 0, "learningAccuracy": 0};
    }
  }
  
  saveLearningStats() {
    try {
      localStorage.setItem('chatbot-learning-stats', JSON.stringify(this.learningStats));
    } catch (error) {
      console.warn('Failed to save learning stats:', error);
    }
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
      return saved ? JSON.parse(saved) : new Map();
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
  
  // Real-Time Learning Loop Implementation 🔄
  reinforcePattern(conversation) {
    // Bot learns from successful interactions
    this.satisfactionRatings.push({
      conversationId: conversation.id,
      rating: 'positive',
      timestamp: Date.now(),
      userMessage: conversation.userMessage,
      botResponse: conversation.botResponse
    });
    
    // Update success patterns
    const patterns = conversation.patterns || {};
    Object.keys(patterns).forEach(pattern => {
      if (!this.conversationPatterns[pattern]) {
        this.conversationPatterns[pattern] = { successCount: 0, failCount: 0 };
      }
      this.conversationPatterns[pattern].successCount++;
    });
    
    this.learningStats.successfulResponses++;
    this.updateLearningAccuracy();
    this.saveSatisfactionRatings();
    this.saveConversationPatterns();
    this.saveLearningStats();
  }
  
  adjustStrategy(conversation) {
    // Bot adjusts when responses aren't satisfactory
    this.satisfactionRatings.push({
      conversationId: conversation.id,
      rating: 'negative',
      timestamp: Date.now(),
      userMessage: conversation.userMessage,
      botResponse: conversation.botResponse
    });
    
    // Update failure patterns to avoid similar responses
    const patterns = conversation.patterns || {};
    Object.keys(patterns).forEach(pattern => {
      if (!this.conversationPatterns[pattern]) {
        this.conversationPatterns[pattern] = { successCount: 0, failCount: 0 };
      }
      this.conversationPatterns[pattern].failCount++;
    });
    
    this.updateLearningAccuracy();
    this.saveSatisfactionRatings();
    this.saveConversationPatterns();
    this.saveLearningStats();
  }
  
  detectConversationPatterns(userMessage, botResponse) {
    const patterns = {};
    const lowerUser = userMessage.toLowerCase();
    const lowerBot = botResponse.toLowerCase();
    
    // Detect question types
    if (lowerUser.includes('?')) patterns.questionType = true;
    if (lowerUser.includes('price') || lowerUser.includes('cost')) patterns.pricingInquiry = true;
    if (lowerUser.includes('book') || lowerUser.includes('schedule')) patterns.bookingIntent = true;
    if (lowerUser.includes('compare') || lowerUser.includes('vs')) patterns.comparisonRequest = true;
    
    // Detect response patterns
    if (lowerBot.includes('call') && lowerBot.includes('562')) patterns.phoneCallToAction = true;
    if (lowerBot.includes('$')) patterns.priceInResponse = true;
    if (lowerBot.includes('ceramic') || lowerBot.includes('graphene')) patterns.premiumServiceMention = true;
    
    return patterns;
  }
  
  updateConversationPatterns(conversation) {
    const patterns = conversation.patterns || {};
    
    // Update pattern frequency
    Object.keys(patterns).forEach(pattern => {
      if (!this.conversationPatterns[pattern]) {
        this.conversationPatterns[pattern] = { 
          frequency: 0, 
          successCount: 0, 
          failCount: 0,
          lastSeen: Date.now()
        };
      }
      this.conversationPatterns[pattern].frequency++;
      this.conversationPatterns[pattern].lastSeen = Date.now();
    });
    
    this.saveConversationPatterns();
  }
  
  updateLearningStats() {
    this.learningStats.totalInteractions++;
    this.updateLearningAccuracy();
    this.saveLearningStats();
  }
  
  updateLearningAccuracy() {
    if (this.learningStats.totalInteractions > 0) {
      this.learningStats.learningAccuracy = 
        (this.learningStats.successfulResponses / this.learningStats.totalInteractions) * 100;
    }
  }
  
  getLearningInsights() {
    const topPatterns = Object.entries(this.conversationPatterns)
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, 5);
      
    const recentSatisfaction = this.satisfactionRatings
      .filter(r => Date.now() - r.timestamp < 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .reduce((acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
      }, {});
    
    return {
      totalInteractions: this.learningStats.totalInteractions,
      learningAccuracy: this.learningStats.learningAccuracy.toFixed(1),
      topPatterns: topPatterns,
      recentSatisfaction: recentSatisfaction,
      conversationCount: this.conversations.length
    };
  }

  recordConversation(userMessage, botResponse, context = {}) {
    const conversation = {
      timestamp: Date.now(),
      userMessage: userMessage,
      botResponse: botResponse,
      context: context,
      id: Date.now() + Math.random(),
      patterns: this.detectConversationPatterns(userMessage, botResponse)
    };
    
    this.conversations.push(conversation);
    
    // Keep only last 1000 conversations
    if (this.conversations.length > 1000) {
      this.conversations = this.conversations.slice(-1000);
    }
    
    this.extractKeywords(userMessage);
    this.updateConversationPatterns(conversation);
    this.updateLearningStats();
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
 * Enhanced Chat Router with Multi-Brain Architecture 🧠🧠🧠
 * Different AI models optimized for different tasks
 */
class ChatRouter {
  // Multi-Brain Architecture - Different models for specialized tasks
  static BRAIN_POOL = {
    salesBrain: {
      name: 'Sales & Negotiation Expert',
      specialties: ['quotes', 'pricing', 'upselling', 'closing'],
      model: 'deepseek',
      prompt_prefix: 'You are Jay\'s premium sales expert. Focus on value, benefits, and closing deals. '
    },
    speedBrain: {
      name: 'Quick Response Expert', 
      specialties: ['chat', 'basic_questions', 'greetings'],
      model: 'none', // Uses local responses for speed
      prompt_prefix: 'Provide quick, helpful responses. '
    },
    visionBrain: {
      name: 'Image Analysis Expert',
      specialties: ['photo_uploads', 'visual_analysis'],
      model: 'deepseek',
      prompt_prefix: 'You are an expert car detailing analyst. Analyze images and recommend services. '
    },
    memoryBrain: {
      name: 'Learning & Memory Expert',
      specialties: ['personalization', 'history', 'preferences'],
      model: 'deepseek',
      prompt_prefix: 'You remember past conversations and personalize responses. '
    },
    reasoningBrain: {
      name: 'Analysis & Logic Expert',
      specialties: ['reasoning', 'comparisons', 'explanations'],
      model: 'deepseek',
      prompt_prefix: 'You provide detailed analysis and logical explanations. '
    }
  };
  
  static selectOptimalBrain(role, context = {}) {
    // Conversation Surgeon 🔬 - Intelligent brain selection
    const { hasImages, isRepeatCustomer, urgencyLevel, complexity } = context;
    
    // High-priority routing logic
    if (hasImages) return this.BRAIN_POOL.visionBrain;
    if (isRepeatCustomer) return this.BRAIN_POOL.memoryBrain;
    if (urgencyLevel === 'high') return this.BRAIN_POOL.speedBrain;
    if (complexity === 'high') return this.BRAIN_POOL.reasoningBrain;
    
    // Role-based routing
    const brainForRole = Object.values(this.BRAIN_POOL).find(brain => 
      brain.specialties.includes(role)
    );
    
    return brainForRole || this.BRAIN_POOL.speedBrain;
  }
  
  // Conversation Surgeon 🔬 - Real-time conversation analysis
  static analyzeConversationIntent(message, conversationHistory = []) {
    const analysis = {
      buyingSignals: this.detectBuyingSignals(message),
      doubtIndicators: this.detectDoubt(message),
      priceSensitivity: this.detectPriceSensitivity(message),
      vipPatterns: this.detectVIPPatterns(message, conversationHistory),
      emotionalState: this.detectEmotionalState(message),
      urgencyLevel: this.detectUrgency(message),
      complexity: this.assessComplexity(message)
    };
    
    return analysis;
  }
  
  static detectBuyingSignals(message) {
    const buyingKeywords = [
      'book', 'schedule', 'when can', 'available', 'how soon', 
      'lets do', 'go ahead', 'sign me up', 'ready to', 'want to proceed'
    ];
    
    const signals = buyingKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    return {
      detected: signals.length > 0,
      strength: signals.length,
      keywords: signals,
      recommendation: signals.length > 0 ? 'Close the deal now!' : 'Continue nurturing'
    };
  }
  
  static detectDoubt(message) {
    const doubtKeywords = [
      'not sure', 'maybe', 'think about', 'expensive', 'too much',
      'compared to', 'other options', 'hesitant', 'unsure'
    ];
    
    const doubts = doubtKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    return {
      detected: doubts.length > 0,
      level: doubts.length,
      keywords: doubts,
      recommendation: doubts.length > 0 ? 'Provide social proof and testimonials' : 'Continue with benefits'
    };
  }
  
  static detectPriceSensitivity(message) {
    const priceKeywords = [
      'cheap', 'affordable', 'budget', 'cost', 'expensive', 'discount',
      'deal', 'promotion', 'save money', 'lower price'
    ];
    
    const priceWords = priceKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    return {
      detected: priceWords.length > 0,
      sensitivity: priceWords.length,
      keywords: priceWords,
      recommendation: priceWords.length > 0 ? 'Offer payment plans or value packages' : 'Focus on quality and benefits'
    };
  }
  
  static detectVIPPatterns(message, history) {
    const vipIndicators = [
      'luxury', 'premium', 'best', 'highest quality', 'top tier',
      'don\'t care about price', 'money no object', 'executive', 'business owner'
    ];
    
    const vipWords = vipIndicators.filter(indicator => 
      message.toLowerCase().includes(indicator)
    );
    
    const historyVIPCount = history.filter(msg => 
      vipIndicators.some(indicator => msg.toLowerCase().includes(indicator))
    ).length;
    
    return {
      detected: vipWords.length > 0 || historyVIPCount > 2,
      level: vipWords.length + historyVIPCount,
      keywords: vipWords,
      recommendation: (vipWords.length > 0 || historyVIPCount > 2) ? 
        'Trigger white-glove VIP service treatment' : 'Standard service approach'
    };
  }
  
  static detectEmotionalState(message) {
    const emotions = {
      frustrated: ['frustrated', 'annoyed', 'angry', 'upset', 'disappointed'],
      excited: ['excited', 'amazing', 'awesome', 'love', 'perfect'],
      concerned: ['worried', 'concerned', 'nervous', 'afraid', 'anxious'],
      satisfied: ['happy', 'pleased', 'satisfied', 'good', 'great']
    };
    
    let detectedEmotion = 'neutral';
    let emotionStrength = 0;
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
      const matches = keywords.filter(keyword => 
        message.toLowerCase().includes(keyword)
      );
      
      if (matches.length > emotionStrength) {
        detectedEmotion = emotion;
        emotionStrength = matches.length;
      }
    }
    
    return {
      emotion: detectedEmotion,
      strength: emotionStrength,
      recommendation: this.getEmotionalResponseStrategy(detectedEmotion)
    };
  }
  
  static getEmotionalResponseStrategy(emotion) {
    const strategies = {
      frustrated: 'Adjust tone to be more empathetic and solution-focused',
      excited: 'Match their enthusiasm and provide premium options',
      concerned: 'Provide reassurance and detailed explanations',
      satisfied: 'Maintain positive momentum and suggest additional services',
      neutral: 'Standard professional approach'
    };
    
    return strategies[emotion] || strategies.neutral;
  }
  
  static detectUrgency(message) {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediately', 'today', 'now', 'quick'];
    const urgentCount = urgentKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    ).length;
    
    return urgentCount > 0 ? 'high' : 'normal';
  }
  
  static assessComplexity(message) {
    const complexIndicators = [
      'compare', 'analyze', 'explain', 'detailed', 'comprehensive',
      'multiple', 'various', 'different options', 'pros and cons'
    ];
    
    const complexityScore = complexIndicators.filter(indicator => 
      message.toLowerCase().includes(indicator)
    ).length;
    
    return complexityScore > 2 ? 'high' : complexityScore > 0 ? 'medium' : 'low';
  }

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
    this.currentRole = 'auto';
    this.settingsPanel = null;
    this.quoteEngine = new ChatQuoteEngine();
    this.memory = new ConversationMemory();
    this.fleetManager = new FleetManager(); // Fleet Sync 🚗🚙🚕
    
    // Secret modes
    this.adminMode = false;
    this.jayMode = false;
    this.secretModeActive = false;
    
    // File upload system
    this.uploadedFiles = [];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // Conversation history for analysis
    this.conversationHistory = [];
    
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
              Hello! I'm Jay's AI Assistant in Auto Mode. I'll automatically select the best chat method based on your questions.
              You can also manually choose a chat mode above. Ask me anything about our services!
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

  detectBestChatMode(message) {
    const lowerMessage = message.toLowerCase();
    
    // Keywords for different modes
    const quoteKeywords = ['quote', 'price', 'cost', 'how much', '$', 'pricing', 'estimate', 'package', 'service', 'ceramic', 'graphene', 'detail'];
    const photoKeywords = ['photo', 'image', 'picture', 'pic', 'look at', 'analyze', 'see'];
    const searchKeywords = ['search', 'find', 'lookup', 'locate', 'where', 'location', 'address'];
    const reasoningKeywords = ['compare', 'difference', 'why', 'how', 'explain', 'versus', 'vs', 'analyze', 'recommend'];
    const toolKeywords = ['schedule', 'book', 'appointment', 'call', 'contact'];
    
    // Check for uploaded files (implies photo mode)
    if (this.uploadedFiles.length > 0) {
      return 'photo_uploads';
    }
    
    // Check for quote-related queries
    if (quoteKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'quotes';
    }
    
    // Check for photo analysis queries
    if (photoKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'photo_uploads';
    }
    
    // Check for search queries
    if (searchKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'search';
    }
    
    // Check for reasoning queries
    if (reasoningKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'reasoning';
    }
    
    // Check for tool/action queries
    if (toolKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'tools';
    }
    
    // Default to chat for general conversation
    return 'chat';
  }

  updateDetectedMode(detectedMode) {
    // Update the role indicator to show auto-detected mode
    const currentApiSpan = document.getElementById('current-api');
    const currentRoleSpan = document.getElementById('current-role');
    
    if (currentRoleSpan) {
      currentRoleSpan.textContent = `auto → ${detectedMode}`;
    }
    
    if (currentApiSpan) {
      currentApiSpan.textContent = this.assignments[detectedMode] || 'none';
    }
    
    // Add a temporary notification about mode detection
    const modeNotification = document.createElement('div');
    modeNotification.className = 'auto-mode-notification';
    modeNotification.innerHTML = `<small>Auto-detected: ${this.getRoleById(detectedMode)?.name || detectedMode}</small>`;
    
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.appendChild(modeNotification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      if (modeNotification.parentNode) {
        modeNotification.parentNode.removeChild(modeNotification);
      }
    }, 3000);
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message || this.isProcessing) return;
    
    // Add to conversation history for analysis
    this.conversationHistory.push(message);
    
    // Conversation Surgeon 🔬 - Analyze conversation intent
    const conversationAnalysis = ChatRouter.analyzeConversationIntent(message, this.conversationHistory);
    
    // Auto-mode detection with enhanced context
    let effectiveRole = this.currentRole;
    if (this.currentRole === 'auto') {
      effectiveRole = this.detectBestChatMode(message);
      this.updateDetectedMode(effectiveRole);
    }
    
    // Select optimal brain based on Multi-Brain Architecture 🧠🧠🧠
    const context = {
      hasImages: this.uploadedFiles.length > 0,
      isRepeatCustomer: this.memory.conversations.length > 5,
      urgencyLevel: conversationAnalysis.urgencyLevel,
      complexity: conversationAnalysis.complexity,
      emotionalState: conversationAnalysis.emotionalState.emotion,
      buyingSignals: conversationAnalysis.buyingSignals.detected
    };
    
    const selectedBrain = ChatRouter.selectOptimalBrain(effectiveRole, context);
    
    this.addMessage(message, 'user');
    input.value = '';
    
    // Show which brain is processing
    this.showProcessing(selectedBrain.name);
    
    this.isProcessing = true;
    
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
          // Use Multi-Brain Architecture with enhanced prompting
          const enhancedPrompt = this.enhancePromptWithBrainContext(message, selectedBrain, conversationAnalysis);
          
          const assignedAPI = this.assignments[effectiveRole];
          
          if (assignedAPI === 'none' || !assignedAPI) {
            response = { content: this.generateSmartResponse(message, effectiveRole, conversationAnalysis) };
          } else {
            try {
              response = await ChatRouter.routeLLMRequest(enhancedPrompt, effectiveRole, this.assignments);
            } catch (aiError) {
              console.warn('AI failed, using smart fallback:', aiError);
              response = { content: this.generateSmartResponse(message, effectiveRole, conversationAnalysis) };
            }
          }
        }
      }
      
      const responseText = response.content || response.generated_text || JSON.stringify(response, null, 2);
      
      // Apply conversation optimization based on analysis
      const optimizedResponse = this.optimizeResponseBasedOnAnalysis(responseText, conversationAnalysis);
      
      this.addMessage(optimizedResponse, 'bot');
      
      // Record conversation for learning with enhanced context
      this.memory.recordConversation(message, optimizedResponse, {
        role: effectiveRole,
        originalRole: this.currentRole,
        hasImages: this.uploadedFiles.length > 0,
        timestamp: Date.now(),
        brainUsed: selectedBrain.name,
        conversationAnalysis: conversationAnalysis
      });
      
      // Real-time learning - analyze if this was a good response
      this.performRealTimeLearning(message, optimizedResponse, conversationAnalysis);
      
      // Clear uploaded files after processing
      this.clearUploadedFiles();
      
      this.sendAnalyticsEvent('chat_query_success', {
        role: effectiveRole,
        originalRole: this.currentRole,
        api: this.assignments[effectiveRole],
        brainUsed: selectedBrain.name,
        buyingSignals: conversationAnalysis.buyingSignals.detected,
        emotionalState: conversationAnalysis.emotionalState.emotion,
        usedBasefile: !!basefileResponse,
        usedMemory: !!this.memory.getLearnedResponse(message),
        autoDetected: this.currentRole === 'auto'
      });
    } catch (error) {
      console.error('Chat error:', error);
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
    
    // Check for admin mode ("josh")
    if (value === 'josh' && !this.adminMode) {
      this.activateAdminMode();
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
    
    const learningInsights = this.memory.getLearningInsights();
    const fleetSummary = this.fleetManager.getFleetSummary();
    
    this.addMessage(`🔧 ADMIN MODE ACTIVATED 🔧

Advanced Admin Commands Available:

📊 **Analytics & Learning**:
• 'learning stats' - View real-time learning insights
• 'conversation patterns' - Show detected patterns
• 'reset memory' - Clear conversation memory
• 'export data' - Download learning data

🚗 **Fleet Management**:
• 'fleet summary' - Show fleet statistics
• 'fleet optimization' - Optimize scheduling
• 'add vehicle' - Add vehicle to fleet
• 'fleet analytics' - Detailed fleet analytics

🧠 **AI Brain Control**:
• 'brain status' - Show Multi-Brain Architecture status
• 'switch brain' - Manually switch AI brain
• 'conversation analysis' - Real-time conversation insights

📈 **Current Status**:
• Learning Accuracy: ${learningInsights.learningAccuracy}%
• Total Interactions: ${learningInsights.totalInteractions}
• Fleet Vehicles: ${fleetSummary.totalVehicles}
• Total Fleet Revenue: $${fleetSummary.totalSpent}

Type any command to get started!`, 'bot', 'admin');
    
    // Update placeholder
    input.placeholder = "Admin mode active - Type admin commands...";
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
    // Advanced Visual Vehicle Inspector with AI-powered analysis
    const fullAnalysis = this.analyzeVehicleCondition(fileData);
    const analysisResults = fullAnalysis.issues;
    const recommendedPackage = this.recommendPackageByDirtLevel(fullAnalysis.dirtLevel);
    
    if (analysisResults.length > 0 || fullAnalysis.dirtLevel > 0) {
      let message = "📸 **Visual Vehicle Inspector Results**\n\n";
      message += `🔍 **AI Analysis Complete!**\n`;
      message += `**Dirtiness Level**: ${fullAnalysis.dirtLevel}/10 (${fullAnalysis.condition})\n`;
      message += `**Recommended Package**: ${recommendedPackage.name} - $${recommendedPackage.price}\n`;
      message += `**Reason**: ${recommendedPackage.reason}\n\n`;
      
      if (fullAnalysis.insights.length > 0) {
        message += `🧠 **AI Insights**:\n`;
        fullAnalysis.insights.forEach(insight => {
          message += `• ${insight}\n`;
        });
        message += "\n";
      }
      
      if (analysisResults.length > 0) {
        message += "🔧 **Specific Issues Detected**:\n\n";
        analysisResults.forEach((result, index) => {
          const severity = result.severity === 'high' ? '🔴' : result.severity === 'medium' ? '🟡' : '🟢';
          message += `${index + 1}. ${severity} **${result.issue}**: ${result.recommendation}\n\n`;
        });
      }
      
      message += "💰 **Smart Pricing**: AI has calculated the optimal service package for your vehicle's condition.\n";
      message += "📞 Call (562) 228-9429 and mention this AI analysis for priority scheduling!";
      
      setTimeout(() => {
        this.addMessage(message, 'bot', 'analysis');
      }, 1500); // Slightly longer delay for more realistic AI processing
    }
  }
  
  performImageAnalysis(fileData) {
    // Advanced Visual Vehicle Inspector 📸
    // Simulates Google Vision API with intelligent dirt level detection
    const vehicleAnalysis = this.analyzeVehicleCondition(fileData);
    const dirtLevel = vehicleAnalysis.dirtLevel;
    const recommendedPackage = this.recommendPackageByDirtLevel(dirtLevel);
    
    const analysis = {
      dirtLevel: dirtLevel,
      overallCondition: vehicleAnalysis.condition,
      recommendedPackage: recommendedPackage,
      issues: vehicleAnalysis.issues,
      aiInsights: vehicleAnalysis.insights
    };
    
    // Store analysis for learning
    this.memory.updateUserPreference('lastVehicleAnalysis', analysis);
    
    return analysis.issues;
  }
  
  analyzeVehicleCondition(fileData) {
    // Simulated AI vision analysis - in production would use Google Vision API
    const fileName = fileData.name.toLowerCase();
    const fileSize = fileData.size;
    
    // Simulate analysis based on file characteristics and random factors
    let dirtLevel = Math.floor(Math.random() * 10) + 1; // 1-10 scale
    let condition = 'fair';
    let insights = [];
    
    // Adjust analysis based on file name clues
    if (fileName.includes('dirty') || fileName.includes('mud') || fileName.includes('dust')) {
      dirtLevel = Math.max(dirtLevel, 7);
    }
    if (fileName.includes('clean') || fileName.includes('wash') || fileName.includes('shine')) {
      dirtLevel = Math.min(dirtLevel, 3);
    }
    
    // Determine overall condition
    if (dirtLevel <= 3) {
      condition = 'excellent';
      insights.push("Vehicle appears well-maintained with minimal contamination");
    } else if (dirtLevel <= 6) {
      condition = 'good';
      insights.push("Regular maintenance visible, standard cleaning recommended");
    } else if (dirtLevel <= 8) {
      condition = 'fair';
      insights.push("Moderate contamination detected, comprehensive cleaning needed");
    } else {
      condition = 'poor';
      insights.push("Heavy contamination detected, intensive restoration required");
    }
    
    // Generate specific issues based on dirt level
    const allIssues = [
      {
        issue: "Surface Dirt Accumulation",
        recommendation: "Basic wash and decontamination (+$0 - included in package)",
        severity: 'low',
        minDirtLevel: 3
      },
      {
        issue: "Paint Swirl Marks Detected",
        recommendation: "Paint correction would restore that showroom shine. Add single-stage correction (+$300) or multi-stage for deeper scratches (+$600)",
        severity: 'medium',
        minDirtLevel: 5
      },
      {
        issue: "Wheel Contamination Visible", 
        recommendation: "Professional wheel cleaning and ceramic coating for wheels (+$150) would provide long-lasting protection",
        severity: 'medium',
        minDirtLevel: 4
      },
      {
        issue: "Water Spots on Paint",
        recommendation: "Paint decontamination and ceramic coating (+$450) would prevent future water spotting and make maintenance easier",
        severity: 'high',
        minDirtLevel: 6
      },
      {
        issue: "Oxidized Headlights",
        recommendation: "Headlight restoration service (+$80) would improve visibility and vehicle appearance",
        severity: 'medium',
        minDirtLevel: 7
      },
      {
        issue: "Interior Wear Visible",
        recommendation: "Leather conditioning and interior protection (+$100) would restore and preserve your interior",
        severity: 'medium',
        minDirtLevel: 5
      },
      {
        issue: "Heavy Environmental Contamination",
        recommendation: "Multi-stage paint correction and protective coating (+$800) for complete restoration",
        severity: 'high',
        minDirtLevel: 8
      },
      {
        issue: "Chrome/Trim Oxidation",
        recommendation: "Metal polish and protective treatment (+$120) to restore shine and prevent corrosion",
        severity: 'medium',
        minDirtLevel: 7
      }
    ];
    
    // Select relevant issues based on dirt level
    const relevantIssues = allIssues.filter(issue => dirtLevel >= issue.minDirtLevel);
    const selectedIssues = relevantIssues.slice(0, Math.min(4, relevantIssues.length));
    
    return {
      dirtLevel: dirtLevel,
      condition: condition,
      issues: selectedIssues,
      insights: insights
    };
  }
  
  recommendPackageByDirtLevel(dirtLevel) {
    // AI-powered package recommendation based on dirt level
    if (dirtLevel <= 3) {
      return {
        name: "Mini Detail",
        price: 70,
        reason: "Light maintenance - your vehicle is in great condition!"
      };
    } else if (dirtLevel <= 5) {
      return {
        name: "Luxury Detail", 
        price: 130,
        reason: "Standard deep clean - perfect for regular maintenance"
      };
    } else if (dirtLevel <= 7) {
      return {
        name: "Max Detail",
        price: 200,
        reason: "Comprehensive restoration - your vehicle needs extra attention"
      };
    } else if (dirtLevel <= 8) {
      return {
        name: "Max Detail + Ceramic Coating",
        price: 650,
        reason: "Heavy contamination detected - protection needed after deep clean"
      };
    } else {
      return {
        name: "Ultimate Restoration Package",
        price: 1000,
        reason: "Extreme contamination - full paint correction and graphene protection recommended"
      };
    }
  }
  
  enhancePromptWithBrainContext(message, brain, analysis) {
    let enhancedPrompt = brain.prompt_prefix + message;
    
    // Add context based on conversation analysis
    if (analysis.buyingSignals.detected) {
      enhancedPrompt += '\n[CONTEXT: Customer showing buying signals - focus on closing the deal]';
    }
    
    if (analysis.doubtIndicators.detected) {
      enhancedPrompt += '\n[CONTEXT: Customer has doubts - provide reassurance and social proof]';
    }
    
    if (analysis.priceSensitivity.detected) {
      enhancedPrompt += '\n[CONTEXT: Price sensitive customer - offer value and payment options]';
    }
    
    if (analysis.vipPatterns.detected) {
      enhancedPrompt += '\n[CONTEXT: VIP customer detected - provide premium white-glove service]';
    }
    
    if (analysis.emotionalState.emotion !== 'neutral') {
      enhancedPrompt += `\n[CONTEXT: Customer emotion: ${analysis.emotionalState.emotion} - ${analysis.emotionalState.recommendation}]`;
    }
    
    return enhancedPrompt;
  }
  
  optimizeResponseBasedOnAnalysis(response, analysis) {
    let optimizedResponse = response;
    
    // Add buying signal closure
    if (analysis.buyingSignals.detected && analysis.buyingSignals.strength > 1) {
      optimizedResponse += '\n\n🎯 **Ready to move forward?** Call (562) 228-9429 now to secure your appointment!';
    }
    
    // Add social proof for doubt
    if (analysis.doubtIndicators.detected) {
      optimizedResponse += '\n\n⭐ **Customer Success**: "Jay\'s team transformed my car - absolutely worth every penny!" - Recent 5-star review';
    }
    
    // Add payment options for price sensitivity
    if (analysis.priceSensitivity.detected) {
      optimizedResponse += '\n\n💳 **Flexible Payment**: We offer payment plans and package deals to fit any budget!';
    }
    
    // Add VIP treatment
    if (analysis.vipPatterns.detected) {
      optimizedResponse += '\n\n👑 **VIP Experience**: As a premium customer, you\'ll receive our exclusive white-glove service with priority scheduling!';
    }
    
    return optimizedResponse;
  }
  
  performRealTimeLearning(message, response, analysis) {
    // Simulate learning based on conversation patterns
    const conversation = {
      id: Date.now(),
      userMessage: message,
      botResponse: response,
      patterns: analysis
    };
    
    // Positive learning signals
    if (analysis.buyingSignals.detected || analysis.vipPatterns.detected) {
      this.memory.reinforcePattern(conversation);
    }
    
    // Negative learning signals (need improvement)
    if (analysis.doubtIndicators.detected && analysis.doubtIndicators.level > 2) {
      this.memory.adjustStrategy(conversation);
    }
  }
  
  showProcessing(brainName = 'AI') {
    const overlay = document.getElementById('processing-overlay');
    const apiSpan = document.getElementById('processing-api');
    apiSpan.textContent = `${brainName} (${this.assignments[this.currentRole] || 'local'})`;
    overlay.style.display = 'flex';
  }

  generateSmartResponse(message, role, analysis = null) {
    const lowerMessage = message.toLowerCase();
    
    // Use conversation analysis for smarter responses
    if (analysis) {
      // Handle buying signals
      if (analysis.buyingSignals.detected) {
        return `Great! I can sense you're ready to move forward. Let me get you connected with our booking team right away. Call (562) 228-9429 and mention you spoke with our AI assistant for priority scheduling!`;
      }
      
      // Handle doubt indicators
      if (analysis.doubtIndicators.detected) {
        return `I understand your concerns. Thousands of satisfied customers in LA and Orange County trust Jay's Mobile Wash. We offer a satisfaction guarantee and have over 500 five-star reviews. Would you like me to share some recent customer testimonials?`;
      }
      
      // Handle price sensitivity
      if (analysis.priceSensitivity.detected) {
        return `I completely understand wanting great value for your investment. Our services actually save you money long-term by protecting your car's value. We also offer flexible payment options and package deals. Call (562) 228-9429 to discuss pricing options that work for your budget!`;
      }
      
      // Handle VIP patterns
      if (analysis.vipPatterns.detected) {
        return `As someone who appreciates premium quality, you'll love our exclusive VIP service. We use only the finest products and techniques, with personalized attention to every detail. Our Graphene Coating ($800) is perfect for discerning customers like yourself. Shall I arrange a priority consultation?`;
      }
    }
    
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
    
    // Enhanced general chat responses with emotional intelligence
    const responses = {
      'hello': 'Hello! I\'m Jay\'s AI Assistant with advanced vehicle analysis capabilities. I can provide quotes, analyze car photos, and help with service information. What can I do for you?',
      'hi': 'Hi there! I\'m powered by our Multi-Brain AI Architecture to give you the best possible assistance. How can I help with Jay\'s Mobile Wash services today?',
      'price': 'Our AI-optimized pricing ranges from $70 for Mini Detail to $800 for Graphene Coating. I can analyze your vehicle\'s photos to recommend the perfect package. Would you like to upload an image for personalized recommendations?',
      'pricing': 'Our intelligent pricing system: Mini Detail ($70), Luxury Detail ($130), Max Detail ($200), Ceramic Coating ($450), Graphene Coating ($800). Upload a photo for AI-powered recommendations!',
      'book': 'Excellent choice! Our AI system has detected you\'re ready to book. Call (562) 228-9429 for immediate scheduling, or would you like me to analyze your vehicle first for the optimal service package?',
      'booking': 'Perfect timing! I can help optimize your booking. Call (562) 228-9429 and mention our AI analysis for VIP treatment. What type of vehicle and service are you considering?',
      'contact': 'Reach Jay\'s Mobile Wash at (562) 228-9429 or email info@jaysmobilewash.net. Mention you used our advanced AI assistant for priority service throughout Los Angeles and Orange County!',
      'location': 'We provide AI-optimized mobile detailing routes throughout Los Angeles County and Orange County. Our fleet management system ensures efficient service delivery directly to your location!',
      'service': 'Our AI-enhanced services include: Smart Mobile Detailing ($70-$200), Advanced Ceramic Coating ($450), and Premium Graphene Coating ($800). Each uses our intelligent analysis system. Which interests you most?',
      'services': 'Our advanced service portfolio: AI-Optimized Mobile Detailing (Mini $70, Luxury $130, Max $200), Intelligent Ceramic Coating ($450), Premium Graphene Coating ($800). Upload photos for personalized recommendations!',
      'ceramic': 'Our AI-Enhanced Ceramic Coating ($450) includes professional paint analysis and correction with a 2-year warranty. The system intelligently optimizes application for maximum protection. Ready to schedule?',
      'detailing': 'Our intelligent detailing packages: Mini Detail ($70) - AI-optimized basic service; Luxury Detail ($130) - comprehensive smart cleaning; Max Detail ($200) - premium AI-guided full service. Which matches your needs?',
      'how': 'I use advanced AI including Visual Vehicle Inspector, Multi-Brain Architecture, and Real-Time Learning to provide intelligent service recommendations. What would you like to know more about?',
      'what': 'Jay\'s Mobile Wash features cutting-edge AI technology for vehicle analysis, fleet management, and intelligent service optimization. We serve LA and Orange County with premium mobile detailing. What service interests you?'
    };

    // Find matching response
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Default intelligent response
    if (lowerMessage.includes('?')) {
      return 'That\'s an excellent question! Our AI system is designed to provide detailed, personalized assistance. For comprehensive information about our services, pricing, or scheduling, please call (562) 228-9429. Our team can provide expert guidance for your mobile detailing needs.';
    }

    return 'Thanks for your message! I\'m Jay\'s advanced AI assistant, powered by Multi-Brain Architecture for optimal responses. For immediate assistance with premium mobile detailing services, call (562) 228-9429. What specific service can I help you learn about?';
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
    
    // Enhanced auto-scroll behavior
    this.scrollToBottom();
    
    // Add scroll controls if not already present
    this.addScrollControls();
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    // Smooth scroll to bottom
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  addScrollControls() {
    const messagesContainer = document.getElementById('chatbot-messages');
    
    // Check if scroll controls already exist
    if (document.querySelector('.scroll-controls')) return;
    
    // Only add scroll controls if content overflows
    if (messagesContainer.scrollHeight > messagesContainer.clientHeight) {
      const scrollControls = document.createElement('div');
      scrollControls.className = 'scroll-controls';
      scrollControls.innerHTML = `
        <button class="scroll-to-top" title="Scroll to top">↑</button>
        <button class="scroll-to-bottom" title="Scroll to bottom">↓</button>
      `;
      
      messagesContainer.parentNode.insertBefore(scrollControls, messagesContainer.nextSibling);
      
      // Add event listeners
      scrollControls.querySelector('.scroll-to-top').addEventListener('click', () => {
        messagesContainer.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      scrollControls.querySelector('.scroll-to-bottom').addEventListener('click', () => {
        this.scrollToBottom();
      });
    }
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