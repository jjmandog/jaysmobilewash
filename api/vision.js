/**
 * Google Vision API for Image Analysis
 * Handles POST requests to /api/vision for image analysis functionality
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

  const prompt = body.prompt || 'Analyze this car image and provide detailing recommendations';
  
  return {
    image: body.image,
    prompt: prompt.trim()
  };
}

/**
 * Call Google Vision API
 */
async function analyzeImage(imageBase64, prompt) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  
  if (!apiKey) {
    const err = new Error('GOOGLE_VISION_API_KEY environment variable is not set');
    err.status = 500;
    throw err;
  }

  try {
    // Remove data:image/jpeg;base64, prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: cleanBase64
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 5 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Vision API Error:', response.status, errorText);
      
      if (response.status === 401) {
        const err = new Error('Invalid Google Vision API key');
        err.status = 401;
        throw err;
      } else if (response.status === 429) {
        const err = new Error('Rate limit exceeded. Please try again later.');
        err.status = 429;
        throw err;
      } else {
        const err = new Error(`Google Vision API error: ${response.status} ${errorText}`);
        err.status = response.status;
        throw err;
      }
    }

    const data = await response.json();
    
    if (!data.responses || !data.responses[0]) {
      return "I couldn't analyze this image. Please try uploading a clearer photo.";
    }

    const result = data.responses[0];
    
    // Extract labels (what's in the image)
    const labels = result.labelAnnotations?.map(label => label.description) || [];
    
    // Extract text (if any)
    const texts = result.textAnnotations?.map(text => text.description) || [];
    
    // Extract objects
    const objects = result.localizedObjectAnnotations?.map(obj => obj.name) || [];

    // Create a car detailing analysis
    let analysis = "Based on the image analysis:\n\n";
    
    if (labels.length > 0) {
      analysis += `**What I see:** ${labels.slice(0, 5).join(', ')}\n\n`;
    }
    
    if (objects.length > 0) {
      analysis += `**Objects detected:** ${objects.slice(0, 5).join(', ')}\n\n`;
    }
    
    if (texts.length > 0 && texts[0].length < 100) {
      analysis += `**Text found:** ${texts[0]}\n\n`;
    }

    // Car-specific recommendations
    const carKeywords = ['car', 'vehicle', 'automobile', 'sedan', 'suv', 'truck', 'wheel', 'tire', 'bumper', 'windshield'];
    const hasCarContent = labels.concat(objects).some(item => 
      carKeywords.some(keyword => item.toLowerCase().includes(keyword))
    );

    if (hasCarContent) {
      analysis += `**Detailing Recommendations:**
• For exterior: Consider our premium wash with clay bar treatment
• For wheels: Deep wheel cleaning and tire shine service  
• For interior: Vacuum, wipe down, and conditioning treatment
• For protection: Ceramic coating for long-term paint protection

**Estimated Services:**
• Mini Detail ($70) - Basic cleaning
• Luxury Detail ($130) - Comprehensive care
• Max Detail ($200) - Full premium service

Would you like a personalized quote based on your specific needs?`;
    } else {
      analysis += "This doesn't appear to be a vehicle image. Please upload a photo of your car for accurate detailing recommendations.";
    }

    return analysis;

  } catch (error) {
    console.error('Google Vision call failed:', error);
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

    // Analyze image with Google Vision
    const analysisResult = await analyzeImage(image, prompt);

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
    if (status === 500) errorType = 'Configuration Error';

    return res.status(status).json({
      error: errorType,
      message: error.message || 'An unknown error occurred.'
    });
  }
}

export default handler;
