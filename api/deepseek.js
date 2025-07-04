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
    const err = new Error('Request body is required');
    err.status = 400;
    throw err;
  }

  // Support both legacy (prompt) and new (messages) format
  let messages = null;
  if (Array.isArray(body.messages)) {
    messages = body.messages.map(msg => {
      if (!msg.role || !msg.content) {
        const err = new Error('Each message must have role and content');
        err.status = 400;
        throw err;
      }
      return { role: msg.role, content: String(msg.content) };
    });
    if (messages.length === 0) {
      const err = new Error('messages array cannot be empty');
      err.status = 400;
      throw err;
    }
  }

  // Fallback to single prompt
  let prompt = body.prompt;
  if (!messages && (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0)) {
    const err = new Error('prompt is required and must be a string');
    err.status = 400;
    throw err;
  }
  if (prompt && prompt.length > 10000) {
    const err = new Error('prompt is too long (max 10000 characters)');
    err.status = 400;
    throw err;
  }

  // role is optional, default to 'chat'
  const role = body.role || 'chat';
  if (typeof role !== 'string') {
    const err = new Error('role must be a string');
    err.status = 400;
    throw err;
  }

  // model is optional, for explicit model selection
  const model = body.model && typeof body.model === 'string' ? body.model : null;

  return {
    prompt: prompt ? prompt.trim() : '',
    role: role,
    messages: messages,
    model: model
  };
}

/**
 * Call OpenRouter API
 */
