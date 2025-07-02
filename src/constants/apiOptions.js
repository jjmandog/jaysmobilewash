/**
 * API Options and Role Assignments for Chat Bot
 * Supports up to 10 APIs with configurable role assignments
 */

// Available API options (up to 10)
export const API_OPTIONS = [
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
    enabled: true
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    endpoint: '/api/openai',
    description: 'OpenAI GPT models',
    enabled: true
  },
  {
    id: 'google',
    name: 'Google Gemini',
    endpoint: '/api/google',
    description: 'Google Gemini AI',
    enabled: true
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

// Chat bot roles (exactly 10 as specified)
export const CHAT_ROLES = [
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

// Default role assignments (maps role ID to API ID)
export const DEFAULT_ROLE_ASSIGNMENTS = {
  reasoning: 'anthropic',      // Advanced reasoning - Claude excels at this
  tools: 'openai',             // Tool calling - GPT has good function calling
  quotes: 'deepseek',          // Service quotes - keep existing
  photo_uploads: 'google',     // Photo analysis - Gemini has vision capabilities
  summaries: 'anthropic',      // Summarization - Claude is great at this
  search: 'google',            // Search queries - Google's strength
  chat: 'openai',              // General chat - GPT is conversational
  fallback: 'deepseek',        // Always available fallback
  analytics: 'deepseek',       // Data analysis - keep existing
  accessibility: 'openai'      // Accessibility support - GPT is helpful
};

// Get enabled API options
export const getEnabledAPIs = () => {
  return API_OPTIONS.filter(api => api.enabled);
};

// Get API by ID
export const getAPIById = (id) => {
  return API_OPTIONS.find(api => api.id === id);
};

// Get role by ID
export const getRoleById = (id) => {
  return CHAT_ROLES.find(role => role.id === id);
};

// Validate role assignments
export const validateRoleAssignments = (assignments) => {
  const errors = [];
  
  // Check all roles are assigned
  for (const role of CHAT_ROLES) {
    if (!assignments[role.id]) {
      errors.push(`Role '${role.name}' is not assigned to any API`);
    } else {
      // Check assigned API exists and is enabled
      const api = getAPIById(assignments[role.id]);
      if (!api) {
        errors.push(`Role '${role.name}' is assigned to unknown API '${assignments[role.id]}'`);
      } else if (!api.enabled) {
        errors.push(`Role '${role.name}' is assigned to disabled API '${api.name}'`);
      }
    }
  }
  
  return errors;
};