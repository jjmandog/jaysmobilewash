/**
 * AI Model Router - Enhanced Multi-Model Routing System
 * Routes requests to the best model based on:
 * 1. User preference (explicit model selection)
 * 2. Role requirements (what type of task)
 * 3. Context analysis (message content, history)
 * 4. Model capabilities and costs
 */

const apiRegistry = require('./apiRegistry').default;
const API_OPTIONS = require('../constants/apiOptions').API_OPTIONS;
const DEFAULT_ROLE_ASSIGNMENTS = require('../constants/apiOptions').DEFAULT_ROLE_ASSIGNMENTS;

class ModelRouter {
  constructor() {
    this.modelScores = new Map();
    this.modelCapabilities = new Map();
    this.initializeModelCapabilities();
  }

  /**
   * Initialize model capability scores for different tasks
   */
  initializeModelCapabilities() {
    // Define model strengths (0-1 scale) for different capabilities
    const capabilities = {
      llama4_maverick: {
        reasoning: 0.95,
        deep_analysis: 0.9,
        tools: 0.85,
        multi_language: 0.8
      },
      codellama: {
        tools: 0.95,
        reasoning: 0.8,
        analytics: 0.85
      },
      llama33: {
        general: 0.9,
        multi_language: 0.85,
        summaries: 0.8
      },
      deepseek: {
        chat: 0.9,
        quotes: 0.85,
        search: 0.8
      },
      openrouter: {
        general: 0.85,
        fallback: 0.9,
        chat: 0.85
      },
      vision: {
        photo_uploads: 0.95,
        analysis: 0.85
      }
      // Add more models and their capabilities
    };

    this.modelCapabilities = new Map(Object.entries(capabilities));
  }

  /**
   * Get the best model for a specific role and context
   * @param {string} role - The task role (e.g., 'reasoning', 'quotes')
   * @param {Object} context - Message context, history, etc.
   * @param {string} userPreference - User's selected model (optional)
   * @returns {string} Best model ID for the task
   */
  getBestModel(role, context = {}, userPreference = null) {
    // If user explicitly selected a model and it's enabled, use it
    if (userPreference && userPreference !== 'auto') {
      const model = API_OPTIONS.find(m => m.id === userPreference && m.enabled);
      if (model) {
        console.log(`🎯 Using user-selected model: ${model.name}`);
        return model.id;
      }
    }

    // Get role-based default
    const defaultModel = DEFAULT_ROLE_ASSIGNMENTS[role];
    
    // If no context to analyze, use the default
    if (!context.message && !context.history) {
      console.log(`📋 Using default model for role ${role}: ${defaultModel}`);
      return defaultModel;
    }

    // Calculate scores for each enabled model
    const scores = new Map();
    
    API_OPTIONS.filter(model => model.enabled).forEach(model => {
      let score = 0;
      
      // Base score from model capabilities
      const capabilities = this.modelCapabilities.get(model.id) || {};
      score += (capabilities[role] || capabilities.general || 0.5) * 2;
      
      // Context-based scoring
      if (context.message) {
        // Length-based scoring
        const messageLength = context.message.length;
        if (messageLength > 1000 && capabilities.long_context) {
          score += 0.5;
        }
        
        // Language detection
        if (!/^[a-zA-Z0-9\s.,!?-]+$/.test(context.message) && capabilities.multi_language) {
          score += 0.8;
        }
        
        // Code detection
        if (/\`\`\`|\{\}|\[\]|\(\)|\b(function|class|var|const|let)\b/.test(context.message) && capabilities.tools) {
          score += 0.7;
        }
      }
      
      // History-based scoring
      if (context.history?.length > 0) {
        if (capabilities.memory) {
          score += 0.4;
        }
        // More history analysis can be added here
      }
      
      scores.set(model.id, score);
    });

    // Get model with highest score
    const [bestModel] = [...scores.entries()].sort((a, b) => b[1] - a[1])[0] || [defaultModel, 0];
    
    console.log(`🤖 Selected model ${bestModel} for role ${role} with context analysis`);
    return bestModel;
  }

  /**
   * Route a request to the appropriate model
   * @param {Object} request - The request to route
   * @returns {Promise<Object>} Response from the selected model
   */
  async routeRequest(request) {
    const {
      message,
      role = 'auto',
      userModel = null,
      context = {},
      metadata = {}
    } = request;

    // Auto-detect role if not specified or set to auto
    const effectiveRole = role === 'auto' ? this.detectRole(message, context) : role;
    
    // Get best model for this request
    const selectedModel = this.getBestModel(effectiveRole, {
      message,
      history: context.history,
      ...context
    }, userModel);

    // Get API configuration for selected model
    const api = API_OPTIONS.find(api => api.id === selectedModel);
    if (!api) {
      throw new Error(`Model ${selectedModel} not found or disabled`);
    }

    try {
      // Use API Registry to handle the actual request
      const response = await apiRegistry.getAPI(selectedModel).handler({
        message,
        role: effectiveRole,
        context,
        metadata: {
          ...metadata,
          original_role: role,
          detected_role: effectiveRole,
          model_selection: {
            requested: userModel,
            selected: selectedModel,
            reason: 'Auto-selected based on context and capabilities'
          }
        }
      });

      return response;
    } catch (error) {
      console.error(`Error with model ${selectedModel}:`, error);
      
      // If primary model fails, try fallback
      if (selectedModel !== DEFAULT_ROLE_ASSIGNMENTS.fallback) {
        console.log('Attempting fallback...');
        return this.routeRequest({
          ...request,
          userModel: DEFAULT_ROLE_ASSIGNMENTS.fallback
        });
      }
      
      throw error;
    }
  }

  /**
   * Detect the most appropriate role for a message
   * @param {string} message - User's message
   * @param {Object} context - Additional context
   * @returns {string} Detected role
   */
  detectRole(message, context = {}) {
    // Enhanced role detection logic
    // ... (your existing detectBestRole logic, but enhanced)
    return 'chat'; // Default to chat if no specific role detected
  }
}

// Export singleton instance
const modelRouter = new ModelRouter();
module.exports = modelRouter;
