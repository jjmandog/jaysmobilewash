/**
 * OpenRouter API - Proxy to OpenRouter with Jay's Mobile Wash context
 * Handles all AI models through OpenRouter with proper error handling
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.error(`❌ Method ${req.method} not allowed for OpenRouter API`);
    return res.status(405).json({ 
      error: 'Method not allowed', 
      message: 'OpenRouter API only accepts POST requests',
      allowedMethods: ['POST']
    });
  }

  try {
    const { prompt, role, messages, model } = req.body;

    console.log(`🔗 OpenRouter API received: role=${role}, model='${model}', hasMessages=${!!messages}, hasPrompt=${!!prompt}`);
    console.log(`🔗 Full request body:`, JSON.stringify(req.body, null, 2));

    if (!prompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      console.error('❌ Missing prompt and messages in request body');
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Either prompt or messages array is required' 
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY environment variable not set');
      return res.status(500).json({ 
        error: 'Configuration error', 
        message: 'OpenRouter API key not configured' 
      });
    }

    // Build system prompt with Jay's Mobile Wash info (for all requests)
    const jaySystemPrompt = `You are Jay's Mobile Wash AI assistant. Jay's Mobile Wash is a premium mobile car detailing service serving Los Angeles and Orange County. Services include: Mini Detail ($70), Luxury Detail ($130), Max Detail ($200), Ceramic Coating ($450, 2-3 year protection), Graphene Coating ($800, 3-5 year protection), Paint Correction, and more. Contact: (562) 228-9429, info@jaysmobilewash.net. Hours: Mon-Fri 8am-6pm, Sat-Sun 9am-5pm. Address: 16845 S Hoover St, Gardena, CA 90247. Always answer in a friendly, human, non-corny tone. Use this info ONLY if the user asks about Jay's company, services, pricing, location, or contact. For all other topics, answer as a general AI assistant.`;
    
    let messagesToSend = [];
    if (Array.isArray(messages) && messages.length > 0) {
      // Prepend system prompt if not already present
      if (!messages[0] || messages[0].role !== 'system') {
        messagesToSend = [{ role: 'system', content: jaySystemPrompt }, ...messages];
      } else {
        messagesToSend = messages;
      }
    } else {
      messagesToSend = [
        { role: 'system', content: jaySystemPrompt },
        { role: 'user', content: prompt }
      ];
    }

    // Model selection based on explicit model parameter, then role
    let selectedModel = 'deepseek/deepseek-chat'; // Default fallback
    // [FORCE] Always use the model from the request if present and non-empty
    if (typeof model === 'string' && model.trim().length > 0) {
      selectedModel = model.trim();
      console.log(`🎯 [FORCE] Using user-selected model: '${selectedModel}'`);
    } else if (role) {
      // Otherwise use role-based model selection
      console.log(`🤖 No explicit model provided, using role-based selection for role: '${role}'`);
      const modelMap = {
        reasoning: 'google/gemma-7b-it:free',
        tools: 'mistralai/mistral-7b-instruct:free',
        quotes: 'meta-llama/llama-3-8b-instruct:free',
        photo_uploads: 'google/gemma-7b-it:free',
        summaries: 'mistralai/mistral-7b-instruct:free',
        search: 'google/gemma-7b-it:free',
        analytics: 'meta-llama/llama-3-8b-instruct:free',
        accessibility: 'mistralai/mistral-7b-instruct:free',
        chat: 'deepseek/deepseek-chat',
        fallback: 'deepseek/deepseek-chat'
      };
      selectedModel = modelMap[role] || selectedModel;
      console.log(`🤖 Using role-based model for '${role}': ${selectedModel}`);
    } else {
      console.log(`🔄 Using default model: ${selectedModel}`);
    }

    console.log(`🔗 [FORCE] FINAL MODEL SELECTION: ${selectedModel} (from model='${model}', role='${role}')`);
    console.log(`📤 Sending ${messagesToSend.length} messages to OpenRouter`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jaysmobilewash.net',
        'X-Title': 'JaysMobileWash',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messagesToSend
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown OpenRouter error' }));
      console.error('❌ OpenRouter API Error:', response.status, errorData);
      
      let userFriendlyMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
      if (response.status === 429) {
        userFriendlyMessage = 'AI service is busy. Please wait a moment and try again.';
      } else if (response.status === 401) {
        userFriendlyMessage = 'AI service authentication failed. Please contact support.';
      } else if (response.status === 400) {
        userFriendlyMessage = 'Invalid request format. Please try rephrasing your message.';
      }
      
      return res.status(response.status).json({ 
        error: 'OpenRouter API error',
        message: userFriendlyMessage,
        details: errorData.error || `HTTP ${response.status}`
      });
    }

    const data = await response.json();
    console.log('✅ OpenRouter API success:', data.usage || 'No usage data');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenRouter response format:', data);
      return res.status(500).json({ 
        error: 'Invalid response', 
        message: 'AI service returned unexpected format' 
      });
    }

    // Return standardized response format
    const result = {
      content: data.choices[0].message.content,
      role: data.choices[0].message.role || 'assistant',
      model: selectedModel,
      usage: data.usage || null
    };

    console.log(`✅ Returning response (${result.content?.length || 0} chars)`);
    return res.status(200).json(result);

  } catch (error) {
    console.error('💥 OpenRouter API handler error:', error);
    
    let userFriendlyMessage = 'AI service encountered an error. Please try again.';
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      userFriendlyMessage = 'Unable to connect to AI service. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
      userFriendlyMessage = 'AI service is taking too long to respond. Please try again.';
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: userFriendlyMessage,
      details: error.message
    });
  }
}
