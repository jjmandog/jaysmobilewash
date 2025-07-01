/**
 * Netlify Serverless Function for Hugging Face AI Endpoint
 * Identical functionality to /api/ai.js but in Netlify function format
 * Accepts POST requests with JSON body containing prompt, blocks bots/crawlers,
 * and forwards requests to Hugging Face API using HF_API_KEY environment variable
 */

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Block bots/crawlers
  const block = ['bot', 'crawler', 'spider', 'curl', 'wget', 'python', 'scrapy'];
  const ua = (event.headers['user-agent'] || '').toLowerCase();
  if (block.some(a => ua.includes(a))) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Access denied' })
    };
  }

  // Check for HF_API_KEY environment variable
  const hfApiKey = process.env.HF_API_KEY;
  if (!hfApiKey) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'HF_API_KEY not set in environment' })
    };
  }

  // Parse request body and extract prompt
  let prompt = "";
  try {
    if (event.body) {
      const bodyData = JSON.parse(event.body);
      prompt = bodyData.prompt;
    }
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  if (!prompt) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'No prompt provided' })
    };
  }

  // Forward request to Hugging Face API
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
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('Hugging Face API error:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};