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
 * Enhanced balancing system with topic-based routing
 */
function analyzePromptForBestHandler(prompt, messages) {
  const msgLower = prompt.toLowerCase();
  
  // File upload detection - prioritize vision models
  if (messages && messages.some(msg => msg.type === 'image' || msg.attachments)) {
    return {
      handler: '/api/llama32-vision',
      model: 'llama32_vision',
      reason: 'Image/file upload detected - using Llama 3.2 Vision',
      confidence: 0.95
    };
  }

  // === ENTERPRISE & ADVANCED REASONING ===
  // Qwen 3 235B - Best for sophisticated enterprise analysis
  if (msgLower.includes('enterprise') || msgLower.includes('business strategy') || msgLower.includes('sophisticated') ||
      msgLower.includes('complex reasoning') || msgLower.includes('advanced analysis') || msgLower.includes('strategic') ||
      msgLower.includes('decision making') || msgLower.includes('optimization') || msgLower.includes('architecture') ||
      msgLower.includes('scalability') || msgLower.includes('enterprise solution') || msgLower.includes('business logic')) {
    return {
      handler: '/api/qwen3-235b',
      model: 'qwen3_235b',
      reason: 'Enterprise/sophisticated reasoning - using Qwen 3 235B',
      confidence: 0.95
    };
  }

  // === DEEP ANALYTICAL REASONING ===
  // QWQ 32B - Best for complex analytical tasks
  if (msgLower.includes('analyze') || msgLower.includes('reasoning') || msgLower.includes('logic') ||
      msgLower.includes('problem solving') || msgLower.includes('mathematical') || msgLower.includes('proof') ||
      msgLower.includes('theorem') || msgLower.includes('deduce') || msgLower.includes('infer') ||
      msgLower.includes('conclude') || msgLower.includes('critical thinking') || msgLower.length > 250) {
    return {
      handler: '/api/qwq-32b',
      model: 'qwq_32b',
      reason: 'Deep analytical reasoning - using QWQ 32B',
      confidence: 0.9
    };
  }

  // === ADVANCED TECHNICAL ANALYSIS ===
  // GLM-Z1 32B - Best for technical explanations and complex systems
  if (msgLower.includes('technical') || msgLower.includes('explain') || msgLower.includes('how does') ||
      msgLower.includes('why does') || msgLower.includes('mechanism') || msgLower.includes('algorithm') ||
      msgLower.includes('system design') || msgLower.includes('engineering') || msgLower.includes('scientific')) {
    return {
      handler: '/api/glm-z1-32b',
      model: 'glm_z1_32b',
      reason: 'Technical analysis - using GLM-Z1 32B',
      confidence: 0.88
    };
  }

  // === DEVELOPMENT & CODE ===
  // Kimi Dev 72B - Best for programming and development tasks
  if (msgLower.includes('code') || msgLower.includes('programming') || msgLower.includes('script') ||
      msgLower.includes('function') || msgLower.includes('javascript') || msgLower.includes('html') ||
      msgLower.includes('css') || msgLower.includes('python') || msgLower.includes('react') ||
      msgLower.includes('api') || msgLower.includes('database') || msgLower.includes('debug') ||
      msgLower.includes('framework') || msgLower.includes('library') || msgLower.includes('development')) {
    return {
      handler: '/api/kimi-dev-72b',
      model: 'kimi_dev_72b',
      reason: 'Development/code query - using Kimi Dev 72B',
      confidence: 0.85
    };
  }

  // === CREATIVE & WRITING ===
  // Qwerky 72B - Best for creative and innovative tasks
  if (msgLower.includes('creative') || msgLower.includes('write') || msgLower.includes('story') ||
      msgLower.includes('design') || msgLower.includes('innovative') || msgLower.includes('brainstorm') ||
      msgLower.includes('idea') || msgLower.includes('poem') || msgLower.includes('marketing') ||
      msgLower.includes('content') || msgLower.includes('blog') || msgLower.includes('article')) {
    return {
      handler: '/api/qwerky-72b',
      model: 'qwerky_72b',
      reason: 'Creative/writing task - using Qwerky 72B',
      confidence: 0.8
    };
  }

  // === VISUAL & MULTIMODAL ===
  // Llama 3.2 Vision - Best for visual analysis and image tasks
  if (msgLower.includes('image') || msgLower.includes('visual') || msgLower.includes('photo') ||
      msgLower.includes('picture') || msgLower.includes('see') || msgLower.includes('look at') ||
      msgLower.includes('describe') || msgLower.includes('analyze image') || msgLower.includes('what do you see')) {
    return {
      handler: '/api/llama32-vision',
      model: 'llama32_vision',
      reason: 'Visual analysis - using Llama 3.2 Vision',
      confidence: 0.9
    };
  }

  // === PERFORMANCE & EFFICIENCY ===
  // Nemotron Super 49B - Best for performance-critical tasks
  if (msgLower.includes('performance') || msgLower.includes('efficiency') || msgLower.includes('speed') ||
      msgLower.includes('optimize') || msgLower.includes('benchmark') || msgLower.includes('fast') ||
      msgLower.includes('quick analysis') || msgLower.includes('rapid')) {
    return {
      handler: '/api/nemotron-super-49b',
      model: 'nemotron_super_49b',
      reason: 'Performance task - using Nemotron Super 49B',
      confidence: 0.85
    };
  }

  // === ADVANCED REASONING & MAVERICK TASKS ===
  // Llama 4 Maverick - Best for advanced reasoning and complex problem-solving
  if (msgLower.includes('advanced') || msgLower.includes('complex problem') || msgLower.includes('sophisticated') ||
      msgLower.includes('maverick') || msgLower.includes('unconventional') || msgLower.includes('innovative approach') ||
      msgLower.includes('think outside') || msgLower.includes('creative solution')) {
    return {
      handler: '/api/llama4-maverick',
      model: 'llama4_maverick',
      reason: 'Advanced reasoning - using Llama 4 Maverick',
      confidence: 0.85
    };
  }

  // === BUSINESS & SERVICE QUERIES ===
  // Moonlight 16B - Best for business and service-related queries
  if (msgLower.includes('price') || msgLower.includes('service') || msgLower.includes('wash') || 
      msgLower.includes('detail') || msgLower.includes('ceramic') || msgLower.includes('quote') ||
      msgLower.includes('appointment') || msgLower.includes('book') || msgLower.includes('location') ||
      msgLower.includes('business') || msgLower.includes('customer') || msgLower.includes('consultation')) {
    return {
      handler: '/api/moonlight-16b',
      model: 'moonlight_16b',
      reason: 'Business/service query - using Moonlight 16B',
      confidence: 0.8
    };
  }

  // === DOLPHIN ASSISTED TASKS ===
  // Dolphin Mistral 24B - Best for assisted and guided tasks
  if (msgLower.includes('help') || msgLower.includes('assist') || msgLower.includes('guide') ||
      msgLower.includes('tutorial') || msgLower.includes('step by step') || msgLower.includes('walk through') ||
      msgLower.includes('how to') || msgLower.includes('instructions')) {
    return {
      handler: '/api/dolphin-mistral-24b',
      model: 'dolphin_mistral_24b',
      reason: 'Assisted task - using Dolphin Mistral 24B',
      confidence: 0.82
    };
  }

  // === QUICK & SIMPLE QUERIES ===
  // Reka Flash 3 - Best for quick, simple questions
  if (msgLower.length < 50 || msgLower.includes('hello') || msgLower.includes('hi ') || 
      msgLower.includes('what is') || msgLower.includes('who is') || msgLower.includes('quick question') ||
      msgLower.includes('simple') || msgLower.includes('briefly')) {
    return {
      handler: '/api/reka-flash-3',
      model: 'reka_flash_3',
      reason: 'Quick query - using Reka Flash 3',
      confidence: 0.8
    };
  }

  // === DEFAULT GENERAL QUERIES ===
  // Llama 4 Scout - Best for general, balanced tasks
  return {
    handler: '/api/llama4-scout',
    model: 'llama4_scout',
    reason: 'General query - using Llama 4 Scout',
    confidence: 0.7
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