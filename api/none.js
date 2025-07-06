/**
 * None API Handler
 * Handles requests when AI is disabled/none selected
 * Returns a polite message indicating AI is disabled
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
    // Always return a polite "AI disabled" message
    const responseText = "AI assistance is currently disabled. Please select an AI model from the dropdown to enable intelligent responses, or contact Jay's Mobile Wash directly at (562) 228-9429 for immediate assistance.";
    
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ 
      responseText,
      selectedModel: 'none',
      disabled: true
    }));

  } catch (error) {
    console.error('❌ None API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
