/**
 * Auto Mode API - Smart Model Routing
 * Analyzes incoming messages and routes to the best free AI model
 * 
 * Routing Logic:
 * - Business queries → Llama2 HuggingFace (business/service focused)
 * - Creative/writing → DeepSeek R1 (creative reasoning)
 * - Technical/coding → Qwen 2.5 72B (technical excellence)
 * - Reasoning/analysis → Llama 3.3 70B (powerful reasoning)
 * - Default fallback → DeepSeek direct (reliable & fast)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Auto mode routing logic
const AUTO_MODE_ROUTING = {
  // Business queries - route to Llama2 HuggingFace
  business: {
    keywords: ['service', 'price', 'cost', 'location', 'appointment', 'contact', 'hours', 'detailing', 'wash', 'ceramic', 'graphene', 'mini', 'luxury', 'max', 'beverly hills', 'orange county', 'los angeles', 'jay', 'mobile', 'car wash', 'auto detailing'],
    endpoint: '/api/llama2',
    model: 'llama2-7b-chat'
  },
  // Creative/writing - route to DeepSeek R1
  creative: {
    keywords: ['write', 'story', 'poem', 'creative', 'imagine', 'design', 'art', 'music', 'compose', 'generate', 'create'],
    endpoint: '/api/openrouter',
    model: 'deepseek/deepseek-r1:free'
  },
  // Technical/coding - route to Qwen 2.5 72B
  technical: {
    keywords: ['code', 'programming', 'technical', 'develop', 'debug', 'algorithm', 'software', 'api', 'function', 'javascript', 'python', 'html', 'css', 'database'],
    endpoint: '/api/openrouter',
    model: 'qwen/qwen-2.5-72b-instruct:free'
  },
  // Reasoning/analysis - route to Llama 3.3 70B
  reasoning: {
    keywords: ['analyze', 'explain', 'why', 'how', 'reason', 'logic', 'compare', 'evaluate', 'calculate', 'solve', 'problem', 'think'],
    endpoint: '/api/openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct:free'
  },
  // Default fallback - DeepSeek direct
  fallback: {
    endpoint: '/api/deepseek',
    model: 'deepseek-chat'
  }
};

// Determine the best model for the given prompt
function selectBestModel(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Check business keywords first (highest priority for Jay's Mobile Wash)
  for (const keyword of AUTO_MODE_ROUTING.business.keywords) {
    if (lowerPrompt.includes(keyword)) {
      return {
        category: 'business',
        endpoint: AUTO_MODE_ROUTING.business.endpoint,
        model: AUTO_MODE_ROUTING.business.model,
        reason: `Business query detected (keyword: "${keyword}")`
      };
    }
  }
  
  // Check creative keywords
  for (const keyword of AUTO_MODE_ROUTING.creative.keywords) {
    if (lowerPrompt.includes(keyword)) {
      return {
        category: 'creative',
        endpoint: AUTO_MODE_ROUTING.creative.endpoint,
        model: AUTO_MODE_ROUTING.creative.model,
        reason: `Creative query detected (keyword: "${keyword}")`
      };
    }
  }
  
  // Check technical keywords
  for (const keyword of AUTO_MODE_ROUTING.technical.keywords) {
    if (lowerPrompt.includes(keyword)) {
      return {
        category: 'technical',
        endpoint: AUTO_MODE_ROUTING.technical.endpoint,
        model: AUTO_MODE_ROUTING.technical.model,
        reason: `Technical query detected (keyword: "${keyword}")`
      };
    }
  }
  
  // Check reasoning keywords
  for (const keyword of AUTO_MODE_ROUTING.reasoning.keywords) {
    if (lowerPrompt.includes(keyword)) {
      return {
        category: 'reasoning',
        endpoint: AUTO_MODE_ROUTING.reasoning.endpoint,
        model: AUTO_MODE_ROUTING.reasoning.model,
        reason: `Reasoning query detected (keyword: "${keyword}")`
      };
    }
  }
  
  // Default fallback
  return {
    category: 'fallback',
    endpoint: AUTO_MODE_ROUTING.fallback.endpoint,
    model: AUTO_MODE_ROUTING.fallback.model,
    reason: 'No specific category detected, using fallback'
  };
}

// Forward request to the selected endpoint
async function forwardRequest(endpoint, requestBody, selectedModel) {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  
  // Prepare the request body with the selected model
  const forwardBody = {
    ...requestBody,
    model: selectedModel.model
  };
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(forwardBody)
  });
  
  if (!response.ok) {
    throw new Error(`Forwarded request failed: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

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
    const role = body.role || 'chat';

    if (!prompt) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Prompt is required' }));
      return;
    }

    // Select the best model for this prompt
    const selectedModel = selectBestModel(prompt);
    
    console.log('🤖 Auto Mode Selection:', {
      category: selectedModel.category,
      endpoint: selectedModel.endpoint,
      model: selectedModel.model,
      reason: selectedModel.reason,
      prompt: prompt.substring(0, 100) + '...'
    });

    try {
      // Forward the request to the selected endpoint
      const result = await forwardRequest(selectedModel.endpoint, body, selectedModel);
      
      // Add auto mode metadata to the response
      const response = {
        ...result,
        autoMode: {
          selectedCategory: selectedModel.category,
          selectedModel: selectedModel.model,
          selectedEndpoint: selectedModel.endpoint,
          reason: selectedModel.reason
        }
      };

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify(response));
      
    } catch (forwardError) {
      console.error('❌ Forward request failed, trying fallback:', forwardError);
      
      // If the selected model fails, try the fallback
      if (selectedModel.category !== 'fallback') {
        try {
          const fallbackModel = {
            category: 'fallback',
            endpoint: AUTO_MODE_ROUTING.fallback.endpoint,
            model: AUTO_MODE_ROUTING.fallback.model
          };
          
          const fallbackResult = await forwardRequest(fallbackModel.endpoint, body, fallbackModel);
          
          const response = {
            ...fallbackResult,
            autoMode: {
              selectedCategory: 'fallback',
              selectedModel: fallbackModel.model,
              selectedEndpoint: fallbackModel.endpoint,
              reason: `Original selection failed, using fallback (${selectedModel.reason})`
            }
          };

          res.writeHead(200, corsHeaders);
          res.end(JSON.stringify(response));
          
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          res.writeHead(500, corsHeaders);
          res.end(JSON.stringify({ 
            error: 'Auto mode failed: both selected model and fallback failed',
            details: {
              selectedError: forwardError.message,
              fallbackError: fallbackError.message
            }
          }));
        }
      } else {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ 
          error: 'Auto mode failed: fallback model failed',
          details: forwardError.message
        }));
      }
    }

  } catch (error) {
    console.error('❌ Auto Mode API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
