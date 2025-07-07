/**
 * Llama 3.1 API Handler (OpenRouter Integration)
 * Handles POST requests to /api/llama31 for AI chat functionality using Meta's Llama 3.1 models
 *
 * Expected request body: { prompt: string, role?: string, model?: string, messages?: array }
 * Returns: { responseText: string, selectedModel: string }
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
    const model = body.model || null;
    const messages = body.messages || null;

    if (!prompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Prompt or messages array is required' }));
      return;
    }

    // Map Llama 3.1 model IDs to OpenRouter model names
    const modelMapping = {
      'llama31_8b': 'meta-llama/llama-3.1-8b-instruct:free',
      'llama31_70b': 'meta-llama/llama-3.1-70b-instruct:free', 
      'llama31_405b': 'meta-llama/llama-3.1-405b-instruct:free',
      'llama': 'meta-llama/llama-3.1-8b-instruct:free'
    };

    const selectedModel = modelMapping[model] || 'meta-llama/llama-3.1-8b-instruct:free';

    // Use OpenRouter API
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY environment variable is not set' }));
      return;
    }

    const systemPrompt = `You are Jay's Mobile Wash AI assistant powered by Llama 3.1. Always answer in a friendly, human tone. Use Jay's business info ONLY if the user asks about services, pricing, location, or contact. For other topics, answer as a general AI assistant.

Jay's Mobile Wash Services:
- Mini Detail: $70 (1-1.5 hours) - Basic interior and exterior cleaning
- Luxury Detail: $130 (2-3 hours) - Comprehensive detailing with leather conditioning
- Max Detail: $200 (3-4 hours) - Premium full-service with engine bay cleaning
- Ceramic Coating: $450 (2+ year protection)
- Graphene Coating: $800 (3+ year premium protection)

Service Areas: Los Angeles, Orange County, Beverly Hills
Phone: (562) 228-9429
Website: jaysmobilewash.net`;

    // Format prompt for OpenRouter
    let formattedPrompt;
    if (Array.isArray(messages) && messages.length > 0) {
      // Convert messages to OpenRouter format
      formattedPrompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    } else {
      formattedPrompt = `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`;
    }

    console.log('🦙 Using Llama 3.1 model (via OpenRouter):', selectedModel);

    const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jaysmobilewash.net',
        'X-Title': 'Jay\'s Mobile Wash'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: Array.isArray(messages) && messages.length > 0 
          ? messages 
          : [{ role: 'user', content: formattedPrompt }],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    console.log('🌐 OpenRouter API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter Llama 3.1 API Error:', response.status, errorText);
      
      if (response.status === 503) {
        res.writeHead(503, corsHeaders);
        res.end(JSON.stringify({
          error: 'Model is loading. Please try again in a few minutes.',
          model: selectedModel
        }));
        return;
      }
      
      res.writeHead(response.status, corsHeaders);
      res.end(JSON.stringify({
        error: `OpenRouter Llama 3.1 API Error: ${response.status} - ${errorText}`,
        model: selectedModel
      }));
      return;
    }

    const data = await response.json();
    console.log('🌐 OpenRouter API response data:', data);

    let responseText = '';
    if (data.choices && data.choices.length > 0) {
      responseText = data.choices[0].message?.content || 'No response generated';
    } else if (data.generated_text) {
      responseText = data.generated_text;
    } else {
      responseText = 'I received an unexpected response from the AI. Please try again.';
    }

    // Clean up response text
    if (responseText) {
      responseText = responseText
        .replace(/^\s*User:.*?Assistant:\s*/g, '') // Remove prompt echo
        .replace(/^<s>|<\/s>$/g, '') // Remove sentence tags
        .trim();
    }

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ 
      responseText, 
      selectedModel
    }));

  } catch (error) {
    console.error('❌ Llama 3.1 API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
