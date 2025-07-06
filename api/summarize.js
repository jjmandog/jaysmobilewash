/**
 * Summarizer API via OpenRouter (or other LLM)
 * Handles POST requests to /api/summarize for summarizing long text responses
 *
 * Expected request body: { text: string, model?: string }
 * Returns: { summary: string, model: string }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// You can add more summarizer models here if needed
const DEFAULT_SUMMARIZER_MODEL = 'deepseek-ai/deepseek-llm-67b-chat';

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
    const text = body.text || '';
    const model = body.model || DEFAULT_SUMMARIZER_MODEL;

    if (!text) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Text is required' }));
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY environment variable is not set' }));
      return;
    }

    // Summarization prompt
    const summarizationPrompt = `Summarize the following in 2-3 sentences for a customer. Be clear, friendly, and concise.\n\n${text}`;

    const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jaysmobilewash.net',
        'X-Title': 'Jay\'s Mobile Wash'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: summarizationPrompt }],
        max_tokens: 256,
        temperature: 0.5,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.writeHead(response.status, corsHeaders);
      res.end(JSON.stringify({ error: `Summarizer API Error: ${response.status} - ${errorText}` }));
      return;
    }

    const data = await response.json();
    let summary = '';
    if (data.choices && data.choices.length > 0) {
      summary = data.choices[0].message?.content || 'No summary generated';
    } else if (data.generated_text) {
      summary = data.generated_text;
    } else {
      summary = 'I could not generate a summary.';
    }

    summary = summary.trim();

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ summary, model }));
  } catch (error) {
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
}
