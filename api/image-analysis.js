/**
 * Hugging Face YOLOv8 Metal Defect Detection API
 * Handles POST requests to /api/image-analysis for car image analysis
 * 
 * Expected request body: { image: base64_string, prompt?: string }
 * Returns: { response: string, role: "assistant" }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Validate request body
 */
function validateRequestBody(body) {
  if (!body) {
    const err = new Error('Request body is required');
    err.status = 400;
    throw err;
  }

  if (!body.image || typeof body.image !== 'string') {
    const err = new Error('image is required and must be a base64 string');
    err.status = 400;
    throw err;
  }

  const prompt = body.prompt || 'Describe this car image for detailing analysis';
  
  return {
    image: body.image,
    prompt: prompt.trim()
  };
}

/**
 * Convert base64 to blob for Hugging Face API
 */
function base64ToBlob(base64String) {
  // Remove data:image/jpeg;base64, prefix if present
  const cleanBase64 = base64String.replace(/^data:image\/[^;]+;base64,/, '');
  
  // Convert base64 to binary
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}

/**
 * Call Hugging Face YOLOv8 Metal Defect Detection Space for image analysis
 */
async function analyzeImageWithYoloV8(imageBase64, prompt) {
  try {
    // Call your custom Hugging Face Space endpoint
    const response = await fetch('https://jjmandog-yolov8-metal-defect-detection.hf.space/run/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [imageBase64] })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YOLOv8 Space API Error:', response.status, errorText);
      if (response.status === 401) {
        const err = new Error('Invalid Hugging Face Space API key');
        err.status = 401;
        throw err;
      } else if (response.status === 429) {
        const err = new Error('Rate limit exceeded. Please try again later.');
        err.status = 429;
        throw err;
      } else if (response.status === 503) {
        const err = new Error('Model is loading. Please try again in a few seconds.');
        err.status = 503;
        throw err;
      } else {
        const err = new Error(`YOLOv8 Space API error: ${response.status} ${errorText}`);
        err.status = response.status;
        throw err;
      }
    }

    const data = await response.json();

    // Try to extract and summarize defect results
    let resultText = '';
    if (data && data.data && data.data.length > 0) {
      // If the result is a string, show it directly
      if (typeof data.data[0] === 'string') {
        resultText = data.data[0];
      } else if (Array.isArray(data.data[0])) {
        // If the result is an array of detections, summarize
        const detections = data.data[0];
        if (detections.length === 0) {
          resultText = 'No defects detected. If you have a specific concern, please upload another image showing the area you want analyzed.';
        } else {
          // Summarize by defect type and count
          const summary = {};
          detections.forEach(det => {
            const label = det.label || det.class || 'defect';
            summary[label] = (summary[label] || 0) + 1;
          });
          resultText = Object.entries(summary)
            .map(([label, count]) => `• ${label}: ${count}`)
            .join('\n');
        }
      } else if (typeof data.data[0] === 'object') {
        resultText = JSON.stringify(data.data[0], null, 2);
      } else {
        resultText = String(data.data[0]);
      }
    } else {
      resultText = "I couldn't analyze this image. Please try uploading a clearer photo or another angle.";
    }

    return `**Defect Detection Result:**\n${resultText}`;
  } catch (error) {
    console.error('YOLOv8 Space call failed:', error);
    throw error;
  }
}

/**
 * Main serverless function handler
 */
async function handler(req, res) {
  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for actual API functionality
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    // Parse and validate request body
    const { image, prompt } = validateRequestBody(req.body);

    // Analyze image with YOLOv8 Metal Defect Detection Space
    const analysisResult = await analyzeImageWithYoloV8(image, prompt);

    // Return successful response
    return res.status(200).json({
      response: analysisResult,
      role: 'assistant'
    });

  } catch (error) {
    console.error('API Error:', error);

    // Use status from error if available, otherwise 500
    const status = error.status || 500;
    let errorType = 'Internal Server Error';
    if (status === 400) errorType = 'Bad Request';
    if (status === 401) errorType = 'Unauthorized';
    if (status === 429) errorType = 'Rate Limit Exceeded';
    if (status === 503) errorType = 'Service Unavailable';
    if (status === 500) errorType = 'Configuration Error';

    return res.status(status).json({
      error: errorType,
      message: error.message || 'An unknown error occurred.'
    });
  }
}

export default handler;
