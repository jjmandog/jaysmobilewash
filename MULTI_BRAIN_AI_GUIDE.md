# Multi-Brain AI Architecture & Community Key Vault

This document explains the enhanced AI system that enables multiple AI providers working together with community-shared API keys and intelligent provider selection.

## Overview

The system now supports multiple AI providers working together as specialized "brains" for different tasks, enhanced with community key sharing and smart selection:

- **Anthropic Claude**: Reasoning, summaries, detailed analysis
- **OpenAI GPT**: General chat, tools, accessibility
- **Google Gemini**: Search, photo analysis, vision tasks
- **Cohere**: Enterprise-grade language models
- **Replicate**: Open-source AI models
- **Perplexity**: Search-augmented AI responses
- **Mistral AI**: Efficient reasoning models
- **Together AI**: Collective intelligence platform
- **DeepSeek**: Mathematical and analytical tasks

## Community API Key Vault 🏛️

### Shared Key Pool

The system now includes a community-driven API key vault where users can contribute API keys for shared use:

#### Key Features
- **Community Contributions**: Users can add API keys to benefit all users
- **Secure Storage**: Keys are validated and stored securely
- **Provider Status**: Real-time visibility of which providers are available
- **Smart Validation**: Keys are tested before being added to the pool

#### Contributing Keys

```javascript
// Add a community API key
const result = await fetch('/api/community-keys', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    apiKey: 'sk-your-api-key',
    contributor: 'your-name'
  })
});
```

#### Provider Requirements

**Required Providers** (needed for Smart Select):
- OpenAI GPT ⭐ Required
- Anthropic Claude ⭐ Required  
- Google Gemini ⭐ Required

**Optional Providers** (enhance capabilities):
- Cohere, Replicate, Perplexity, Mistral, Together AI, DeepSeek

## Smart Selection ⚡

### Intelligent Provider Routing

When all required API keys are available, **Smart Select** mode automatically chooses the optimal provider for each request based on:

#### Performance Metrics
- **Response Time**: Average processing speed
- **Success Rate**: Reliability and error frequency
- **Availability**: Current operational status
- **Role Suitability**: Provider strengths for specific tasks

#### Adaptive Algorithm

```javascript
// Smart selection considers multiple factors
const bestProvider = selectBestProvider(availableProviders, role);

// Factors evaluated:
// 1. Performance score (0-1)
// 2. Success rate percentage
// 3. Average response time
// 4. Recent reliability
// 5. Provider-specific role optimization
```

### Usage Example

```javascript
// Enable smart selection in routing
const response = await routeLLMRequest(
  'Analyze this business data',
  'analytics',
  assignments,
  { smartSelect: true }  // Automatically choose best provider
);
```

## Enhanced Multi-Brain Architecture

### Role-Based Routing with Community Keys

The system intelligently assigns roles based on both assignments and key availability:

```javascript
// Default assignments (can be overridden by Smart Select)
{
  reasoning: 'anthropic',      // Advanced reasoning - Claude excels
  tools: 'openai',             // Tool calling - GPT has good functions  
  quotes: 'openai',            // Service quotes - reliable and fast
  photo_uploads: 'google',     // Photo analysis - Gemini vision
  summaries: 'anthropic',      // Summarization - Claude's strength
  search: 'google',            // Search queries - Google's domain
  chat: 'openai',              // General chat - GPT conversational
  fallback: 'openai',          // Always available fallback
  analytics: 'openai',         // Data analysis - consistent results
  accessibility: 'openai'      // Accessibility support - helpful
}
```

### Provider Status Indicators

The UI now shows real-time provider availability:

- ✅ **Available**: Valid community key present
- ❌ **Missing**: No community key available
- ⚠️ **Invalid**: Key present but not working
- ⭐ **Required**: Needed for Smart Select mode

## Enhanced Google Vision Integration

### Real Image Analysis with Community Keys

The Google Vision integration now benefits from community-shared API keys:

- **Automatic Detection**: Identifies cars, wheels, paint issues
- **Smart Recommendations**: AI-powered service suggestions  
- **Confidence Scoring**: Provides confidence levels
- **Community Access**: Works when community Google key available

### Advanced Features

