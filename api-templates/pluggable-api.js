/**
 * Plug-and-Play API Template
 * Copy this file to /api/your-api-name.js and customize for your API
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to api/your-api-name.js
 * 2. Update the metadata object with your API details
 * 3. Implement your API logic in the handler function
 * 4. Test your API - it will be automatically discovered and registered!
 */

// CORS headers for local development and production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * API Metadata - This is what makes your API discoverable!
 * The system will automatically register your API based on this metadata
 */
export const metadata = {
  // Basic information
  name: 'Template API',
  description: 'A template API for demonstration purposes',
  version: '1.0.0',
  
  // Categories help route user requests to the right API
  // Choose from: 'chat', 'quotes', 'search', 'reasoning', 'tools', 'summaries', 'analytics', 'accessibility'
  // Or add your own custom categories
  categories: ['chat', 'tools'],
  
  // Keywords help match user input to your API
  keywords: ['template', 'example', 'demo', 'test'],
  
  // API configuration
  enabled: true,
  endpoint: '/api/template',
  
  // HTTP methods your API supports
  methods: ['GET', 'POST'],
  
  // Input/output specifications
  input: {
    type: 'object',
    properties: {
      message: { type: 'string', required: true },
      options: { type: 'object', required: false }
    }
  },
  
  output: {
    type: 'object',
    properties: {
      response: { type: 'string' },
      metadata: { type: 'object' }
    }
  },
  
  // Usage examples for the API dashboard
  examples: [
    {
      name: 'Basic request',
      input: { message: 'Hello, world!' },
      description: 'Simple greeting request'
    },
    {
      name: 'With options',
      input: { message: 'Analyze this text', options: { detailed: true } },
      description: 'Request with additional options'
    }
  ],
  
  // Optional: Custom routing logic
  // This function determines if this API should handle a specific request
  shouldHandle: (input, context) => {
    // Example: handle if input contains certain keywords
    const inputStr = typeof input === 'string' ? input : input.message || '';
    return inputStr.toLowerCase().includes('template') || 
           inputStr.toLowerCase().includes('example');
  }
};

/**
 * Main API handler function
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Promise<void>}
 */
async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({});
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${req.method} is not supported by this API`
        });
    }
  } catch (error) {
    console.error('Template API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Handle GET requests - Return API information
 */
async function handleGet(req, res) {
  return res.status(200).json({
    ...metadata,
    status: 'active',
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle POST requests - Process API requests
 */
async function handlePost(req, res) {
  try {
    const { message, options = {} } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'message is required and must be a string'
      });
    }
    
    // Process the request (customize this logic for your API)
    const response = await processRequest(message, options);
    
    return res.status(200).json({
      response,
      metadata: {
        api: metadata.name,
        version: metadata.version,
        timestamp: new Date().toISOString(),
        categories: metadata.categories
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      error: 'Processing Error',
      message: 'Failed to process your request'
    });
  }
}

/**
 * Your custom API logic goes here
 * Replace this function with your actual implementation
 */
async function processRequest(message, options) {
  // Example implementation
  const responses = [
    `Hello! You said: "${message}"`,
    `I received your message: "${message}". How can I help you further?`,
    `Thanks for your message: "${message}". This is a template response.`
  ];
  
  // Simple response selection based on options
  if (options.detailed) {
    return {
      message: responses[1],
      details: {
        originalMessage: message,
        options: options,
        processingTime: Date.now()
      }
    };
  }
  
  return {
    message: responses[0],
    simple: true
  };
}

export default handler;

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Copy this file to api/your-api-name.js
 * 2. Update the metadata object with your API information
 * 3. Implement your logic in the processRequest function
 * 4. Test your API by making requests to /api/your-api-name
 * 5. Your API will be automatically discovered and available in the dashboard!
 * 
 * EXAMPLE INTEGRATION:
 * 
 * // In your chat interface
 * const response = await fetch('/api/your-api-name', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ message: 'Hello, world!' })
 * });
 * 
 * const data = await response.json();
 * console.log(data.response);
 */