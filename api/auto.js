/**
 * Auto Mode API Handler
 * Automatically selects the best AI model and handler based on the user's request
 * 
 * Expected request body: { prompt: string, role?: string, model?: string, messages?: array }
 * Returns: { responseText: string, selectedModel: string, selectedHandler: string }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, corsHeaders);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = req.body || (typeof req.body === 'string' ? JSON.parse(req.body) : {});
    const prompt = body.prompt || '';
    const role = body.role || 'auto';
    const messages = body.messages || null;

    if (!prompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Prompt or messages array is required' }));
      return;
    }

    console.log('🤖 Auto Mode: Analyzing request to select best handler');
    console.log('📝 Prompt:', prompt.substring(0, 100) + '...');

    // Analyze the prompt to determine the best handler and model
    const analysis = analyzePromptForBestHandler(prompt, messages);
    
    console.log('🎯 Auto Mode Selection:', analysis);

    // Route to the selected handler
    const selectedResponse = await routeToHandler(analysis, body);

    // Add auto mode metadata to response
    selectedResponse.autoMode = {
      selectedHandler: analysis.handler,
      selectedModel: analysis.model,
      reason: analysis.reason,
      confidence: analysis.confidence
    };

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify(selectedResponse));

  } catch (error) {
    console.error('❌ Auto Mode Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * Analyze prompt to determine the best handler and model
 */
function analyzePromptForBestHandler(prompt, messages) {
  const msgLower = prompt.toLowerCase();
  
  // File upload detection
  if (messages && messages.some(msg => msg.type === 'image' || msg.attachments)) {
    return {
      handler: '/api/vision',
      model: 'vision',
      reason: 'Image/file upload detected',
      confidence: 0.95
    };
  }

  // Business/service queries - use best conversational model
  if (msgLower.includes('price') || msgLower.includes('service') || msgLower.includes('wash') || 
      msgLower.includes('detail') || msgLower.includes('ceramic') || msgLower.includes('quote') ||
      msgLower.includes('appointment') || msgLower.includes('book') || msgLower.includes('location')) {
    return {
      handler: '/api/openrouter',
      model: 'openrouter_llama33',
      reason: 'Business/service query detected',
      confidence: 0.9
    };
  }

  // Technical/complex analysis - use strongest model
  if (msgLower.includes('analy') || msgLower.includes('complex') || msgLower.includes('technical') ||
      msgLower.includes('explain') || msgLower.includes('how does') || msgLower.includes('why does') ||
      msgLower.length > 200) {
    return {
      handler: '/api/openrouter',
      model: 'openrouter_qwen',
      reason: 'Complex analysis required',
      confidence: 0.85
    };
  }

  // Code-related queries
  if (msgLower.includes('code') || msgLower.includes('programming') || msgLower.includes('script') ||
      msgLower.includes('function') || msgLower.includes('javascript') || msgLower.includes('html')) {
    return {
      handler: '/api/openrouter',
      model: 'openrouter_nemotron',
      reason: 'Code-related query detected',
      confidence: 0.8
    };
  }

  // Quick questions - use fast model
  if (msgLower.length < 50 || msgLower.includes('hello') || msgLower.includes('hi ') || 
      msgLower.includes('what is') || msgLower.includes('who is')) {
    return {
      handler: '/api/openrouter',
      model: 'deepseek_r1',
      reason: 'Quick query - using fast model',
      confidence: 0.75
    };
  }

  // Default to best balanced model
  return {
    handler: '/api/openrouter',
    model: 'openrouter_llama33',
    reason: 'Default selection - balanced performance',
    confidence: 0.6
  };
}

/**
 * Route to the selected handler
 */
async function routeToHandler(analysis, originalBody) {
  try {
    // Determine the endpoint URL
    const endpoint = `https://jaysmobilewash.net${analysis.handler}`;
    
    // Prepare the request body with the selected model
    const requestBody = {
      ...originalBody,
      model: analysis.model
    };

    console.log('🚀 Routing to:', endpoint, 'with model:', analysis.model);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Handler ${analysis.handler} returned ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Routing error:', error);
    
    // Fallback to DeepSeek if primary handler fails
    try {
      console.log('🔄 Falling back to DeepSeek...');
      
      const fallbackResponse = await fetch('https://jaysmobilewash.net/api/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...originalBody,
          model: 'deepseek_r1'
        })
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        fallbackData.fallback = true;
        fallbackData.originalError = error.message;
        return fallbackData;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }

    throw error;
  }
}