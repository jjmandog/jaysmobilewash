# Chat Widget AI Adapter Documentation

## Overview

The Jay's Mobile Wash chat widget uses a flexible adapter pattern to support multiple AI backends. This allows for failover strategies, parallel processing, and easy integration of new AI services.

## Adapter Pattern Architecture

### Core Components

1. **ChatWidget Class**: Main widget controller
2. **Adapter Interface**: Standard interface all adapters must implement
3. **Built-in Adapters**: Pre-built adapters for common AI services
4. **Strategy System**: Configurable failover or parallel processing

### Adapter Interface

Every AI adapter must implement:

```javascript
class CustomAdapter {
    constructor(options = {}) {
        this.name = 'CustomAdapter'; // Required: unique identifier
        // Initialize with options
    }

    async sendMessage(messages, options = {}) {
        // Required: async function that returns a string response
        // messages: array of {role: 'system'|'user'|'assistant', content: string}
        // options: {maxTokens: number, temperature: number, ...}
        
        // Implementation here...
        
        return 'AI response as string';
    }
}
```

## Built-in Adapters

### 1. HuggingFaceAdapter

Uses the existing `/api/ai` endpoint that connects to HuggingFace.

```javascript
const hfAdapter = new window.ChatAdapters.HuggingFaceAdapter({
    endpoint: '/api/ai',      // API endpoint
    model: 'gpt2'             // HuggingFace model (optional)
});
```

### 2. NetlifyAdapter

Uses Netlify Functions for AI processing.

```javascript
const netlifyAdapter = new window.ChatAdapters.NetlifyAdapter({
    endpoint: '/netlify/functions/ai'
});
```

### 3. DeepSeekAdapter

Connects directly to DeepSeek's API.

```javascript
const deepSeekAdapter = new window.ChatAdapters.DeepSeekAdapter({
    apiKey: 'your-deepseek-api-key',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
});
```

### 4. OpenAICompatibleAdapter

Generic adapter for OpenAI-compatible APIs.

```javascript
const openAIAdapter = new window.ChatAdapters.OpenAICompatibleAdapter({
    name: 'CustomOpenAI',
    apiKey: 'your-api-key',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
});
```

## Adding New Adapters

### Step 1: Create the Adapter Class

```javascript
class MyCustomAdapter {
    constructor(options = {}) {
        this.name = 'MyCustomService';
        this.apiKey = options.apiKey;
        this.endpoint = options.endpoint || 'https://api.mycustomservice.com';
    }

    async sendMessage(messages, options = {}) {
        // Convert messages to your API format
        const payload = this.formatMessages(messages, options);
        
        // Make API call
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract text response from API response
        return this.extractResponse(data);
    }

    formatMessages(messages, options) {
        // Convert messages array to your API's expected format
        return {
            messages: messages,
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.7
        };
    }

    extractResponse(data) {
        // Extract the text response from your API's response format
        if (data.response && data.response.text) {
            return data.response.text;
        }
        throw new Error('Invalid response format');
    }
}
```

### Step 2: Register the Adapter

Add your adapter to the global ChatAdapters object:

```javascript
// Add to chatWidget.js or in a separate script after chatWidget.js
window.ChatAdapters.MyCustomAdapter = MyCustomAdapter;
```

### Step 3: Configure in main.js

Update the adapter configuration in `main.js`:

```javascript
function initializeChatWidget() {
    const adapters = [];
    
    // Existing adapters
    adapters.push(new window.ChatAdapters.HuggingFaceAdapter({
        endpoint: '/api/ai'
    }));
    
    // Add your custom adapter
    adapters.push(new window.ChatAdapters.MyCustomAdapter({
        apiKey: 'your-api-key',
        endpoint: 'https://api.mycustomservice.com/chat'
    }));

    window.jaysChatWidget = new window.ChatWidget({
        // ... other options
        adapters: adapters
    });
}
```

## Configuration Options

### Widget Configuration

```javascript
new window.ChatWidget({
    containerId: 'chat-widget',     // ID of widget container
    bubbleId: 'chat-bubble',        // ID of chat bubble
    adapters: [adapter1, adapter2], // Array of adapters
    strategy: 'failover',           // 'failover' or 'parallel'
    maxRetries: 2,                  // Retries per adapter
    timeout: 30000,                 // Timeout in milliseconds
    debug: false                    // Enable debug logging
});
```

