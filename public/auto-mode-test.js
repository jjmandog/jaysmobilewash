/**
 * Auto Mode Test Script
 * Test the enhanced auto mode functionality
 */

const AUTO_MODE_TESTS = [
  {
    name: "Enterprise Analysis",
    prompt: "Can you provide a comprehensive business strategy analysis for optimizing our car wash services?",
    expectedModel: "qwen3_235b",
    category: "Enterprise"
  },
  {
    name: "Technical Reasoning",
    prompt: "Analyze the step-by-step process of how ceramic coating protects car paint and why it's more effective than traditional wax.",
    expectedModel: "qwq_32b",
    category: "Analytical"
  },
  {
    name: "Development Question",
    prompt: "How can I code a JavaScript function to calculate car wash pricing based on vehicle size and service type?",
    expectedModel: "kimi_dev_72b",
    category: "Development"
  },
  {
    name: "Creative Content",
    prompt: "Write a creative marketing blog post about the benefits of mobile car washing services.",
    expectedModel: "qwerky_72b",
    category: "Creative"
  },
  {
    name: "Quick Question",
    prompt: "What time do you open?",
    expectedModel: "reka_flash_3",
    category: "Quick"
  },
  {
    name: "Service Query",
    prompt: "How much does a premium car wash cost and what's included in the service?",
    expectedModel: "moonlight_16b",
    category: "Business"
  },
  {
    name: "Visual Analysis",
    prompt: "Can you analyze this image of my car to determine what services it needs?",
    expectedModel: "kimi_vl_a3b",
    category: "Visual",
    hasFiles: true
  }
];

async function testAutoMode() {
  console.log('🧪 Testing Enhanced Auto Mode...\n');
  
  for (const test of AUTO_MODE_TESTS) {
    console.log(`Testing: ${test.name}`);
    console.log(`Prompt: "${test.prompt}"`);
    console.log(`Expected Model: ${test.expectedModel}`);
    console.log(`Category: ${test.category}`);
    
    try {
      const requestBody = {
        prompt: test.prompt,
        role: 'auto'
      };
      
      if (test.hasFiles) {
        requestBody.messages = [{
          type: 'image',
          attachments: [{ type: 'image/jpeg', name: 'car-photo.jpg' }]
        }];
      }
      
      const response = await fetch('/api/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      console.log(`✅ Selected Model: ${data.autoMode?.selectedModel || 'Unknown'}`);
      console.log(`📝 Reason: ${data.autoMode?.reason || 'No reason provided'}`);
      console.log(`🎯 Confidence: ${data.autoMode?.confidence || 'N/A'}`);
      console.log(`✨ Match: ${data.autoMode?.selectedModel === test.expectedModel ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

// Run tests when page loads
if (typeof window !== 'undefined') {
  window.testAutoMode = testAutoMode;
  console.log('Auto Mode Test loaded. Run testAutoMode() to execute tests.');
}
