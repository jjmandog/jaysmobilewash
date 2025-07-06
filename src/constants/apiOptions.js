/**
 * API Options and Role Assignments for Chat Bot
 * Supports unlimited APIs/models with configurable role assignments
 */

// Available API options (unlimited)
export const API_OPTIONS = [
  {
    id: 'none',
    name: 'None',
    endpoint: '/api/none',
    description: 'No AI service (disabled)',
    enabled: true
  },
  {
    id: 'auto',
    name: 'Auto (Smart Select)',
    endpoint: '/api/auto',
    description: 'Automatically selects the best AI model for your query',
    enabled: true
  },
  {
    id: 'huggingface',
    name: 'HuggingFace Models',
    endpoint: '/api/huggingface',
    description: 'HuggingFace models (free)',
    enabled: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Chat',
    endpoint: '/api/deepseek',
    description: 'DeepSeek AI models via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: '/api/openrouter',
    description: 'OpenRouter API gateway (multiple free models)',
    enabled: true
  },
  {
    id: 'llama31',
    name: 'Llama 3.1',
    endpoint: '/api/llama31',
    description: 'Llama 3.1 8B Instruct (free)',
    enabled: true
  },
  {
    id: 'llama33',
    name: 'Llama 3.3',
    endpoint: '/api/llama33',
    description: 'Llama 3.3 70B Instruct (free)',
    enabled: true
  },
  {
    id: 'llama4',
    name: 'Llama 4 (Auto)',
    endpoint: '/api/llama4',
    description: 'Llama 4 model variants (gated access)',
    enabled: true
  },
  {
    id: 'llama4_scout',
    name: 'Llama 4 Scout',
    endpoint: '/api/llama4',
    description: 'Llama 4 Scout - Fast exploration & quick responses (gated)',
    enabled: true
  },
  {
    id: 'llama4_maverick',
    name: 'Llama 4 Maverick',
    endpoint: '/api/llama4',
    description: 'Llama 4 Maverick - Large model for complex tasks (70B, gated)',
    enabled: true
  },
  {
    id: 'llama4_guard',
    name: 'Llama 4 Guard',
    endpoint: '/api/llama4',
    description: 'Llama 4 Guard - Safety & content moderation (gated)',
    enabled: true
  },
  {
    id: 'mistral',
    name: 'Mistral 7B',
    endpoint: '/api/openrouter',
    description: 'Mistral 7B Instruct via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'gemma',
    name: 'Google Gemma',
    endpoint: '/api/openrouter',
    description: 'Google Gemma 7B/27B IT via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'qwen',
    name: 'Qwen 2.5',
    endpoint: '/api/openrouter',
    description: 'Qwen 2.5 72B Instruct via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'phi3',
    name: 'Microsoft Phi-3',
    endpoint: '/api/openrouter',
    description: 'Microsoft Phi-3 Medium via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'zephyr',
    name: 'Zephyr 7B',
    endpoint: '/api/openrouter',
    description: 'HuggingFace Zephyr 7B Beta via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'codellama',
    name: 'CodeLlama',
    endpoint: '/api/openrouter',
    description: 'CodeLlama 7B Instruct via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'openchat',
    name: 'OpenChat',
    endpoint: '/api/openrouter',
    description: 'OpenChat 7B via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'nemotron',
    name: 'Nemotron Super',
    endpoint: '/api/openrouter',
    description: 'Nvidia Nemotron Super 49B via OpenRouter (free)',
    enabled: true
  },
  {
    id: 'vision',
    name: 'Vision Analysis',
    endpoint: '/api/vision',
    description: 'Llama 3.2 Vision & HuggingFace models for image analysis',
    enabled: true
  }
];

// Chat bot roles (fixed, but API assignment is now unlimited)
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

// Default role assignments (maps role ID to API ID) - Optimized for efficiency
export const DEFAULT_ROLE_ASSIGNMENTS = {
  reasoning: 'llama4_maverick',   // Llama 4 Maverick 70B - best for complex reasoning
  tools: 'codellama',             // CodeLlama - specialized for tool/code generation
  quotes: 'mistral',              // Mistral 7B - good for structured responses like quotes
  photo_uploads: 'llama33',        // Llama 3.3 for image analysis and vehicle assessment
  summaries: 'llama33',           // Llama 3.3 70B - excellent for summarization
  search: 'llama4_scout',         // Llama 4 Scout - fast exploration & search
  chat: 'deepseek',               // DeepSeek - conversational and reliable
  fallback: 'openrouter',         // OpenRouter - multiple model fallback options
  analytics: 'phi3',              // Phi-3 Medium - good for data analysis
  accessibility: 'llama4_guard'   // Llama 4 Guard - safety-focused responses
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
      // Check assigned API exists and is enabled (no limit on number)
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