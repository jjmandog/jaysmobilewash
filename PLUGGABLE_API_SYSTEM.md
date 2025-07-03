# Plug-and-Play API System Documentation

## Overview

The Plug-and-Play API System enables developers to add new APIs to the chatbot by simply dropping files into the `/api` directory. The system automatically discovers, registers, and routes requests to the appropriate APIs based on their declared categories and capabilities.

## Key Features

### ✅ Zero-Configuration Setup
- Drop API files into `/api` directory
- No manual configuration required
- Automatic discovery and registration

### ✅ Intelligent Routing
- Category-based routing
- Keyword matching
- Dynamic API selection
- Fallback to existing system

### ✅ API Dashboard
- Visual management interface
- Real-time API testing
- Routing visualization
- Performance monitoring

### ✅ Self-Organizing
- APIs declare their own metadata
- Automatic categorization
- Dynamic capability matching

## Quick Start

### 1. Create a New API

Copy the template and customize:

```bash
cp api-templates/pluggable-api.js api/my-new-api.js
```

### 2. Define Your API Metadata

```javascript
export const metadata = {
  name: 'My New API',
  description: 'What this API does',
  categories: ['chat', 'tools'], // Choose relevant categories
  keywords: ['keyword1', 'keyword2'], // For routing
  enabled: true,
  // ... other metadata
};
```

### 3. Implement Your Logic

```javascript
async function processRequest(message, options) {
  // Your API logic here
  return {
    message: 'Your response',
    // ... additional data
  };
}
```

### 4. Test Your API

Your API is automatically available at `/api/my-new-api` and will be discovered by the system.

## API Structure

### Required Metadata

```javascript
export const metadata = {
  name: 'string',           // Human-readable name
  description: 'string',    // What the API does
  categories: ['array'],    // Categories for routing
  keywords: ['array'],      // Keywords for matching
  enabled: boolean,         // Whether API is active
  endpoint: 'string',       // API endpoint path
  methods: ['array'],       // Supported HTTP methods
  // ... optional fields
};
```

### Categories

Available categories for routing:

- `chat` - General conversation
- `quotes` - Price quotes and estimates
- `search` - Information lookup
- `reasoning` - Analysis and logic
- `tools` - Actions and utilities
- `summaries` - Text summarization
- `analytics` - Data analysis
- `accessibility` - Accessibility features
- `services` - Service management
- `data` - Data operations

### Optional Features

#### Custom Routing Logic

```javascript
export const metadata = {
  // ... other metadata
  shouldHandle: (input, context) => {
    // Return true if this API should handle the input
    return input.toLowerCase().includes('specific-keyword');
  }
};
```

#### Input/Output Specifications

```javascript
export const metadata = {
  // ... other metadata
  input: {
    type: 'object',
    properties: {
      message: { type: 'string', required: true },
      options: { type: 'object', required: false }
    }
  },
  output: {
    type: 'object',
    properties: {
      response: { type: 'string' },
      metadata: { type: 'object' }
    }
  }
};
```

#### Usage Examples

```javascript
export const metadata = {
  // ... other metadata
  examples: [
    {
      name: 'Basic usage',
      input: { message: 'Hello' },
      description: 'Simple greeting'
    }
  ]
};
```

## API Handler Implementation

### Basic Handler

```javascript
async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
```

### Processing Logic

```javascript
async function handlePost(req, res) {
  const { message, options = {} } = req.body;
  
  // Validate input
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Process the request
  const result = await processRequest(message, options);
  
  // Return response
  return res.status(200).json({
    response: result,
    metadata: {
      api: metadata.name,
      timestamp: new Date().toISOString()
    }
  });
}
```

## Using the System

### In Components

```javascript
import { routeRequest } from '../utils/dynamicChatRouter.js';

// Route a request dynamically
const response = await routeRequest('Get me a quote for car detailing');

// The system will automatically find the best API to handle this request
```

### API Dashboard

Access the dashboard to:
- View all registered APIs
- Test API routing
- Monitor performance
- Manage API settings

```javascript
import APIDashboard from '../components/APIDashboard.jsx';

// Use in your React app
<APIDashboard />
```

### Enhanced Chat Box

