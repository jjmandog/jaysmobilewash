/**
 * Chat Router - Routes LLM requests to appropriate APIs based on role assignments
 * Integrates with existing AI utility and provides intelligent routing
 * Enhanced with community key vault and smart provider selection
 */

import { queryAI, isAIServiceAvailable } from './ai.js';
import { getAPIById, DEFAULT_ROLE_ASSIGNMENTS, getEnabledAPIs } from '../constants/apiOptions.js';
import { getCommunityKey, areAllRequiredKeysPresent } from './communityKeyVault.js';
import { 
  recordRequestStart, 
  recordRequestEnd, 
  selectBestProvider, 
  isSmartSelectEnabled 
} from './aiAnalytics.js';

/**
 * Route LLM request to the appropriate API based on role and current assignments
 * Enhanced with community key vault and smart provider selection
 * @param {string} prompt - The user prompt/message
 * @param {string} role - The chat role (reasoning, tools, quotes, etc.)
 * @param {Object} assignments - Current role assignments (defaults to DEFAULT_ROLE_ASSIGNMENTS)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The AI response
 */
export async function routeLLMRequest(prompt, role, assignments = DEFAULT_ROLE_ASSIGNMENTS, options = {}) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Prompt is required and must be a non-empty string');
  }
  
  if (!role || typeof role !== 'string') {
    throw new Error('Role is required and must be a string');
  }
  
  // Check for smart selection mode
  if (options.smartSelect && isSmartSelectEnabled() && areAllRequiredKeysPresent()) {
    return await executeSmartSelection(prompt, role, assignments, options);
  }
  
  // Get the assigned API for this role
  const assignedAPIId = assignments[role];
  if (!assignedAPIId) {
    throw new Error(`No API assigned for role: ${role}`);
  }
  
  const assignedAPI = getAPIById(assignedAPIId);
  if (!assignedAPI) {
    throw new Error(`Unknown API: ${assignedAPIId}`);
  }
  
  // Check if community key is available for this provider
  const hasCommunityKey = getCommunityKey(assignedAPI.id) !== null;
  if (!assignedAPI.enabled && !hasCommunityKey) {
    // Fallback to default if assigned API is disabled and no community key
    return await executeFallback(prompt, role, assignments, options, `API '${assignedAPI.name}' is disabled and no community key available`);
  }
  
  // Start request tracking
  const requestTracker = recordRequestStart(assignedAPI.id, role);
  
  try {
    const result = await executeAPICall(prompt, assignedAPI, role, options);
    recordRequestEnd(requestTracker.id, true, null, false);
    return result;
  } catch (error) {
    recordRequestEnd(requestTracker.id, false, error.message, false);
    
    // Try fallback on failure
    return await executeFallback(prompt, role, assignments, options, `Primary API '${assignedAPI.name}' failed: ${error.message}`);
  }
}

/**
 * Execute smart provider selection
 * @param {string} prompt - The user prompt
 * @param {string} role - The chat role
 * @param {Object} assignments - Current role assignments
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The AI response
 */
async function executeSmartSelection(prompt, role, assignments, options) {
  // Get all enabled APIs with community keys
  const availableProviders = getEnabledAPIs()
    .filter(api => api.id !== 'none' && getCommunityKey(api.id) !== null)
    .map(api => api.id);
  
  if (availableProviders.length === 0) {
    throw new Error('No providers available for smart selection');
  }
  
  // Use smart selection to pick the best provider
  const selectedProvider = selectBestProvider(availableProviders, role);
  const selectedAPI = getAPIById(selectedProvider);
  
  if (!selectedAPI) {
    throw new Error('Smart selection failed to find suitable provider');
  }
  
  console.log(`Smart selection chose ${selectedAPI.name} for role ${role}`);
  
  const requestTracker = recordRequestStart(selectedAPI.id, role);
  
  try {
    const result = await executeAPICall(prompt, selectedAPI, role, options);
    recordRequestEnd(requestTracker.id, true, null, false);
    return result;
  } catch (error) {
    recordRequestEnd(requestTracker.id, false, error.message, false);
    
    // On smart selection failure, try regular fallback
    return await executeFallback(prompt, role, assignments, options, `Smart-selected API '${selectedAPI.name}' failed: ${error.message}`);
  }
}

/**
 * Execute fallback logic with analytics tracking
 * @param {string} prompt - The user prompt
 * @param {string} role - The chat role
 * @param {Object} assignments - Current role assignments
 * @param {Object} options - Additional options
 * @param {string} reason - Reason for fallback
 * @returns {Promise<Object>} - The AI response
 */
