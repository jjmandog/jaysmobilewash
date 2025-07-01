/**
 * Secure serverless API endpoint for proxying AI chat requests to OpenRouter
 * Protects API key from client exposure and prevents scraping
 * 
 * Enhanced with production-ready 405 error handling for better developer experience
 */

// Known bot/crawler/spider user-agents to block
const BLOCKED_USER_AGENTS = [
  'openrouter',
  'bot',
  'crawler',
  'spider',
  'curl',
  'wget',
  'python',
  'scrapy'
];

export default async function handler(req, res) {
  // Only allow POST requests - return detailed error for unsupported methods
  if (req.method !== 'POST') {
    console.warn(`405 Method Not Allowed: ${req.method} request attempted on /api/ai (POST required)`);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: `${req.method} requests are not supported. This endpoint only accepts POST requests.`,
      supportedMethods: ['POST'],
      endpoint: '/api/ai'
    });
  }

  // Block known bot/crawler/spider user-agents
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isBlocked = BLOCKED_USER_AGENTS.some(blockedAgent => 
    userAgent.includes(blockedAgent.toLowerCase())
  );
  
  if (isBlocked) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Validate that API key is available
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Forward request to OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.referer || req.headers.origin || 'https://jaysmobilewash.net',
        'X-Title': "Jay's Mobile Wash"
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: req.body.messages || [],
        max_tokens: req.body.max_tokens || 500,
        temperature: req.body.temperature || 0.7,
        ...req.body
      })
    });

    const responseData = await openRouterResponse.json();

    // Return the response with the same status code from OpenRouter
    return res.status(openRouterResponse.status).json(responseData);

  } catch (error) {
    console.error('API request failed:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}