async function callDeepSeek(prompt, role, messages, explicitModel) {
  // Lightweight ML intent detection using Hugging Face zero-shot-classification
  async function zeroShotRole(prompt, candidateLabels) {
    const hfApiKey = process.env.HF_API_KEY;
    if (!hfApiKey) return null;
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-mnli', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sequence: prompt,
          labels: candidateLabels
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.labels && data.scores && data.labels.length > 0 && data.scores.length > 0) {
        // Only accept if confidence is high enough
        if (data.scores[0] > 0.55) {
          return data.labels[0];
        }
      }
      return null;
    } catch (e) {
      console.error('Hugging Face zero-shot error:', e);
      return null;
    }
  }
  // Use the new OpenRouter API Key
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENROUTER_API_KEY environment variable is not set');
    err.status = 500;
    throw err;
  }

  // Enhanced prompts based on role (this logic remains the same)
  const rolePrompts = {
    reasoning: `You are an expert reasoning AI. Please analyze this step-by-step and provide logical conclusions: ${prompt}`,
    tools: `You are a helpful assistant for car detailing tools and equipment. Help with: ${prompt}`,
    quotes: `You are a car detailing pricing expert. Provide accurate pricing estimates for: ${prompt}`,
    photo_uploads: `You are an image analysis expert for car detailing. The user has uploaded an image for analysis. Please provide detailed car detailing recommendations based on this context: ${prompt}`,
    summaries: `Please provide a clear and concise summary of: ${prompt}`,
    search: `Please search your knowledge and provide relevant information about: ${prompt}`,
    analytics: `Please analyze the data and provide insights about: ${prompt}`,
    accessibility: `Please provide accessible and helpful information about: ${prompt}`,
    chat: `You are Jay's Mobile Wash AI assistant. You're friendly, knowledgeable about car detailing, and always ready to help customers. Respond to: ${prompt}`,
    fallback: `Please help with: ${prompt}`
  };

  // Multi-model support: map roles to free OpenRouter models
  const modelMap = {
    reasoning: 'qwen/qwen3-30b-a3b:free',
    tools: 'mistralai/mistral-7b-instruct:free',
    quotes: 'meta-llama/llama-3-8b-instruct:free',
    photo_uploads: 'google/gemma-7b-it:free',
    summaries: 'mistralai/mistral-7b-instruct:free',
    search: 'google/gemma-7b-it:free',
    analytics: 'meta-llama/llama-3-8b-instruct:free',
    accessibility: 'mistralai/mistral-7b-instruct:free',
    chat: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    fallback: 'mistralai/mistral-7b-instruct:free',
    qwen: 'qwen/qwen3-30b-a3b:free',
    gemini: 'google/gemma-7b-it:free',
    mistral: 'mistralai/mistral-7b-instruct:free',
    llama: 'meta-llama/llama-3-8b-instruct:free',
    deepseek: 'deepseek/deepseek-r1-0528-qwen3-8b:free'
  };

  // Advanced auto role detection for 'auto' option

  async function detectRoleAuto(prompt) {
    // Try ML zero-shot first
    const candidateLabels = [
      'reasoning', 'tools', 'quotes', 'photo_uploads', 'summaries', 'search', 'analytics', 'accessibility', 'chat'
    ];
    let mlRole = null;
    try {
      mlRole = await zeroShotRole(prompt, candidateLabels);
    } catch (e) {
      mlRole = null;
    }
    if (mlRole && candidateLabels.includes(mlRole)) {
      return mlRole;
    }
    // Fallback to rules-based scoring if ML is not confident or fails
    const lower = prompt.toLowerCase();
    let scores = {
      reasoning: 0,
      tools: 0,
      quotes: 0,
      photo_uploads: 0,
      summaries: 0,
      search: 0,
      analytics: 0,
      accessibility: 0,
      chat: 0
    };
    const keywordMap = {
      reasoning: [
        'reason', 'analyz', 'explain', 'step by step', 'why', 'logic', 'deduce', 'diagnose', 'cause', 'how do', 'can you explain', '?'
      ],
      tools: [
        'tool', 'equipment', 'supply', 'product', 'device', 'machine', 'accessory', 'kit', 'what do i need', 'which tool', 'equipment needed'
      ],
      quotes: [
        'price', 'quote', 'cost', 'estimate', 'how much', '$', 'fee', 'charge', 'rate', 'pricing', 'total', 'invoice'
      ],
      photo_uploads: [
        'photo', 'image', 'upload', 'picture', 'see attached', '.jpg', '.png', '.jpeg', 'analyze this image', 'analyze this photo', 'attached file'
      ],
      summaries: [
        'summary', 'summarize', 'recap', 'overview', 'tl;dr', 'in short', 'in summary', 'briefly', 'can you summarize', 'main points'
      ],
      search: [
        'search', 'find', 'lookup', 'look up', 'discover', 'where can i', 'resource', 'reference', 'information about', 'can you find'
      ],
      analytics: [
        'analyz', 'insight', 'data', 'trend', 'statistic', 'report', 'pattern', 'analyze the data', 'insights', 'metrics'
      ],
      accessibility: [
        'accessib', 'accessible', 'disability', 'screen reader', 'contrast', 'readable', 'easy to read', 'for blind', 'for visually impaired', 'ada'
      ]
    };
    for (const [role, keywords] of Object.entries(keywordMap)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) scores[role] += 2;
      }
    }
    if (lower.includes('?')) {
      scores.reasoning += 1;
      scores.search += 1;
    }
    if (/\$|\d+\s*(usd|dollars|bucks|eur|eur|gbp|pounds)/.test(lower)) {
      scores.quotes += 2;
    }
    if (/(summary|summarize|tl;dr|recap|overview|main points|in short)/.test(lower)) {
      scores.summaries += 2;
    }
    if (/(tool|equipment|supply|device|machine|kit)/.test(lower)) {
      scores.tools += 2;
    }
    if (/(photo|image|upload|picture|attached|\.jpg|\.png|\.jpeg)/.test(lower)) {
      scores.photo_uploads += 2;
    }
    if (lower.match(/\d{2,}/) && lower.match(/(price|cost|quote|estimate|invoice|total)/)) {
      scores.quotes += 1;
    }
    if (lower.match(/(how|why|what|can you|explain|step by step)/)) {
      scores.reasoning += 1;
    }
    let bestRole = 'chat';
    let maxScore = 0;
    for (const [role, score] of Object.entries(scores)) {
      if (score > maxScore) {
        bestRole = role;
        maxScore = score;
      }
    }
    if (Object.values(scores).filter(s => s === maxScore).length > 1 && maxScore > 0) {
      const priority = [
        'photo_uploads', 'quotes', 'reasoning', 'summaries', 'tools', 'analytics', 'search', 'accessibility', 'chat'
      ];
      for (const p of priority) {
        if (scores[p] === maxScore) {
          bestRole = p;
          break;
        }
      }
    }
    return bestRole;
  }

  let selectedRole = role;
  if (role === 'auto') {
    // If ML is available, use it (await)
    selectedRole = await detectRoleAuto(prompt);
  }

  // If explicit model is provided and valid, use it
  let selectedModel = null;
  if (explicitModel && typeof explicitModel === 'string') {
    // Only allow if in modelMap values (for security)
    const allowedModels = Object.values(modelMap);
    if (allowedModels.includes(explicitModel)) {
      selectedModel = explicitModel;
    } else {
      // fallback to role-based
      selectedModel = modelMap[selectedRole] || modelMap['fallback'];
    }
  } else {
    selectedModel = modelMap[selectedRole] || modelMap['fallback'];
  }
  // Log for debugging which model is being selected
  console.log('Selected role:', selectedRole, 'Selected model:', selectedModel);

  let messagesToSend = [];
  if (Array.isArray(messages) && messages.length > 0) {
    // Use provided messages array, but enhance the last user message with the role prompt
    messagesToSend = messages.map((msg, idx) => {
      if (idx === messages.length - 1 && msg.role === 'user') {
        return { role: msg.role, content: (rolePrompts[selectedRole] || rolePrompts.chat) + msg.content };
      }
      return msg;
    });
  } else {
    // Fallback: single message with enhanced prompt
    messagesToSend = [ { role: 'user', content: (rolePrompts[selectedRole] || rolePrompts.chat) + prompt } ];
  }

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
        model: selectedModel,
        messages: messagesToSend
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', response.status, errorText);
      // Updated error handling for OpenRouter
      if (response.status === 401) {
        const err = new Error('Invalid OpenRouter API key');
        err.status = 401;
        throw err;
      } else if (response.status === 429) {
        const err = new Error('Rate limit exceeded. Please try again later.');
        err.status = 429;
        throw err;
      } else {
        const err = new Error(`OpenRouter API error: ${response.status} ${errorText}`);
        err.status = response.status;
        throw err;
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
    return { responseText, selectedModel };
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
    const { prompt, role, messages, model } = validateRequestBody(req.body);

    // Call DeepSeek API with memory support and explicit model if provided
    const aiResult = await callDeepSeek(prompt, role, messages, model);

    // Return successful response, include model used
    return res.status(200).json({
      response: aiResult.responseText,
      role: 'assistant',
      model: aiResult.selectedModel
    });

  } catch (error) {
    console.error('API Error:', error);

    // Use status from error if available, otherwise 500
    const status = error.status || 500;
    let errorType = 'Internal Server Error';
    if (status === 400) errorType = 'Bad Request';
    if (status === 401) errorType = 'Unauthorized';
    if (status === 429) errorType = 'Rate Limit Exceeded';
    if (status === 500) errorType = 'Configuration Error';

    return res.status(status).json({
      error: errorType,
      message: error.message || 'An unknown error occurred.'
    });
  }
}

export default handler;