async function executeFallback(prompt, role, assignments, options, reason) {
  const fallbackAPIId = assignments.fallback || 'openai';
  const fallbackAPI = getAPIById(fallbackAPIId);
  
  if (!fallbackAPI) {
    throw new Error(`No fallback API available: ${reason}`);
  }
  
  // Check if fallback API has community key or is enabled
  const fallbackHasKey = getCommunityKey(fallbackAPI.id) !== null;
  if (!fallbackAPI.enabled && !fallbackHasKey) {
    throw new Error(`Fallback API '${fallbackAPI.name}' is also unavailable: ${reason}`);
  }
  
  console.warn(`Using fallback '${fallbackAPI.name}': ${reason}`);
  
  const requestTracker = recordRequestStart(fallbackAPI.id, role);
  
  try {
    const result = await executeAPICall(prompt, fallbackAPI, role, options);
    recordRequestEnd(requestTracker.id, true, null, true); // Mark as fallback
    return result;
  } catch (fallbackError) {
    recordRequestEnd(requestTracker.id, false, fallbackError.message, true);
    throw new Error(`Fallback also failed: ${fallbackError.message}. Original reason: ${reason}`);
  }
}
/**
 * Execute the actual API call with role-specific enhancements
 * Enhanced with community key integration
 * @param {string} prompt - The user prompt
 * @param {Object} api - The API configuration object
 * @param {string} role - The chat role
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The API response
 */
async function executeAPICall(prompt, api, role, options = {}) {
  // Add role-specific prompt enhancements
  const enhancedPrompt = enhancePromptForRole(prompt, role);
  
  // Get community key if available
  const communityKey = getCommunityKey(api.id);
  
  // Prepare API-specific options
  const apiOptions = {
    endpoint: api.endpoint,
    apiKey: communityKey, // Pass community key to API call
    ...options
  };
  
  // Handle 'none' API - return a default message
  if (api.id === 'none') {
    return {
      content: "AI services are currently disabled. Please contact support for assistance.",
      role: "assistant"
    };
  }
  
  // Route to different APIs based on api.endpoint
  if (api.id === 'deepseek') {
    return await queryAI(enhancedPrompt, apiOptions);
  } else if (api.id === 'openai') {
    // For OpenAI, use the same queryAI function but with openai endpoint
    return await queryAI(enhancedPrompt, { endpoint: '/api/openai', ...apiOptions });
  } else if (api.id === 'anthropic') {
    // For Anthropic, use the same queryAI function but with anthropic endpoint
    return await queryAI(enhancedPrompt, { endpoint: '/api/anthropic', ...apiOptions });
  } else if (api.id === 'google') {
    // For Google, use the same queryAI function but with google endpoint
    return await queryAI(enhancedPrompt, { endpoint: '/api/google', ...apiOptions });
  } else {
    // For other APIs, we would implement specific API clients here
    // For now, we'll use openai as fallback if available
    const openaiAPI = getAPIById('openai');
    const openaiKey = getCommunityKey('openai');
    if (openaiAPI && (openaiAPI.enabled || openaiKey)) {
      console.warn(`API '${api.name}' not yet implemented, using OpenAI fallback`);
      return await queryAI(enhancedPrompt, { endpoint: '/api/openai', apiKey: openaiKey });
    } else {
      throw new Error(`API '${api.name}' not implemented and no fallback available`);
    }
  }
}

/**
 * Execute smart provider selection
 * @param {string} prompt - The user prompt
 * @param {string} role - The chat role
 * @param {Object} assignments - Current role assignments
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The AI response
 */
async function executeSmartSelection(prompt, role, assignments, options) {
  // Get all enabled APIs with community keys
  const availableProviders = getEnabledAPIs()
    .filter(api => api.id !== 'none' && getCommunityKey(api.id) !== null)
    .map(api => api.id);
  
  if (availableProviders.length === 0) {
    throw new Error('No providers available for smart selection');
  }
  
  // Use smart selection to pick the best provider
  const selectedProvider = selectBestProvider(availableProviders, role);
  const selectedAPI = getAPIById(selectedProvider);
  
  if (!selectedAPI) {
    throw new Error('Smart selection failed to find suitable provider');
  }
  
  console.log(`Smart selection chose ${selectedAPI.name} for role ${role}`);
  
  const requestTracker = recordRequestStart(selectedAPI.id, role);
  
  try {
    const result = await executeAPICall(prompt, selectedAPI, role, options);
    recordRequestEnd(requestTracker.id, true, null, false);
    return result;
  } catch (error) {
    recordRequestEnd(requestTracker.id, false, error.message, false);
    
    // On smart selection failure, try regular fallback
    return await executeFallback(prompt, role, assignments, options, `Smart-selected API '${selectedAPI.name}' failed: ${error.message}`);
  }
}