Use the new dynamic chat box:

```javascript
import DynamicAIChatBox from '../components/DynamicAIChatBox.jsx';

<DynamicAIChatBox 
  showRoutingInfo={true}
  onQuery={(prompt, response, routing) => {
    console.log('Routed to:', routing.routedTo);
  }}
/>
```

## System Architecture

### API Registry (`src/utils/apiRegistry.js`)
- Scans `/api` directory for API files
- Registers APIs with metadata
- Provides lookup and matching functions

### Dynamic Router (`src/utils/dynamicChatRouter.js`)
- Routes requests to appropriate APIs
- Handles fallbacks and errors
- Integrates with existing chat router

### API Dashboard (`src/components/APIDashboard.jsx`)
- Visual interface for API management
- Real-time testing and monitoring
- Configuration management

## Migration Guide

### Existing APIs

To make existing APIs discoverable, add metadata:

```javascript
// Add to existing API file
export const metadata = {
  name: 'Existing API',
  description: 'Description of existing functionality',
  categories: ['appropriate', 'categories'],
  keywords: ['relevant', 'keywords'],
  enabled: true,
  endpoint: '/api/existing-endpoint',
  methods: ['GET', 'POST']
};
```

### Gradual Migration

1. **Phase 1**: Add metadata to existing APIs
2. **Phase 2**: Test routing with dashboard
3. **Phase 3**: Switch to dynamic routing
4. **Phase 4**: Add new APIs using new pattern

## Examples

### Service Quote API

```javascript
export const metadata = {
  name: 'Service Quotes API',
  description: 'Generate detailed quotes for mobile car wash services',
  categories: ['quotes', 'pricing', 'services'],
  keywords: ['quote', 'price', 'cost', 'estimate'],
  enabled: true,
  shouldHandle: (input) => {
    return input.toLowerCase().includes('quote') || 
           input.toLowerCase().includes('price');
  }
};
```

### FAQ API

```javascript
export const metadata = {
  name: 'FAQ API',
  description: 'Frequently asked questions about our services',
  categories: ['chat', 'search', 'faq'],
  keywords: ['faq', 'question', 'help', 'info'],
  enabled: true,
  shouldHandle: (input) => {
    const questions = ['what', 'how', 'when', 'where', 'why'];
    return questions.some(q => input.toLowerCase().includes(q));
  }
};
```

## Best Practices

### 1. Clear Metadata
- Use descriptive names and descriptions
- Choose appropriate categories
- Include relevant keywords

### 2. Robust Error Handling
- Validate all inputs
- Handle edge cases gracefully
- Provide meaningful error messages

### 3. Performance Considerations
- Keep APIs lightweight
- Use caching where appropriate
- Monitor response times

### 4. Testing
- Test with various inputs
- Use the dashboard for validation
- Monitor routing behavior

## Troubleshooting

### API Not Being Discovered
- Check file is in `/api` directory
- Ensure metadata is properly exported
- Verify no syntax errors in file

### Routing Issues
- Check category assignments
- Verify keywords are relevant
- Test with dashboard routing tool

### Performance Problems
- Monitor API response times
- Check for blocking operations
- Use appropriate caching strategies

## Advanced Features

### Custom Routing Logic
Implement sophisticated routing decisions:

```javascript
shouldHandle: (input, context) => {
  // Context includes user info, previous messages, etc.
  const userIntent = analyzeIntent(input);
  return userIntent.confidence > 0.8 && 
         userIntent.category === 'my-specialty';
}
```

### Multi-API Responses
Handle requests that need multiple APIs:

```javascript
// The router can call multiple APIs and combine results
const results = await Promise.all([
  callAPI1(input),
  callAPI2(input)
]);
```

### Hot Reloading
For development, APIs can be reloaded without restart:

```javascript
import { reloadAPIs } from '../utils/dynamicChatRouter.js';
await reloadAPIs();
```

## Future Enhancements

- AI-powered routing classification
- A/B testing capabilities
- Load balancing across API instances
- Automatic performance optimization
- Integration with external API services

---

*This system provides a foundation for scalable, maintainable API management while preserving the existing functionality and enabling rapid development of new capabilities.*