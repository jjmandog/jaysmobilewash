/**
 * Dynamic Chat Router - Routes requests using the API Registry
 * Replaces static routing with dynamic API discovery and intelligent routing
 */

import apiRegistry from './apiRegistry.js';
import { queryAI } from './ai.js';
import { getAPIById } from '../constants/apiOptions.js';

/**
 * Initialize the dynamic routing system
 * @returns {Promise<void>}
 */
export async function initializeDynamicRouter() {
  try {
    await apiRegistry.initialize();
    console.log('Dynamic Chat Router initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Dynamic Chat Router:', error);
    throw error;
  }
}

/**
 * Route a request using the dynamic API registry
 * @param {string} prompt - User input
 * @param {string} role - Chat role (optional, used for fallback)
 * @param {Object} options - Routing options
 * @returns {Promise<Object>} API response
 */
export async function routeRequest(prompt, role = 'chat', options = {}) {
  try {
    // Ensure registry is initialized
    if (!apiRegistry.initialized) {
      await initializeDynamicRouter();
    }

    // Find matching APIs using the registry
    const matchingAPIs = apiRegistry.findMatchingAPIs(prompt, {
      limit: options.maxMatches || 3,
      threshold: options.threshold || 0.1
    });

    if (matchingAPIs.length === 0) {
      // No matching APIs found, use fallback
      return await fallbackToStatic(prompt, role, options);
    }

    // Try APIs in order of relevance
    for (const api of matchingAPIs) {
      try {
        const response = await callAPI(api, prompt, options);
        if (response) {
          return {
            ...response,
            metadata: {
              ...response.metadata,
              routedTo: api.name,
              apiId: api.id,
              categories: api.categories
            }
          };
        }
      } catch (error) {
        console.warn(`API ${api.id} failed:`, error);
        continue; // Try next API
      }
    }

    // All APIs failed, use fallback
    return await fallbackToStatic(prompt, role, options);

  } catch (error) {
    console.error('Dynamic routing error:', error);
    return await fallbackToStatic(prompt, role, options);
  }
}

/**
 * Call a specific API from the registry
 * @param {Object} api - API registration object
 * @param {string} prompt - User input
 * @param {Object} options - Call options
 * @returns {Promise<Object>} API response
 */
async function callAPI(api, prompt, options = {}) {
  if (!api.enabled) {
    throw new Error(`API ${api.id} is disabled`);
  }

  // Check if API has a shouldHandle method
  if (api.shouldHandle && !api.shouldHandle(prompt, options.context)) {
    return null; // API declined to handle this request
  }

  // Prepare request data
  const requestData = {
    message: prompt,
    ...options.apiOptions
  };

  try {
    // Call the API's handler directly if available
    if (api.handler && typeof api.handler === 'function') {
      return await api.handler(requestData, options.context);
    }

    // Otherwise, make HTTP request to the API endpoint
    const response = await fetch(api.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`API ${api.id} returned ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.response?.message || data.response || data.message || JSON.stringify(data),
      role: 'assistant',
      apiResponse: data
    };

  } catch (error) {
    console.error(`Error calling API ${api.id}:`, error);
    throw error;
  }
}

/**
 * Fallback to static routing system
 * @param {string} prompt - User input
 * @param {string} role - Chat role
 * @param {Object} options - Routing options
 * @returns {Promise<Object>} API response
 */
async function fallbackToStatic(prompt, role, options) {
  console.log(`Falling back to static routing for role: ${role}`);
  
  // Import the original router if not already imported
  try {
    const { routeLLMRequest } = await import('./chatRouter.js');
    return await routeLLMRequest(prompt, role, options.roleAssignments, options);
  } catch (error) {
    console.error('Static routing fallback failed:', error);
    
    // Ultimate fallback - direct AI call
    try {
      const response = await queryAI(prompt, { role });
      return {
        content: response.content || response.message || response,
        role: 'assistant',
        metadata: {
          routedTo: 'fallback',
          method: 'direct'
        }
      };
    } catch (aiError) {
      console.error('Direct AI fallback failed:', aiError);
      return {
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.',
        role: 'assistant',
        metadata: {
          routedTo: 'error',
          error: true
        }
      };
    }
  }
}

/**
 * Get routing statistics and available APIs
 * @returns {Object} Routing information
 */
export function getRoutingInfo() {
  return {
    registry: apiRegistry.getStats(),
    categories: apiRegistry.getCategories(),
    apis: Array.from(apiRegistry.getAllAPIs.values()).map(api => ({
      id: api.id,
      name: api.name,
      description: api.description,
      categories: api.categories,
      enabled: api.enabled,
      endpoint: api.endpoint
    }))
  };
}

/**
 * Test routing for a given input
 * @param {string} input - Test input
 * @param {Object} options - Test options
 * @returns {Object} Test results
 */
export function testRouting(input, options = {}) {
  const matchingAPIs = apiRegistry.findMatchingAPIs(input, options);
  
  return {
    input,
    matchingAPIs: matchingAPIs.map(api => ({
      id: api.id,
      name: api.name,
      categories: api.categories,
      shouldHandle: api.shouldHandle ? api.shouldHandle(input) : null
    })),
    fallbackRole: classifyRole(input)
  };
}

/**
 * Simple role classification for fallback
 * @param {string} input - User input
 * @returns {string} Predicted role
 */
function classifyRole(input) {
  const inputLower = input.toLowerCase();
  
  if (inputLower.includes('quote') || inputLower.includes('price') || inputLower.includes('cost')) {
    return 'quotes';
  }
  
  if (inputLower.includes('search') || inputLower.includes('find') || inputLower.includes('lookup')) {
    return 'search';
  }
  
  if (inputLower.includes('analyze') || inputLower.includes('explain') || inputLower.includes('why')) {
    return 'reasoning';
  }
  
  if (inputLower.includes('summary') || inputLower.includes('summarize')) {
    return 'summaries';
  }
  
  return 'chat';
}

/**
 * Reload all APIs (useful for development)
 * @returns {Promise<void>}
 */
export async function reloadAPIs() {
  await apiRegistry.reload();
  console.log('APIs reloaded');
}

/**
 * Get API by ID from registry
 * @param {string} apiId - API identifier
 * @returns {Object|null} API object or null
 */
export function getRegisteredAPI(apiId) {
  return apiRegistry.getAPI(apiId);
}

/**
 * Get APIs by category
 * @param {string} category - Category name
 * @returns {Array<Object>} Array of APIs
 */
export function getAPIsByCategory(category) {
  return apiRegistry.getAPIsByCategory(category);
}