/**
 * Execute fallback logic with analytics tracking
 * @param {string} prompt - The user prompt
 * @param {string} role - The chat role
 * @param {Object} assignments - Current role assignments
 * @param {Object} options - Additional options
 * @param {string} reason - Reason for fallback
 * @returns {Promise<Object>} - The AI response
 */
async function executeFallback(prompt, role, assignments, options, reason) {
  const fallbackAPIId = assignments.fallback || 'openai';
  const fallbackAPI = getAPIById(fallbackAPIId);
  
  if (!fallbackAPI) {
    throw new Error(`No fallback API available: ${reason}`);
  }
  
  // Check if fallback API has community key or is enabled
  const fallbackHasKey = getCommunityKey(fallbackAPI.id) !== null;
  if (!fallbackAPI.enabled && !fallbackHasKey) {
    throw new Error(`Fallback API '${fallbackAPI.name}' is also unavailable: ${reason}`);
  }
  
  console.warn(`Using fallback '${fallbackAPI.name}': ${reason}`);
  
  const requestTracker = recordRequestStart(fallbackAPI.id, role);
  
  try {
    const result = await executeAPICall(prompt, fallbackAPI, role, options);
    recordRequestEnd(requestTracker.id, true, null, true); // Mark as fallback
    return result;
  } catch (fallbackError) {
    recordRequestEnd(requestTracker.id, false, fallbackError.message, true);
    throw new Error(`Fallback also failed: ${fallbackError.message}. Original reason: ${reason}`);
  }
}

/**
 * Enhance prompt based on the role context
 * @param {string} prompt - Original prompt
 * @param {string} role - Chat role
 * @returns {string} - Enhanced prompt
 */
function enhancePromptForRole(prompt, role) {
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

/**
 * Check if an API is available for a specific role
 * @param {string} role - The chat role
 * @param {Object} assignments - Current role assignments
 * @returns {Promise<boolean>} - True if API is available
 */
export async function isRoleAPIAvailable(role, assignments = DEFAULT_ROLE_ASSIGNMENTS) {
  const assignedAPIId = assignments[role];
  if (!assignedAPIId) {
    return false;
  }
  
  const assignedAPI = getAPIById(assignedAPIId);
  if (!assignedAPI || !assignedAPI.enabled) {
    return false;
  }
  
  try {
    // Handle 'none' API - always available
    if (assignedAPI.id === 'none') {
      return true;
    }
    
    // Check availability for different APIs
    if (assignedAPI.id === 'deepseek') {
      return await isAIServiceAvailable(assignedAPI.endpoint);
    } else if (assignedAPI.id === 'openai') {
      return await isAIServiceAvailable('/api/openai');
    } else if (assignedAPI.id === 'anthropic') {
      return await isAIServiceAvailable('/api/anthropic');
    } else if (assignedAPI.id === 'google') {
      return await isAIServiceAvailable('/api/google');
    } else {
      // For other APIs, assume available if enabled
      return true;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Get routing statistics for monitoring
 * Enhanced with community key status
 * @param {Object} assignments - Current role assignments
 * @returns {Object} - Statistics about API usage
 */
export function getRoutingStats(assignments = DEFAULT_ROLE_ASSIGNMENTS) {
  const stats = {};
  
  // Count roles per API
  Object.entries(assignments).forEach(([role, apiId]) => {
    if (!stats[apiId]) {
      stats[apiId] = { roles: [], count: 0 };
    }
    stats[apiId].roles.push(role);
    stats[apiId].count++;
  });
  
  // Add API details and community key status
  Object.keys(stats).forEach(apiId => {
    const api = getAPIById(apiId);
    if (api) {
      stats[apiId].name = api.name;
      stats[apiId].enabled = api.enabled;
      stats[apiId].endpoint = api.endpoint;
      stats[apiId].hasCommunityKey = getCommunityKey(apiId) !== null;
      stats[apiId].isAvailable = api.enabled || getCommunityKey(apiId) !== null;
    }
  });
  
  return stats;
}

/**
 * Check if smart selection can be enabled
 * @returns {boolean} - True if all required providers have keys
 */
export function canEnableSmartSelection() {
  return areAllRequiredKeysPresent();
}

/**
 * Get available providers for smart selection
 * @returns {Array} - List of available provider IDs
 */
export function getSmartSelectionProviders() {
  return getEnabledAPIs()
    .filter(api => api.id !== 'none' && getCommunityKey(api.id) !== null)
    .map(api => ({ id: api.id, name: api.name }));
}