/**
 * DeepSeek API via Hugging Face Serverless Function
 * Handles POST requests to /api/deepseek for AI chat functionality
 * 
 * Expected request body: { prompt: string, role?: string }
 * Returns: { response: string, role: "assistant" }
 */

/**
 * API Metadata - For plug-and-play discovery
 */
export const metadata = {
  name: 'DeepSeek via Hugging Face',
  description: 'DeepSeek AI models via Hugging Face Inference API',
  version: '1.0.0',
  
  categories: ['chat', 'reasoning', 'tools', 'summaries'],
  keywords: ['chat', 'conversation', 'deepseek', 'huggingface', 'ai', 'assistant'],
  
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
 * Call DeepSeek via Hugging Face Inference API
 */
async function callDeepSeek(prompt, role) {
  const apiKey = process.env.HF_API_KEY;
  
  if (!apiKey) {
    throw new Error('HF_API_KEY environment variable is not set');
  }

  // Enhanced prompts based on role
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
    // Using DeepSeek R1 model via Hugging Face
    const response = await fetch('https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-Distill-Llama-8B', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid Hugging Face API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 503) {
        throw new Error('Model is currently loading. Please try again in a few seconds.');
      } else {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    // Handle different response formats
    let responseText = '';
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || data[0].text || JSON.stringify(data[0]);
    } else if (data.generated_text) {
      responseText = data.generated_text;
    } else if (data.text) {
      responseText = data.text;
    } else {
      responseText = JSON.stringify(data);
    }

    // Clean up the response
    responseText = responseText.trim();
    
    // If response is empty, provide a fallback
    if (!responseText) {
      responseText = "I apologize, but I couldn't generate a proper response. Please try rephrasing your question or contact our support team.";
    }

    return responseText;

  } catch (error) {
    console.error('DeepSeek call failed:', error);
    
    // Provide helpful fallback responses based on the prompt content
    if (prompt.toLowerCase().includes('price') || prompt.toLowerCase().includes('cost') || prompt.toLowerCase().includes('quote')) {
      return "I'd be happy to help with pricing! Our basic wash starts at $25, full detail at $150, and ceramic coating at $500. For an exact quote, please call us at 562-228-9429 or fill out our contact form.";
    } else if (prompt.toLowerCase().includes('service') || prompt.toLowerCase().includes('detailing')) {
      return "We offer comprehensive mobile car detailing services including exterior wash, interior cleaning, ceramic coating, and paint correction. We come to your location in Los Angeles and Orange County. Call 562-228-9429 to schedule!";
    } else if (prompt.toLowerCase().includes('location') || prompt.toLowerCase().includes('area')) {
      return "We serve Los Angeles and Orange County areas. We're a mobile service, so we come directly to your location - home, office, or anywhere convenient for you!";
    } else {
      return "I'm having trouble connecting to our AI service right now. For immediate assistance, please call us at 562-228-9429 or visit our website. We're here to help with all your car detailing needs!";
    }
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

    // Handle other errors
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}

export default handler;
