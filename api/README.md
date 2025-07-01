# Jay's Mobile Wash - Secure AI Chat API

## Setup Instructions

### Environment Variables

1. Copy `.env.example` to `.env.local`
2. Set your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

### Deployment

#### Vercel
1. Connect your repository to Vercel
2. Set the `OPENROUTER_API_KEY` environment variable in Vercel dashboard
3. Deploy

#### Netlify
1. Connect your repository to Netlify
2. Set the `OPENROUTER_API_KEY` environment variable in Netlify dashboard
3. Deploy

### API Endpoint

- **URL**: `/api/ai`
- **Method**: POST
- **Content-Type**: application/json
- **Body**: 
  ```json
  {
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "max_tokens": 500,
    "temperature": 0.7
  }
  ```

### Security Features

- API key is never exposed to the client
- Blocks known bot/crawler user agents
- Only accepts POST requests
- Validates environment configuration

### Files

- `api/ai.js` - Secure serverless function
- `enhanced_chat_widget.html` - Complete chat widget implementation
- `openrouter-api-fix.js` - Updated to use secure endpoint