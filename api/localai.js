/**
 * LocalAI API Handler
 * Free alternative to OpenAI using LocalAI.io
 * Compatible with OpenAI API format
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, role = 'chat', selectedModel } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // LocalAI endpoint - you can use their hosted version or run locally
    const LOCALAI_ENDPOINT = process.env.LOCALAI_ENDPOINT || 'https://api.localai.io/v1';
    
    // Model selection with EleutherAI support
    let modelName = process.env.LOCALAI_MODEL || 'gpt-3.5-turbo';
    
    // EleutherAI model mappings
    const eleutherAIModels = {
      'gpt-j': 'gpt-j-6b',
      'gpt-neox': 'gpt-neox-20b',
      'pythia': 'pythia-6.9b',
      'eleutherai': 'gpt-j-6b' // default EleutherAI model
    };
    
    // Check if selectedModel is EleutherAI and map it
    if (selectedModel && selectedModel.includes('eleutherai')) {
      modelName = eleutherAIModels.eleutherai;
    } else if (selectedModel && eleutherAIModels[selectedModel]) {
      modelName = eleutherAIModels[selectedModel];
    }
    
    console.log('🤖 Using LocalAI model:', modelName, 'for role:', role);

    // System prompts for different roles
    const systemPrompts = {
      chat: "You are Jay's Mobile Wash AI assistant. Help customers with car detailing questions, pricing, and services. Be professional and knowledgeable about car care.",
      reasoning: "You are a logical reasoning assistant for Jay's Mobile Wash. Analyze problems step-by-step and provide clear, reasoned solutions.",
      quotes: "You are a pricing specialist for Jay's Mobile Wash. Provide accurate service quotes based on vehicle type and requested services.",
      photo_uploads: "You are a car detailing expert who analyzes photos. Identify issues and recommend specific services from Jay's Mobile Wash.",
      summaries: "You are a summary specialist. Provide concise, clear summaries of car detailing topics and service information.",
      tools: "You are a car detailing tools expert. Recommend specific tools and techniques for various car care tasks."
    };

    const systemPrompt = systemPrompts[role] || systemPrompts.chat;

    const response = await fetch(`${LOCALAI_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOCALAI_API_KEY || 'sk-free'}`,
      },
      body: JSON.stringify({
        model: LOCALAI_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      console.error('LocalAI API error:', response.status, response.statusText);
      
      // Fallback response if LocalAI fails
      const fallbackResponses = {
        chat: "I'm Jay's Mobile Wash AI assistant. I'm here to help with your car detailing needs! Could you tell me more about what service you're looking for?",
        reasoning: "Let me analyze this step by step. Based on your request, I'll provide a logical breakdown of the best approach for your car detailing needs.",
        quotes: "For an accurate quote, I'd need to know your vehicle type and which services interest you. Our packages range from $70-$800 depending on the level of detail.",
        photo_uploads: "I can help analyze your vehicle's condition. Please describe the areas of concern and I'll recommend the best services.",
        summaries: "Here's a summary of Jay's Mobile Wash services: Mini Detail ($70), Luxury Detail ($130), Max Detail ($200), Ceramic Coating ($450), Graphene Coating ($800).",
        tools: "For car detailing, essential tools include microfiber cloths, quality car soap, clay bars, polishing compounds, and protective waxes or coatings."
      };
      
      return res.status(200).json({
        responseText: fallbackResponses[role] || fallbackResponses.chat,
        selectedModel: 'localai-fallback',
        source: 'fallback'
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I had trouble processing your request. Please try again.';

    return res.status(200).json({
      responseText: aiResponse,
      selectedModel: LOCALAI_MODEL,
      source: 'localai'
    });

  } catch (error) {
    console.error('LocalAI handler error:', error);
    
    return res.status(200).json({
      responseText: "I'm Jay's Mobile Wash AI assistant. I'm experiencing some technical difficulties, but I'm here to help with your car detailing questions. What can I assist you with today?",
      selectedModel: 'error-fallback',
      source: 'fallback'
    });
  }
}
