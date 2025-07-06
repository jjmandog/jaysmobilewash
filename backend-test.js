/**
 * Backend Handler Test Script
 * Tests key endpoints to ensure they're working correctly
 */

const testEndpoints = [
  {
    name: 'OpenRouter (Llama 3.3)',
    url: 'https://jaysmobilewash.net/api/openrouter',
    payload: {
      prompt: 'Hello, this is a test message',
      model: 'openrouter_llama33'
    }
  },
  {
    name: 'HuggingFace (Zephyr)',
    url: 'https://jaysmobilewash.net/api/huggingface',
    payload: {
      prompt: 'Hello, this is a test message',
      model: 'zephyr_hf'
    }
  },
  {
    name: 'None (Disabled)',
    url: 'https://jaysmobilewash.net/api/none',
    payload: {
      prompt: 'Hello, this is a test message',
      model: 'none'
    }
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n🧪 Testing: ${endpoint.name}`);
  console.log(`📡 URL: ${endpoint.url}`);
  console.log(`📝 Payload:`, JSON.stringify(endpoint.payload, null, 2));
  
  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(endpoint.payload)
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log(`📥 Response:`, JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Test PASSED');
    } else {
      console.log('❌ Test FAILED');
    }
    
  } catch (error) {
    console.log('❌ Test ERROR:', error.message);
  }
}

async function runTests() {
  console.log('=== BACKEND HANDLER TESTS ===');
  console.log('Testing live endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n=== TEST SUMMARY ===');
  console.log('All key backend handlers have been tested.');
  console.log('Check above for individual test results.');
}

// Note: This script is for documentation purposes
// In a real environment, you would run: node backend-test.js
console.log('Backend test script created. To run tests, execute this script in a Node.js environment with fetch support.');
