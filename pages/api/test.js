/**
 * Simple test API endpoint
 */
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      message: 'API is working!', 
      timestamp: new Date().toISOString(),
      ai_service: 'DeepSeek via Hugging Face',
      status: 'ready'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
