export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Block bots/crawlers
  const block = ['bot','crawler','spider','curl','wget','python','scrapy'];
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (block.some(a => ua.includes(a))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const hfApiKey = process.env.HF_API_KEY;
  if (!hfApiKey) {
    return res.status(500).json({ error: 'HF_API_KEY not set in environment' });
  }

  let prompt = "";
  try {
    if (typeof req.body === "object") {
      prompt = req.body.prompt;
    } else {
      prompt = JSON.parse(req.body || "{}").prompt;
    }
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await fetch(
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
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Hugging Face API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
