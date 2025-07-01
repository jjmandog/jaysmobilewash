// /api/ai.js — Vercel serverless function using Hugging Face Inference API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic bot/crawler protection
  const blockedAgents = ['bot', 'crawler', 'spider', 'curl', 'wget', 'python', 'scrapy'];
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (blockedAgents.some(a => ua.includes(a))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Hugging Face API key set in Vercel dashboard
  const hfApiKey = process.env.HF_API_KEY;
  if (!hfApiKey) {
    return res.status(500).json({ error: 'HF_API_KEY not set in environment' });
  }

  let prompt;
  try {
    // For Vercel, req.body is already parsed if content-type is application/json
    prompt = req.body?.prompt;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    // You can change the model below to any available Hugging Face hosted model
    const hfRes = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );
    const data = await hfRes.json();
    res.status(hfRes.status).json(data);
  } catch (err) {
    console.error('Hugging Face API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
