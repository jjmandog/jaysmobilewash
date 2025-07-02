/**
 * AI Utility Helper - Pure JS fetch helper for querying the Hugging Face AI endpoint
 * This helper is designed to be imported by SPA components for AI interactions
 */

/**
 * Query the Hugging Face AI endpoint with a text prompt
 * @param {string} prompt - The text prompt to send to the AI
 * @param {Object} options - Optional configuration
 * @param {string} options.endpoint - Custom endpoint URL (defaults to /api/ai)
 * @returns {Promise<Object>} - The AI response data
 * @throws {Error} - If the request fails or returns an error
 */
export async function queryAI(prompt, options = {}) {
  const { endpoint = '/api/openrouter' } = options;

  // Validate input
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

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors and other exceptions
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to AI service');
    }
    throw error;
  }
}

/**
 * Check if the AI service is available
 * @param {string} endpoint - Custom endpoint URL (defaults to /api/ai)
 * @returns {Promise<boolean>} - True if service is available
 */
export async function isAIServiceAvailable(endpoint = '/api/openrouter') {
  try {
    // Send a minimal test request
    await queryAI('test', { endpoint });
    return true;
  } catch (error) {
    console.warn('AI service availability check failed:', error.message);
    return false;
  }
}

/**
 * Utility function to sanitize user input before sending to AI
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
export function sanitizePrompt(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove excessive whitespace and limit length
  return input.trim().substring(0, 1000);
}