### Strategy Types

**Failover Strategy** (default):
- Tries adapters in sequence
- Falls back to next adapter if current fails
- Good for reliability

**Parallel Strategy**:
- Sends requests to all adapters simultaneously
- Returns first successful response
- Good for speed

## Error Handling

Adapters should throw errors for failed requests:

```javascript
async sendMessage(messages, options) {
    try {
        const response = await fetch(this.endpoint, {
            // ... request config
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        // ... process response
        
    } catch (error) {
        // Re-throw with context
        throw new Error(`${this.name} adapter failed: ${error.message}`);
    }
}
```

## Testing Your Adapter

### Manual Testing

1. Add debug logging to your adapter
2. Set `debug: true` in widget configuration
3. Open browser console and test chat functionality
4. Verify API calls and responses

### Unit Testing

Create tests following the existing pattern in `/tests/`:

```javascript
// tests/my-custom-adapter.test.js
import { describe, it, expect, vi } from 'vitest';
import { MyCustomAdapter } from '../chatWidget.js';

describe('MyCustomAdapter', () => {
    it('should send messages correctly', async () => {
        const adapter = new MyCustomAdapter({
            apiKey: 'test-key',
            endpoint: 'https://test.api.com'
        });

        // Mock fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                response: { text: 'Test response' }
            })
        });

        const messages = [
            { role: 'user', content: 'Hello' }
        ];

        const result = await adapter.sendMessage(messages);
        expect(result).toBe('Test response');
    });
});
```

## Best Practices

### 1. Error Handling
- Always throw descriptive errors
- Include adapter name in error messages
- Handle network timeouts gracefully

### 2. Response Formatting
- Always return plain text strings
- Strip any formatting or metadata
- Handle empty/null responses

### 3. Configuration
- Make all options configurable
- Provide sensible defaults
- Validate required parameters

### 4. Security
- Never expose API keys in client-side code
- Use environment variables or secure endpoints
- Validate all inputs

### 5. Performance
- Implement proper timeout handling
- Cache responses when appropriate
- Minimize API call overhead

## Environment Variables

For server-side adapters, use environment variables:

```bash
# .env file
DEEPSEEK_API_KEY=your-deepseek-key
OPENAI_API_KEY=your-openai-key
CUSTOM_API_KEY=your-custom-key
```

## Advanced Features

### Custom Message Formatting

Some APIs require specific message formats:

```javascript
formatMessages(messages) {
    // Convert OpenAI format to custom format
    return messages.map(msg => ({
        role: msg.role === 'assistant' ? 'bot' : msg.role,
        text: msg.content,
        timestamp: Date.now()
    }));
}
```

### Response Processing

Handle complex response formats:

```javascript
extractResponse(data) {
    // Handle multiple response formats
    if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
    } else if (data.response) {
        return data.response.text || data.response.content;
    } else if (typeof data === 'string') {
        return data;
    }
    
    throw new Error('Unknown response format');
}
```

### Adapter Priority

Configure adapter priority for failover:

```javascript
const adapters = [
    { adapter: primaryAdapter, priority: 1 },
    { adapter: secondaryAdapter, priority: 2 },
    { adapter: fallbackAdapter, priority: 3 }
].sort((a, b) => a.priority - b.priority).map(item => item.adapter);
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API supports CORS or use a proxy endpoint
2. **API Key Errors**: Verify keys are correctly configured and have proper permissions
3. **Timeout Issues**: Adjust timeout settings or optimize API calls
4. **Response Format**: Check API documentation for correct response parsing

### Debug Mode

Enable debug logging to troubleshoot:

```javascript
new window.ChatWidget({
    debug: true,
    // ... other options
});
```

This will log:
- Adapter initialization
- API calls and responses
- Error details
- Failover attempts

## Examples

See the `examples/` directory for complete adapter implementations:
- Custom OpenAI adapter
- Anthropic Claude adapter  
- Local LLM adapter
- Webhook-based adapter

## Support

For questions or issues:
1. Check the troubleshooting section
2. Enable debug mode for detailed logs
3. Review existing adapter implementations
4. Create an issue with detailed error information