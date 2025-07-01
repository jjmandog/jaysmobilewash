// netlify/functions/ai.js

exports.handler = async function(event, context) {
  // CORS headers for API compatibility
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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
          error: "Method Not Allowed",
          method: event.httpMethod,
          stack: (new Error()).stack,
        }),
      };
    }

    // Block bots and crawlers
    const ua = event.headers["user-agent"] || "";
    if (
      /bot|crawl|spider|slurp|baidu|bing|yandex|duckduckgo|google|facebook|pinterest/i.test(ua)
    ) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Bots and crawlers are not permitted.",
          userAgent: ua,
          stack: (new Error()).stack,
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
          error: "Missing HF_API_KEY in environment.",
          stack: (new Error()).stack,
        }),
      };
    }

    // Parse body as JSON
    let payload;
    try {
      payload = JSON.parse(event.body || "");
    } catch (err) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Invalid JSON payload.",
          message: err.message,
          stack: err.stack,
          body: event.body,
        }),
      };
    }

    // Validate prompt
    if (!payload.prompt || typeof payload.prompt !== "string") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Missing or invalid 'prompt' field.",
          received: payload,
          stack: (new Error()).stack,
        }),
      };
    }

    // Call Hugging Face model
    let hfResponse;
    try {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/your-model-name",
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
        const errorText = await res.text();
        throw new Error(`Hugging Face API failed: ${res.status} ${errorText}`);
      }
      hfResponse = await res.json();
    } catch (err) {
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Downstream Hugging Face API error.",
          message: err.message,
          stack: err.stack,
        }),
      };
    }

    // Success response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        result: hfResponse,
        prompt: payload.prompt,
        meta: {
          timestamp: new Date().toISOString(),
          trace: (new Error()).stack,
        },
      }),
    };
  } catch (err) {
    // Last-resort catch-all
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Unhandled server error.",
        message: err.message,
        stack: err.stack,
        event,
      }),
    };
  }
};
