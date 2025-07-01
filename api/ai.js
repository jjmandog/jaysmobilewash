/**
 * Hardened serverless API endpoint for proxying AI chat requests to OpenRouter
 * - Explicit JSON body parsing (for Vercel/Node.js "Other" projects)
 * - CORS with preflight (OPTIONS)
 * - 405 for non-POST, 403 for bots, 400 for bad JSON, 500 for server errors
 * - No UI or layout changes
 */

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
  // CORS headers (allow any origin; restrict as needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS preflight for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Block known bots/crawlers
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isBlocked = BLOCKED_USER_AGENTS.some(blockedAgent =>
    userAgent.includes(blockedAgent)
  );
  if (isBlocked) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Parse JSON body (robust for Vercel/Node.js)
  let body = req.body;
  if (typeof body === 'undefined' || typeof body === 'string') {
    try {
      let raw = typeof body === 'string' ? body : await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
      });
      body = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  // Validate API key
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY environment variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Proxy request to OpenRouter
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
        messages: body.messages || [],
        max_tokens: body.max_tokens || 500,
        temperature: body.temperature || 0.7,
        ...body
      })
    });

    const responseData = await openRouterResponse.json();
    return res.status(openRouterResponse.status).json(responseData);

  } catch (error) {
    console.error('API request failed:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
