/**
 * HuggingFace API Handler
 * Handles POST requests to /api/huggingface for AI chat functionality
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

    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ error: 'HF_API_KEY environment variable is not set' }));
      return;
    }

    // Map chatbot model IDs to actual HuggingFace model names
    const modelMapping = {
      'zephyr_hf': 'microsoft/DialoGPT-medium',
      'huggingface': 'microsoft/DialoGPT-medium',
      'mistral_hf': 'microsoft/DialoGPT-medium',
      'llama2_hf': 'microsoft/DialoGPT-medium',
      'llama32_vision': 'microsoft/DialoGPT-medium',
      'vision_hf': 'microsoft/DialoGPT-medium',
      'blip2_hf': 'microsoft/DialoGPT-medium'
    };

    // Use provided model or fallback to a default
    const selectedModel = modelMapping[model] || model || 'microsoft/DialoGPT-medium';

    // Format prompt for HuggingFace
    const systemPrompt = `You are Jay's Mobile Wash AI assistant. Answer questions about car wash services professionally.

Jay's Mobile Wash Services:
- Mini Detail: $70 (1-1.5 hours) - Basic interior and exterior cleaning
- Luxury Detail: $130 (2-3 hours) - Comprehensive detailing with leather conditioning
- Max Detail: $200 (3-4 hours) - Premium full-service with engine bay cleaning
- Ceramic Coating: $450 (2+ year protection)
- Graphene Coating: $800 (3+ year premium protection)

Service Areas: Los Angeles, Orange County, Beverly Hills
Phone: (562) 228-9429
Website: jaysmobilewash.net`;

    let formattedPrompt;
    if (Array.isArray(messages) && messages.length > 0) {
      // Convert messages to a single prompt for DialoGPT
      formattedPrompt = messages.map(msg => msg.content).join(' ');
    } else {
      // Simple prompt format for DialoGPT
      formattedPrompt = prompt;
    }

    console.log('🤗 Using HuggingFace model:', selectedModel);
    console.log('🔍 Formatted prompt:', formattedPrompt.substring(0, 200) + '...');

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
      console.error('❌ HuggingFace API Error:', response.status, errorText);
      
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
        error: `HuggingFace API Error: ${response.status} - ${errorText}`,
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
        .replace(/^<s>|<\/s>$/g, '') // Remove sentence tags
        .trim();
    }

    // Return clean response format (no metadata visible to customers)
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ 
      content: responseText,  // Use 'content' key for consistency
      role: "assistant"       // Always assistant role, no model info exposed
    }));

  } catch (error) {
    console.error('❌ HuggingFace API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
