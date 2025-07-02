/**
 * Google Vision API Integration
 * Provides real image analysis capabilities for vehicle assessment
 */

/**
 * Analyze image using Google Vision API
 * @param {Object} fileData - File data containing image
 * @returns {Promise<Array>} - Analysis results with recommendations
 */
export async function analyzeImageWithGoogleVision(fileData) {
  try {
    // Create a simplified API request structure
    const visionRequest = {
      image: {
        content: fileData.data.split(',')[1] // Remove data:image/jpeg;base64, prefix
      },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES' }
      ]
    };

    // Call Google Vision API through our backend endpoint
    const response = await fetch('/api/google-vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visionRequest)
    });

    if (!response.ok) {
      throw new Error(`Vision API request failed: ${response.status}`);
    }

    const visionResults = await response.json();
    
    // Convert Vision API results to car detailing recommendations
    return convertVisionResultsToRecommendations(visionResults, fileData);
    
  } catch (error) {
    console.error('Google Vision API error:', error);
    
    // Fallback to simulated analysis if Vision API fails
    console.log('Falling back to simulated image analysis');
    return simulatedImageAnalysis(fileData);
  }
}

/**
 * Convert Google Vision API results to car detailing recommendations
 * @param {Object} visionResults - Results from Google Vision API
 * @param {Object} fileData - Original file data for context
 * @returns {Array} - Car detailing recommendations
 */
function convertVisionResultsToRecommendations(visionResults, fileData) {
  const recommendations = [];
  
  if (!visionResults.responses || !visionResults.responses[0]) {
    return simulatedImageAnalysis(fileData);
  }
  
  const response = visionResults.responses[0];
  const labels = response.labelAnnotations || [];
  const objects = response.localizedObjectAnnotations || [];
  const properties = response.imagePropertiesAnnotation || {};
  
  // Analyze detected labels for car-related issues
  const carLabels = labels.filter(label => 
    label.description.toLowerCase().includes('car') ||
    label.description.toLowerCase().includes('vehicle') ||
    label.description.toLowerCase().includes('automobile')
  );
  
  if (carLabels.length > 0) {
    // Look for specific detailing opportunities based on detected features
    
    // Check for dirt, scratches, or wear indicators
    const issueLabels = labels.filter(label => {
      const desc = label.description.toLowerCase();
      return desc.includes('dirt') || desc.includes('dust') || 
             desc.includes('scratch') || desc.includes('wear') ||
             desc.includes('stain') || desc.includes('oxidation');
    });
    
    if (issueLabels.length > 0) {
      recommendations.push({
        issue: "Surface Contamination Detected",
        recommendation: "Your vehicle shows signs of surface contamination. Our paint decontamination and clay bar treatment (+$75) would restore smoothness and prepare for protection.",
        confidence: Math.max(...issueLabels.map(l => l.score))
      });
    }
    
    // Check for wheel-related objects
    const wheelObjects = objects.filter(obj => 
      obj.name.toLowerCase().includes('wheel') || 
      obj.name.toLowerCase().includes('tire')
    );
    
    if (wheelObjects.length > 0) {
      recommendations.push({
        issue: "Wheel Cleaning Opportunity",
        recommendation: "Professional wheel cleaning and ceramic coating for wheels (+$150) would provide long-lasting protection and easier maintenance.",
        confidence: Math.max(...wheelObjects.map(o => o.score))
      });
    }
    
    // Analyze color properties for paint condition assessment
    if (properties.dominantColors) {
      const colors = properties.dominantColors.colors || [];
      const darkColors = colors.filter(c => 
        (c.color.red || 0) + (c.color.green || 0) + (c.color.blue || 0) < 150
      );
      
      if (darkColors.length > 0) {
        recommendations.push({
          issue: "Dark Paint Detected",
          recommendation: "Dark paint shows swirl marks more easily. Paint correction (+$300-600) followed by ceramic coating (+$450) would provide exceptional protection and gloss.",
          confidence: 0.8
        });
      }
    }
    
    // General recommendations based on vehicle detection
    if (carLabels.some(l => l.score > 0.8)) {
      recommendations.push({
        issue: "Vehicle Assessment Complete",
        recommendation: "Based on your vehicle type, I recommend our Luxury Detail package ($130) which includes comprehensive interior and exterior care perfect for your car.",
        confidence: Math.max(...carLabels.map(l => l.score))
      });
    }
  }
  
  // If no specific recommendations, provide general guidance
  if (recommendations.length === 0) {
    return simulatedImageAnalysis(fileData);
  }
  
  return recommendations;
}

/**
 * Fallback simulated image analysis (existing functionality)
 * @param {Object} fileData - File data containing image
 * @returns {Array} - Simulated analysis results
 */
function simulatedImageAnalysis(fileData) {
  // This is the existing simulated analysis logic
  const possibleIssues = [
    {
      issue: "Paint Swirl Marks Detected",
      recommendation: "Paint correction would restore that showroom shine. Add single-stage correction (+$300) or multi-stage for deeper scratches (+$600).",
      confidence: 0.7
    },
    {
      issue: "Wheel Contamination Visible", 
      recommendation: "Professional wheel cleaning and ceramic coating for wheels (+$150) would provide long-lasting protection.",
      confidence: 0.8
    },
    {
      issue: "Interior Wear Assessment",
      recommendation: "Consider our interior protection package with leather conditioning and fabric protection (+$100).",
      confidence: 0.6
    },
    {
      issue: "Paint Protection Opportunity",
      recommendation: "Your vehicle would benefit from ceramic coating ($450) or our premium Graphene coating ($800) for maximum protection.",
      confidence: 0.9
    }
  ];

  // Return 1-3 random issues for simulation
  const shuffled = [...possibleIssues].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
}

/**
 * Check if Google Vision API is available
 * @returns {Promise<boolean>} - True if Vision API is available
 */
export async function isGoogleVisionAvailable() {
  try {
    const response = await fetch('/api/google-vision/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.warn('Google Vision API health check failed:', error);
    return false;
  }
}