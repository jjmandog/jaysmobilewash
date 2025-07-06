/**
 * Dolphin 3.0 R1 Mistral 24B API Handler (Free)
 * Handles POST requests to /api/dolphin-mistral-24b for AI chat functionality using Cognitive Computations' Dolphin 3.0 R1 Mistral 24B model
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
    const messages = body.messages || null;

    if (!prompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Prompt or messages array is required' }));
      return;
    }

    // Dolphin 3.0 R1 Mistral 24B model configuration
    const selectedModel = 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free';

    // Use OpenRouter API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY environment variable is not set' }));
      return;
    }

    // Prepare messages for OpenRouter format
    let formattedMessages;
    if (messages && Array.isArray(messages)) {
      formattedMessages = messages;
    } else {
      formattedMessages = [{ role: 'user', content: prompt }];
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jaysmobilewash.net',
        'X-Title': 'Jay\'s Mobile Wash Dolphin Mistral'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, response.statusText, errorText);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ 
        error: 'Dolphin Mistral API request failed',
        details: errorText,
        selectedModel: selectedModel
      }));
      return;
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const responseText = data.choices[0].message.content;
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        responseText,
        selectedModel: selectedModel,
        source: 'openrouter-dolphin-mistral'
      }));
    } else {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ 
        error: 'No response from Dolphin Mistral model',
        selectedModel: selectedModel
      }));
    }

  } catch (error) {
    console.error('Dolphin Mistral handler error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ 
      error: 'Dolphin Mistral handler error: ' + error.message,
      selectedModel: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free'
    }));
  }
}
