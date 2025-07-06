/**
 * Llama2 API via OpenRouter
 * Handles POST requests to /api/llama2 for AI chat functionality using Meta's Llama2 models
 *
 * Expected request body: { prompt: string, role?: string, model?: string }
 * Returns: { responseText: string, model: string }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Available Llama2 models on OpenRouter
const LLAMA2_MODELS = {
  'llama2-7b': 'meta-llama/llama-2-7b-chat:free',
  'llama2-7b-chat': 'meta-llama/llama-2-7b-chat:free',
  'llama2-13b-chat': 'meta-llama/llama-2-13b-chat:free',
  'llama2-70b-chat': 'meta-llama/llama-2-70b-chat:free',
  'code-llama-7b': 'meta-llama/codellama-7b-instruct:free',
  'code-llama-13b': 'meta-llama/codellama-13b-instruct:free',
  'code-llama-34b': 'meta-llama/codellama-34b-instruct:free'
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
    const role = body.role || 'chat';
    const modelKey = body.model || 'llama2-7b'; // Default to the base Llama-2-7b model

    if (!prompt) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Prompt is required' }));
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY environment variable is not set' }));
      return;
    }

    const modelName = LLAMA2_MODELS[modelKey] || LLAMA2_MODELS['llama2-7b'];
    
    // Format prompt for Llama2 chat format
    const systemPrompt = `You are Jay's Mobile Wash AI assistant. Always answer in a friendly, human tone. Use Jay's business info ONLY if the user asks about services, pricing, location, or contact. For other topics, answer as a general AI assistant.

Jay's Mobile Wash Services:
- Mini Detail: $70 (1-1.5 hours) - Basic interior and exterior cleaning
- Luxury Detail: $130 (2-3 hours) - Comprehensive detailing with leather conditioning
- Max Detail: $200 (3-4 hours) - Premium full-service with engine bay cleaning
- Ceramic Coating: $450 (2+ year protection)
- Graphene Coating: $800 (3+ year premium protection)

Service Areas: Los Angeles, Orange County, Beverly Hills
Phone: (562) 228-9429
Website: jaysmobilewash.net`;

    // Format prompt differently for base model vs chat model
    let formattedPrompt;
    if (modelKey === 'llama2-7b') {
      // Base model - simpler format
      formattedPrompt = `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`;
    } else {
      // Chat models - use chat format
      formattedPrompt = `<s>[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n\n${prompt} [/INST]`;
    }

    console.log('🦙 Using Llama2 model:', modelName);
    console.log('🔍 Formatted prompt:', formattedPrompt.substring(0, 200) + '...');

    const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jaysmobilewash.net',
        'X-Title': 'Jay\'s Mobile Wash'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: formattedPrompt }],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    console.log('🌐 OpenRouter API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API Error:', response.status, errorText);
      
      if (response.status === 503) {
        res.writeHead(503, corsHeaders);
        res.end(JSON.stringify({
          error: 'Model is loading. Please try again in a few minutes.',
          model: modelName
        }));
        return;
      }
      
      res.writeHead(response.status, corsHeaders);
      res.end(JSON.stringify({
        error: `OpenRouter API Error: ${response.status} - ${errorText}`,
        model: modelName
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
        .replace(/^\s*\[INST\].*?\[\/INST\]\s*/g, '') // Remove instruction tags
        .replace(/^<s>|<\/s>$/g, '') // Remove sentence tags
        .trim();
    }


    // If response is too long, call summarizer endpoint
    let summary = null;
    const SUMMARY_TRIGGER_LENGTH = 700; // You can adjust this threshold
    if (typeof responseText === 'string' && responseText.length > SUMMARY_TRIGGER_LENGTH) {
      try {
        const summarizeRes = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/summarize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: responseText })
        });
        if (summarizeRes.ok) {
          const summarizeData = await summarizeRes.json();
          summary = typeof summarizeData.summary === 'string' ? summarizeData.summary : null;
        } else {
          summary = null;
        }
      } catch (err) {
        summary = null;
      }
    }

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ 
      responseText, 
      summary, // null if not summarized
      model: modelName,
      modelKey: modelKey 
    }));

  } catch (error) {
    console.error('❌ Llama2 API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
