/**
 * Llama 3.3 API Handler (Gated Access via HuggingFace)
 * Handles POST requests to /api/llama33 for AI chat functionality using Meta's Llama 3.3 models
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

    // Map Llama 3.3 model IDs to HuggingFace model names (gated access)
    const modelMapping = {
      'llama33_70b': 'meta-llama/Llama-3.3-70B-Instruct',
      'llama33': 'meta-llama/Llama-3.3-70B-Instruct' // Legacy ID support
    };

    const selectedModel = modelMapping[model] || 'meta-llama/Llama-3.3-70B-Instruct';

    // Use HuggingFace API with gated access
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ error: 'HUGGINGFACE_API_KEY environment variable is not set' }));
      return;
    }

    const systemPrompt = `You are Jay's Mobile Wash AI assistant powered by Llama 3.3. Always answer in a friendly, human tone. Use Jay's business info ONLY if the user asks about services, pricing, location, or contact. For other topics, answer as a general AI assistant.

Jay's Mobile Wash Services:
- Mini Detail: $70 (1-1.5 hours) - Basic interior and exterior cleaning
- Luxury Detail: $130 (2-3 hours) - Comprehensive detailing with leather conditioning
- Max Detail: $200 (3-4 hours) - Premium full-service with engine bay cleaning
- Ceramic Coating: $450 (2+ year protection)
- Graphene Coating: $800 (3+ year premium protection)

Service Areas: Los Angeles, Orange County, Beverly Hills
Phone: (562) 228-9429
Website: jaysmobilewash.net`;

    // Format prompt for HuggingFace
    let formattedPrompt;
    if (Array.isArray(messages) && messages.length > 0) {
      // Convert messages to HuggingFace format
      formattedPrompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    } else {
      formattedPrompt = `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`;
    }

    console.log('🦙 Using Llama 3.3 model (via HuggingFace):', selectedModel);

    const response = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_length: 1024,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    console.log('🌐 HuggingFace API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Llama 3.3 API Error:', response.status, errorText);
      
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
        error: `Llama 3.3 API Error: ${response.status} - ${errorText}`,
        model: selectedModel
      }));
      return;
    }

    const data = await response.json();
    console.log('🌐 HuggingFace API response data:', data);

    let responseText = '';
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || data[0].text || 'No response generated';
    } else if (data.generated_text) {
      responseText = data.generated_text;
    } else {
      responseText = 'I received an unexpected response from the AI. Please try again.';
    }

    // Clean up response text
    if (responseText) {
      responseText = responseText
        .replace(/^\s*User:.*?Assistant:\s*/g, '') // Remove prompt echo
        .replace(/(<s>|<\/s>)/g, '') // Remove sentence tags
        .trim();
    }

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ 
      responseText, 
      selectedModel
    }));

  } catch (error) {
    console.error('❌ Llama 3.3 API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
