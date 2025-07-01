/**
 * Chat Router - Routes LLM requests to appropriate APIs based on role assignments
 * Integrates with existing AI utility and provides intelligent routing
 */

import { queryAI, isAIServiceAvailable } from './ai.js';
import { getAPIById, DEFAULT_ROLE_ASSIGNMENTS } from '../constants/apiOptions.js';

/**
 * Route LLM request to the appropriate API based on role and current assignments
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
  
  // Get the assigned API for this role
  const assignedAPIId = assignments[role];
  if (!assignedAPIId) {
    throw new Error(`No API assigned for role: ${role}`);
  }
  
  const assignedAPI = getAPIById(assignedAPIId);
  if (!assignedAPI) {
    throw new Error(`Unknown API: ${assignedAPIId}`);
  }
  
  if (!assignedAPI.enabled) {
    // Fallback to default if assigned API is disabled
    const fallbackAPIId = assignments.fallback || 'huggingface';
    const fallbackAPI = getAPIById(fallbackAPIId);
    
    if (!fallbackAPI || !fallbackAPI.enabled) {
      throw new Error(`Assigned API '${assignedAPI.name}' is disabled and no valid fallback available`);
    }
    
    console.warn(`API '${assignedAPI.name}' is disabled, falling back to '${fallbackAPI.name}'`);
    return await executeAPICall(prompt, fallbackAPI, role, options);
  }
  
  try {
    return await executeAPICall(prompt, assignedAPI, role, options);
  } catch (error) {
    // If the primary API fails, try fallback
    const fallbackAPIId = assignments.fallback;
    if (fallbackAPIId && fallbackAPIId !== assignedAPIId) {
      const fallbackAPI = getAPIById(fallbackAPIId);
      
      if (fallbackAPI && fallbackAPI.enabled) {
        console.warn(`Primary API '${assignedAPI.name}' failed, trying fallback '${fallbackAPI.name}':`, error.message);
        try {
          return await executeAPICall(prompt, fallbackAPI, role, options);
        } catch (fallbackError) {
          console.error(`Fallback API '${fallbackAPI.name}' also failed:`, fallbackError.message);
          throw new Error(`Both primary API '${assignedAPI.name}' and fallback '${fallbackAPI.name}' failed`);
        }
      }
    }
    
    // No fallback available or fallback also failed
    throw error;
  }
}

/**
 * Execute the actual API call with role-specific enhancements
 * @param {string} prompt - The user prompt
 * @param {Object} api - The API configuration object
 * @param {string} role - The chat role
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The API response
 */
async function executeAPICall(prompt, api, role, options = {}) {
  // Add role-specific prompt enhancements
  const enhancedPrompt = enhancePromptForRole(prompt, role);
  
  // Prepare API-specific options
  const apiOptions = {
    endpoint: api.endpoint,
    ...options
  };
  
  // For now, we use the existing AI utility which works with Hugging Face
  // In a real implementation, this would route to different APIs based on api.endpoint
  if (api.id === 'huggingface') {
    return await queryAI(enhancedPrompt, apiOptions);
  } else {
    // For other APIs, we would implement specific API clients here
    // For now, we'll use the existing Hugging Face endpoint as fallback
    console.warn(`API '${api.name}' not yet implemented, using Hugging Face fallback`);
    return await queryAI(enhancedPrompt, { endpoint: '/api/ai' });
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
    // For now, we only check Hugging Face availability
    // In a real implementation, we'd check each API separately
    if (assignedAPI.id === 'huggingface') {
      return await isAIServiceAvailable(assignedAPI.endpoint);
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
  
  // Add API details
  Object.keys(stats).forEach(apiId => {
    const api = getAPIById(apiId);
    if (api) {
      stats[apiId].name = api.name;
      stats[apiId].enabled = api.enabled;
      stats[apiId].endpoint = api.endpoint;
    }
  });
  
  return stats;
}