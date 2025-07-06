/**
 * LocalAI Model Manager
 * Fetches and displays available models from LocalAI instance
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  try {
    // Try multiple LocalAI endpoints
    const endpoints = [
      process.env.LOCALAI_ENDPOINT || 'http://localhost:8080/v1',
      'https://api.localai.io/v1',
      'http://127.0.0.1:8080/v1'
    ];

    let models = [];
    let workingEndpoint = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint}`);
        
        const response = await fetch(`${endpoint}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.LOCALAI_API_KEY || 'sk-free'}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        if (response.ok) {
          const data = await response.json();
          models = data.data || data.models || [];
          workingEndpoint = endpoint;
          console.log(`✅ Connected to ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${endpoint}:`, error.message);
        continue;
      }
    }

    // If no endpoints work, return fallback models
    if (!workingEndpoint) {
      console.log('🔄 No endpoints available, returning fallback models');
      models = [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fallback)', status: 'fallback' },
        { id: 'gpt-4', name: 'GPT-4 (Fallback)', status: 'fallback' },
        { id: 'text-embedding-ada-002', name: 'Text Embeddings (Fallback)', status: 'fallback' }
      ];
      workingEndpoint = 'fallback';
    }

    // Test each model with a simple request
    const modelStatus = await Promise.all(
      models.map(async (model) => {
        if (model.status === 'fallback') return model;
        
        try {
          const testResponse = await fetch(`${workingEndpoint}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.LOCALAI_API_KEY || 'sk-free'}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: model.id,
              messages: [{ role: 'user', content: 'Hi' }],
              max_tokens: 1
            }),
            timeout: 3000
          });

          return {
            ...model,
            status: testResponse.ok ? 'available' : 'error',
            endpoint: workingEndpoint
          };
        } catch (error) {
          return {
            ...model,
            status: 'error',
            error: error.message,
            endpoint: workingEndpoint
          };
        }
      })
    );

    return res.status(200).json({
      endpoint: workingEndpoint,
      total_models: modelStatus.length,
      available_models: modelStatus.filter(m => m.status === 'available').length,
      fallback_models: modelStatus.filter(m => m.status === 'fallback').length,
      error_models: modelStatus.filter(m => m.status === 'error').length,
      models: modelStatus,
      setup_instructions: {
        local: "Run: docker-compose up -d",
        cloud: "Deploy to Railway/Render with Docker",
        test: "curl -X POST /api/localai -d '{\"prompt\":\"test\"}'"
      }
    });

  } catch (error) {
    console.error('LocalAI models handler error:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch models',
      message: error.message,
      suggestions: [
        'Start LocalAI: docker-compose up -d',
        'Check if port 8080 is available',
        'Verify Docker is running',
        'Try: docker run -p 8080:8080 localai/localai:latest'
      ]
    });
  }
}
