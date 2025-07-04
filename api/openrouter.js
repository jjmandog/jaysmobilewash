/**
 * OpenRouter API Proxy (multi-model, multi-provider)
 * Handles POST requests to /api/openrouter for AI chat functionality
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
    const role = body.role || 'chat';
    const model = body.model || null;
    const messages = body.messages || null;
    if (!prompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Prompt or messages array is required' }));
      return;
    }
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY environment variable is not set' }));
      return;
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
    // Use provided model or fallback to a default
    const selectedModel = model || 'deepseek/deepseek-r1-0528-qwen3-8b:free';
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
      const errorText = await response.text();
      res.writeHead(response.status, corsHeaders);
      res.end(JSON.stringify({ error: errorText }));
      return;
    }
    const data = await response.json();
    let responseText = '';
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      responseText = data.choices[0].message.content;
    } else {
      responseText = 'I received an unexpected response from the AI. Please try again.';
    }
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ responseText, selectedModel }));
  } catch (error) {
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
