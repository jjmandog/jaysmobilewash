// netlify/functions/ai.js

exports.handler = async function(event, context) {
  // CORS headers for API compatibility
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST",
    "Content-Type": "application/json",
  };

  try {
    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: corsHeaders, body: "" };
    }

    // Only allow POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Method not allowed",
        }),
      };
    }

    // Block bots and crawlers
    const ua = event.headers["user-agent"] || "";
    if (
      /bot|crawl|spider|slurp|baidu|bing|yandex|duckduckgo|google|facebook|pinterest|curl|wget|python|scrapy/i.test(ua)
    ) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Access denied",
        }),
      };
    }

    // Check for Hugging Face API key
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "HF_API_KEY not set in environment",
        }),
      };
    }

    // Parse body as JSON
    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (err) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Invalid JSON body",
        }),
      };
    }

    // Validate prompt
    if (!payload.prompt || typeof payload.prompt !== "string" || payload.prompt.trim() === "") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "No prompt provided",
        }),
      };
    }

    // Call Hugging Face model
    let hfResponse;
    try {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/gpt2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: payload.prompt }),
        }
      );

      if (!res.ok) {
        let errorData;
        try {
          // Check if res.json() exists and use it, otherwise use res.text()
          if (res.json && typeof res.json === 'function') {
            errorData = await res.json();
          } else if (res.text && typeof res.text === 'function') {
            const errorText = await res.text();
            errorData = JSON.parse(errorText);
          } else {
            errorData = { error: `HTTP ${res.status}` };
          }
        } catch {
          errorData = { error: `HTTP ${res.status}` };
        }
        return {
          statusCode: res.status,
          headers: corsHeaders,
          body: JSON.stringify(errorData),
        };
      }
      hfResponse = await res.json();
    } catch (err) {
      console.error('Hugging Face API error:', err);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Internal server error",
        }),
      };
    }

    // Success response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(hfResponse),
    };
  } catch (err) {
    // Last-resort catch-all
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Unhandled server error.",
        message: err.message,
      }),
    };
  }
};
