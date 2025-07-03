/**
 * DeepSeek API via OpenRouter
 * Handles POST requests to /api/deepseek for AI chat functionality
 * 
 * Expected request body: { prompt: string, role?: string }
 * Returns: { response: string, role: "assistant" }
 */

/**
 * API Metadata - For plug-and-play discovery
 */
export const metadata = {
  name: 'DeepSeek via OpenRouter',
  description: 'DeepSeek AI models via OpenRouter API',
  version: '1.0.0',
  
  categories: ['chat', 'reasoning', 'tools', 'summaries'],
  keywords: ['chat', 'conversation', 'deepseek', 'openrouter', 'ai', 'assistant'],
  
  enabled: true,
  endpoint: '/api/deepseek',
  methods: ['POST'],
  
  input: {
    type: 'object',
    properties: {
      prompt: { type: 'string', required: true },
      role: { type: 'string', required: false, default: 'chat' }
    }
  },
  
  output: {
    type: 'object',
    properties: {
      response: { type: 'string' },
      role: { type: 'string' }
    }
  },
  
  examples: [
    {
      name: 'General chat',
      input: { prompt: 'How can I get my car detailed?' },
      description: 'Basic conversational request'
    },
    {
      name: 'Reasoning request',
      input: { prompt: 'What\'s the best way to remove scratches?', role: 'reasoning' },
      description: 'Analysis and reasoning task'
    }
  ]
};

// These headers are set for ALL responses to ensure proper cross-origin access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Validate request body
 */
function validateRequestBody(body) {
  if (!body) {
    throw new Error('Request body is required');
  }

  if (!body.prompt || typeof body.prompt !== 'string') {
    throw new Error('prompt is required and must be a string');
  }

  if (body.prompt.trim().length === 0) {
    throw new Error('prompt cannot be empty');
  }

  if (body.prompt.length > 10000) {
    throw new Error('prompt is too long (max 10000 characters)');
  }

  // role is optional, default to 'chat'
  const role = body.role || 'chat';
  if (typeof role !== 'string') {
    throw new Error('role must be a string');
  }

  return {
    prompt: body.prompt.trim(),
    role: role
  };
}

/**
 * Call OpenRouter API
 */
async function callDeepSeek(prompt, role) {
  // Use the new OpenRouter API Key
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    // Updated error message
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  // Enhanced prompts based on role (this logic remains the same)
  const rolePrompts = {
    reasoning: `You are an expert reasoning AI. Please analyze this step-by-step and provide logical conclusions: ${prompt}`,
    tools: `You are a helpful assistant for car detailing tools and equipment. Help with: ${prompt}`,
    quotes: `You are a car detailing pricing expert. Provide accurate pricing estimates for: ${prompt}`,
    photo_uploads: `You are an image analysis expert for car detailing. Analyze and provide recommendations for: ${prompt}`,
    summaries: `Please provide a clear and concise summary of: ${prompt}`,
    search: `Please search your knowledge and provide relevant information about: ${prompt}`,
    analytics: `Please analyze the data and provide insights about: ${prompt}`,
    accessibility: `Please provide accessible and helpful information about: ${prompt}`,
    chat: `You are Jay's Mobile Wash AI assistant. You're friendly, knowledgeable about car detailing, and always ready to help customers. Respond to: ${prompt}`,
    fallback: `Please help with: ${prompt}`
  };

  const enhancedPrompt = rolePrompts[role] || rolePrompts.chat;

  try {
    // New OpenRouter endpoint and headers
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Recommended headers for OpenRouter to identify your app
        'HTTP-Referer': 'https://jaysmobilewash.net', 
        'X-Title': 'JaysMobileWash',
      },
      // New body format for OpenRouter (OpenAI compatible)
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free', // Using the user-selected free model on OpenRouter
        messages: [
          { role: 'user', content: enhancedPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', response.status, errorText);
      
      // Updated error handling for OpenRouter
      if (response.status === 401) {
        throw new Error('Invalid OpenRouter API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        // More generic but informative error
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }
    }

    const data = await response.json();
    
    // New response parsing for OpenRouter (OpenAI compatible)
    let responseText = '';
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      responseText = data.choices[0].message.content;
    } else {
      // Fallback if response format is unexpected
      responseText = "I received an unexpected response from the AI. Please try again.";
    }

    // Clean up the response
    responseText = responseText.trim();
    
    // If response is empty, provide a fallback
    if (!responseText) {
      responseText = "I apologize, but I couldn't generate a proper response. Please try rephrasing your question or contact our support team.";
    }

    return responseText;

  } catch (error) {
    console.error('OpenRouter call failed:', error);
    
    // Re-throw the error so it can be handled by the main API handler,
    // which will provide a more detailed error response for debugging.
    throw error;
  }
}

/**
 * Main serverless function handler
 */
async function handler(req, res) {
  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for actual API functionality
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    // Parse and validate request body
    const { prompt, role } = validateRequestBody(req.body);

    // Call DeepSeek API
    const aiResponse = await callDeepSeek(prompt, role);

    // Return successful response
    return res.status(200).json({
      response: aiResponse,
      role: 'assistant'
    });

  } catch (error) {
    console.error('API Error:', error);

    // Handle validation errors
    if (error.message.includes('prompt') || error.message.includes('role') || error.message.includes('required')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }

    // Handle API key errors
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'AI service is not properly configured'
      });
    }

    return res.status(500).json({ message: 'Internal server error: AI service is not configured.' });
  }
}

export default handler;
