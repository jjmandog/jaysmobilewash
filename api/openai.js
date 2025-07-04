/**
 * OpenAI API Serverless Function
 * Handles POST requests to /api/openai for AI chat functionality
 * 
 * Expected request body: { prompt: string, role?: string }
 * Returns: { response: string, role: "assistant" }
 */

/**
 * API Metadata - For plug-and-play discovery
 */
export const metadata = {
  name: 'OpenAI GPT',
  description: 'OpenAI GPT models for conversational AI and general chat',
  version: '1.0.0',
  
  categories: ['chat', 'reasoning', 'tools', 'summaries'],
  keywords: ['chat', 'conversation', 'gpt', 'openai', 'ai', 'assistant'],
  
  enabled: true,
  endpoint: '/api/openai',
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
  ],
  
  shouldHandle: (input, context) => {
    // OpenAI can handle most general requests
    return true;
  }
};

// CORS headers for local development and production
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
 * Get mock response for testing/fallback
 */
function getMockResponse(prompt, role) {
  const responses = {
    reasoning: "I've analyzed your request logically. Based on the information provided, here's my step-by-step reasoning and conclusion.",
    tools: "I can help you with tools and actions needed for your car detailing project. Let me suggest the appropriate tools and steps.",
    quotes: "For a premium mobile detailing service, I'd estimate the cost based on your vehicle size and requested services. Please provide more details for an accurate quote.",
    photo_uploads: "I can analyze photos of your vehicle to provide specific recommendations. Please upload clear images of the areas you'd like me to examine.",
    summaries: "Here's a summary of the key points from your request, highlighting the most important aspects of your car detailing needs.",
    search: "Based on your search query, here's relevant information about car detailing services, techniques, and recommendations.",
    chat: "Hello! I'm Jay's Mobile Wash AI assistant. I'm here to help with all your car detailing questions and service needs.",
    fallback: "I'm here to help with your car detailing needs. Could you provide more specific details about what you're looking for?",
    analytics: "Based on the data analysis, here are insights about your car detailing preferences and service history.",
    accessibility: "I'm designed to be accessible and helpful. I can assist you with voice commands, screen readers, and simplified explanations."
  };

  const defaultResponse = "Thank you for reaching out! I'm Jay's Mobile Wash AI assistant, specialized in premium car detailing services. How can I help you today?";
  
  return responses[role] || defaultResponse;
}

/**
 * Call OpenAI API (placeholder for actual implementation)
 */
async function callOpenAI(prompt, role) {
  // TODO: Implement actual OpenAI API integration
  // 1. Get API key from environment variables
  // 2. Construct proper OpenAI API request
  // 3. Handle rate limiting and errors
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('No OpenAI API key configured, returning mock response');
    return getMockResponse(prompt, role);
  }

  try {
    // TODO: Replace this comment block with actual OpenAI API call
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for Jay\'s Mobile Wash, a premium car detailing service. Provide expert advice on car care, detailing services, and mobile wash solutions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
    */

    // For now, return mock response with API key present message
    return `[API Available] ${getMockResponse(prompt, role)} (Note: OpenAI integration is ready but not yet implemented)`;
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to mock response on API errors
    return getMockResponse(prompt, role);
  }
}

/**
 * Main handler function
 * Handles OpenAI API requests with proper CORS and method validation
 */
async function handler(req, res) {
  // Set CORS headers for all responses (including OPTIONS and errors)
  // This ensures proper cross-origin access for web applications
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Log API access for diagnostics
  console.log(`OpenAI API accessed: ${req.method} request`);

  // Handle CORS preflight requests
  // Browsers send OPTIONS requests before actual requests for CORS validation
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests for actual API functionality
  // This is a security measure to prevent unintended access
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    // Parse and validate request body
    const { prompt, role } = validateRequestBody(req.body);

    // Call OpenAI API or return mock response
    const aiResponse = await callOpenAI(prompt, role);

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

    // Handle other errors
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}

export default handler;