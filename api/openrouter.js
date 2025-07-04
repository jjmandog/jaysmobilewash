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
    // Adjust system prompt to include dynamic context
    const dynamicSystemPrompt = `You are Jay's Mobile Wash AI assistant. Always answer in a friendly, human tone. Use Jay's business info ONLY if the user asks about services, pricing, location, or contact. For other topics, answer as a general AI assistant.`;

    let messagesToSend = [];
    if (Array.isArray(messages) && messages.length > 0) {
      // Prepend dynamic system prompt if not already present
      if (!messages[0] || messages[0].role !== 'system') {
        messagesToSend = [{ role: 'system', content: dynamicSystemPrompt }, ...messages];
      } else {
        messagesToSend = messages;
      }
    } else {
      messagesToSend = [
        { role: 'system', content: dynamicSystemPrompt },
        { role: role, content: prompt } // Use dynamic role
      ];
    }
    // Use provided model or fallback to a default
    const selectedModel = model || 'deepseek/deepseek-r1-0528-qwen3-8b:free';

    // Ensure the selected model is used and log the model and prompt
    console.log('🔍 Selected model:', selectedModel);
    console.log('🔍 Prompt:', prompt);

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

    console.log('🌐 OpenRouter API response status:', response.status);
    const data = await response.json();
    console.log('🌐 OpenRouter API response data:', data);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API Error:', response.status, errorText);
      if (response.status === 500 && selectedModel === 'google/gemma-7b-it') {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          error: `The selected model (${selectedModel}) may not be supported or is temporarily unavailable. Please try another model.`,
          model: selectedModel,
          prompt
        }));
        return;
      }
      res.writeHead(response.status, corsHeaders);
      res.end(JSON.stringify({
        error: `OpenRouter API Error: ${response.status} - ${errorText}`,
        model: selectedModel,
        prompt
      }));
      return;
    }
    let responseText = data.choices && data.choices.length > 0 && data.choices[0].message
      ? data.choices[0].message.content
      : 'I received an unexpected response from the AI. Please try again.';
    // Enhanced sanitization to handle all escape characters and ensure proper formatting
    if (responseText) {
      responseText = responseText
        .replace(/\\"/g, '"') // Replace escaped quotes
        .replace(/\\/g, '')    // Remove unnecessary backslashes
        .replace(/\s+/g, ' ')   // Replace multiple spaces with a single space
        .trim();                 // Trim leading and trailing spaces
    }
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ responseText, selectedModel }));
  } catch (error) {
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
