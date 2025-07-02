# Multi-Brain AI Architecture & Google Vision API Integration

This document explains the enhanced AI system that enables multiple AI providers and real image analysis capabilities.

## Overview

The system now supports multiple AI providers working together as specialized "brains" for different tasks:

- **Anthropic Claude**: Reasoning, summaries, detailed analysis
- **OpenAI GPT**: General chat, tools, accessibility
- **Google Gemini**: Search, photo analysis, vision tasks
- **DeepSeek**: Quotes, analytics, fallback operations

## Multi-Brain Architecture

### Role-Based Routing

Different chat roles are automatically routed to the most suitable AI provider:

```javascript
{
  reasoning: 'anthropic',      // Advanced reasoning - Claude excels at this
  tools: 'openai',             // Tool calling - GPT has good function calling
  quotes: 'deepseek',          // Service quotes - keep existing
  photo_uploads: 'google',     // Photo analysis - Gemini has vision capabilities
  summaries: 'anthropic',      // Summarization - Claude is great at this
  search: 'google',            // Search queries - Google's strength
  chat: 'openai',              // General chat - GPT is conversational
  fallback: 'deepseek',        // Always available fallback
  analytics: 'deepseek',       // Data analysis - keep existing
  accessibility: 'openai'      // Accessibility support - GPT is helpful
}
```

### Benefits

1. **Specialized Performance**: Each AI handles tasks it's optimized for
2. **Reliability**: Automatic fallback if primary API fails
3. **Flexibility**: Easy to change API assignments without code changes
4. **Cost Optimization**: Use different pricing tiers for different tasks

## Google Vision API Integration

### Real Image Analysis

The system now integrates with Google Vision API for real vehicle image analysis:

- **Automatic Detection**: Identifies cars, wheels, paint issues
- **Smart Recommendations**: AI-powered service suggestions
- **Confidence Scoring**: Provides confidence levels for recommendations
- **Graceful Fallback**: Uses simulated analysis if Vision API unavailable

### Features

- **Label Detection**: Identifies vehicle components and issues
- **Object Localization**: Locates specific parts (wheels, bumpers, etc.)
- **Color Analysis**: Assesses paint condition and type
- **Damage Assessment**: Detects scratches, swirls, contamination

### Example Analysis Output

```javascript
{
  issue: "Surface Contamination Detected",
  recommendation: "Your vehicle shows signs of surface contamination. Our paint decontamination and clay bar treatment (+$75) would restore smoothness and prepare for protection.",
  confidence: 0.85
}
```

## Configuration

### Enabling/Disabling APIs

Edit `src/constants/apiOptions.js`:

```javascript
{
  id: 'openai',
  name: 'OpenAI GPT',
  endpoint: '/api/openai',
  description: 'OpenAI GPT models',
  enabled: true  // Set to false to disable
}
```

### Changing Role Assignments

Update `DEFAULT_ROLE_ASSIGNMENTS` in the same file:

```javascript
export const DEFAULT_ROLE_ASSIGNMENTS = {
  photo_uploads: 'google',  // Change to different AI provider
  reasoning: 'anthropic',
  // ... other assignments
};
```

## Backend Setup

### Google Vision API

1. Enable Google Cloud Vision API
2. Create service account and download JSON key
3. Set environment variables:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   ```
4. Install dependencies:
   ```bash
   npm install @google-cloud/vision
   ```
5. Implement API endpoints (see `api-examples/google-vision-backend.js`)

### Other AI APIs

Each enabled API needs a corresponding backend endpoint:
- `/api/openai` - OpenAI GPT integration
- `/api/anthropic` - Anthropic Claude integration
- `/api/google` - Google Gemini integration
- `/api/deepseek` - DeepSeek integration

## Testing

Run the test suite to verify configuration:

```bash
# Test multi-API configuration
npm run test:run -- tests/multi-api-config.test.js

# Test Google Vision integration
npm run test:run -- tests/google-vision.test.js

# Test chat routing
npm run test:run -- tests/chat-router.test.js
```

## Development vs Production

### Development Mode
- APIs gracefully fallback to simulation when unavailable
- Console warnings for missing API endpoints
- Simulated image analysis for testing

### Production Mode
- Full API integration with error handling
- Real Google Vision API for image analysis
- Proper authentication and rate limiting

## Error Handling

The system includes comprehensive error handling:

1. **API Unavailable**: Falls back to alternative provider
2. **Rate Limiting**: Queues and retries requests
3. **Network Errors**: Graceful degradation to offline mode
4. **Invalid Responses**: Sanitizes and validates all AI outputs

## Analytics

The system tracks:
- API usage per role
- Response times and success rates
- Fallback frequency
- User interaction patterns

Access analytics through the chat settings panel or via `getRoutingStats()`.

---

## Migration from Single-Brain

If you prefer to revert to a single AI provider, simply set all roles to the same API:

```javascript
export const DEFAULT_ROLE_ASSIGNMENTS = {
  reasoning: 'deepseek',
  tools: 'deepseek',
  quotes: 'deepseek',
  // ... all using same provider
};
```

This maintains the architecture benefits while using only one AI service.