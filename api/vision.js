/**
 * Vision API Handler - Image Analysis using HuggingFace Vision Models
 * Handles POST requests to /api/vision for image analysis functionality
 *
 * Expected request body: { prompt: string, role?: string, model?: string, messages?: array, image?: string }
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
    const role = body.role || 'photo_analysis';
    const model = body.model || 'llama32_vision';
    const messages = body.messages || null;
    const image = body.image || null;

    if (!prompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Prompt or messages array is required' }));
      return;
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ error: 'HUGGINGFACE_API_KEY environment variable is not set' }));
      return;
    }

    // Vision-capable models mapping
    const visionModels = {
      'llama32_vision': 'meta-llama/Llama-3.2-11B-Vision-Instruct',
      'vision_hf': 'microsoft/kosmos-2-patch14-224',
      'blip2_hf': 'Salesforce/blip2-opt-2.7b',
      'vision': 'meta-llama/Llama-3.2-11B-Vision-Instruct' // Default fallback
    };

    const selectedModel = visionModels[model] || visionModels['vision'];

    // Specialized system prompt for vehicle image analysis
    const systemPrompt = `You are Jay's Mobile Wash AI assistant specializing in vehicle image analysis. When analyzing vehicle photos, provide detailed observations about:

1. VEHICLE CONDITION: Overall cleanliness, visible dirt, stains, or damage
2. EXTERIOR NEEDS: Paint condition, wheels, chrome, windows, trim
3. INTERIOR NEEDS: Seats, carpets, dashboard, console condition
4. RECOMMENDED SERVICES: Based on what you observe, recommend appropriate Jay's services

Jay's Mobile Wash Services:
- Mini Detail: $70 (1-1.5 hours) - Basic interior and exterior cleaning
- Luxury Detail: $130 (2-3 hours) - Comprehensive detailing with leather conditioning  
- Max Detail: $200 (3-4 hours) - Premium full-service with engine bay cleaning
- Ceramic Coating: $450 (2+ year protection)
- Graphene Coating: $800 (3+ year premium protection)

Always provide specific, actionable recommendations based on visual analysis.`;

    let formattedPrompt;
    if (Array.isArray(messages) && messages.length > 0) {
      formattedPrompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    } else {
      formattedPrompt = `${systemPrompt}\n\nUser: ${prompt}\nImage Analysis Assistant:`;
    }

    console.log('👁️ Using Vision model:', selectedModel);
    console.log('🔍 Formatted prompt:', formattedPrompt.substring(0, 200) + '...');

    const requestBody = {
      inputs: formattedPrompt,
      parameters: {
        max_length: 1024,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false
      }
    };

    // If image data is provided, include it in the request
    if (image) {
      requestBody.inputs = {
        text: formattedPrompt,
        image: image
      };
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${selectedModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🌐 Vision API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vision API Error:', response.status, errorText);
      
      if (response.status === 503) {
        res.writeHead(503, corsHeaders);
        res.end(JSON.stringify({
          error: 'Vision model is loading. Please try again in a few minutes.',
          model: selectedModel,
          fallback: 'Using text-based analysis instead.'
        }));
        return;
      }
      
      res.writeHead(response.status, corsHeaders);
      res.end(JSON.stringify({
        error: `Vision API Error: ${response.status} - ${errorText}`,
        model: selectedModel
      }));
      return;
    }

    const data = await response.json();
    console.log('🌐 Vision API response data:', data);

    let responseText = '';
    if (Array.isArray(data) && data.length > 0) {
      responseText = data[0].generated_text || data[0].text || data[0].caption || 'No analysis generated';
    } else if (data.generated_text) {
      responseText = data.generated_text;
    } else if (data.caption) {
      responseText = `Based on the image analysis: ${data.caption}`;
    } else {
      responseText = 'I analyzed the image but received an unexpected response format. Please try again.';
    }

    // Clean up response text and enhance for Jay's business
    if (responseText) {
      responseText = responseText
        .replace(/^\s*User:.*?Image Analysis Assistant:\s*/g, '')
        .replace(/^<s>|<\/s>$/g, '')
        .trim();
      
      // If response is very short, enhance it with Jay's context
      if (responseText.length < 100) {
        responseText = `Image Analysis Results: ${responseText}\n\nBased on this analysis, I recommend discussing our detailing services to address any areas that need attention. Contact Jay's Mobile Wash at (562) 228-9429 for a personalized quote.`;
      }
    }

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ 
      responseText,
      selectedModel,
      analysisType: 'vision'
    }));

  } catch (error) {
    console.error('❌ Vision API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ 
      error: error.message,
      fallback: 'Please try uploading the image again or contact us directly at (562) 228-9429'
    }));
  }
}