```javascript
// Enhanced image analysis with community keys
{
  issue: "Paint Oxidation Detected",
  recommendation: "Your vehicle shows oxidation on the clear coat. Our paint correction service ($200-400) would restore clarity and depth.",
  confidence: 0.92,
  provider: "google",
  communityKey: true
}
```

## Configuration & Management

### Provider Management

The enhanced settings panel shows:

1. **Community Pool Status**: Which providers have valid keys
2. **Smart Select Toggle**: Enable/disable intelligent routing
3. **Role Assignments**: Manual assignments with availability indicators
4. **Missing Keys Alert**: Clear visibility of what's needed

### Adding Missing Keys

When a provider is missing keys, users can:

1. Click on the disabled provider card
2. Open the secure key input modal
3. Enter their API key with validation
4. Contribute to the community pool

### Security Features

- **Key Redaction**: Only first 8 and last 4 characters shown in logs
- **Pattern Validation**: Keys validated against provider formats
- **Usage Transparency**: All API usage tracked and reported
- **Contributor Attribution**: Optional credit for key contributors

## Analytics & Performance

### Enhanced Tracking

The system now tracks comprehensive metrics:

```javascript
// Performance analytics
{
  providers: {
    openai: {
      totalRequests: 1250,
      successRate: 0.98,
      averageResponseTime: 1450,
      performanceScore: 0.92,
      communityKey: true
    }
  },
  smartSelection: {
    enabled: true,
    totalSelections: 450,
    averageScore: 0.89
  },
  community: {
    totalKeys: 7,
    validKeys: 6,
    completionRate: 85.7
  }
}
```

### GA4 Events

Enhanced analytics events:

```javascript
// Community key events
gtag('event', 'community_key_added', {
  provider: 'anthropic',
  success: true
});

// Smart selection events  
gtag('event', 'smart_select_enabled', {
  available_providers: 6
});

// Performance tracking
gtag('event', 'ai_request_completed', {
  provider: 'openai',
  role: 'reasoning', 
  smart_selected: true,
  response_time: 1200,
  fallback_used: false
});
```

## Backend Setup

### Community Keys API

New API endpoint for key management:

```javascript
// GET /api/community-keys - Get provider status
// POST /api/community-keys - Add new key
// DELETE /api/community-keys - Remove key (admin)
```

### Environment Setup

For development, you can still use individual API keys:

```bash
# Individual API keys (fallback if no community keys)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key

# Google Vision (optional)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

## Testing Enhanced Features

Run the comprehensive test suite:

```bash
# Test community key vault
npm run test:run -- tests/community-key-vault.test.js

# Test AI analytics and smart selection
npm run test:run -- tests/ai-analytics.test.js

# Test enhanced chat router
npm run test:run -- tests/enhanced-chat-router.test.js

# Test all multi-API features
npm run test:run
```

## Migration Guide

### From Previous Version

The system is fully backward compatible:

1. **Existing assignments continue to work**
2. **No code changes required**
3. **Gradual adoption of community features**
4. **Optional Smart Select mode**

### Enabling New Features

1. **Add community keys** through the UI
2. **Enable Smart Select** when ready
3. **Monitor performance** through analytics
4. **Adjust as needed** based on usage patterns

## Best Practices

### For Contributors

- **Test keys before contributing** to ensure they work
- **Use appropriate key permissions** (read-only when possible)
- **Monitor usage** through the analytics dashboard
- **Report issues** if keys become invalid

### For Administrators

- **Monitor key pool status** regularly
- **Track performance metrics** for optimization
- **Set up alerts** for key failures
- **Maintain backup assignments** for critical roles

---

## Future Enhancements

### Implemented ✅
- Community API key vault with secure validation
- Smart provider selection based on performance
- Real-time provider status monitoring
- Enhanced analytics and tracking
- Backward-compatible architecture

### Planned 🚀
- **Usage analytics dashboard** with detailed insights
- **API cost tracking** across providers
- **Advanced fallback strategies** with load balancing
- **Custom provider configurations** for specialized use cases
- **Integration with more AI providers** as they become available

This enhanced architecture provides a robust, community-driven foundation for AI provider management while maintaining the specialized benefits of multi-brain intelligence.

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