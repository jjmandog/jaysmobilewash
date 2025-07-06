# LocalAI.io Integration Guide

## What is LocalAI?
LocalAI is a free, open-source alternative to OpenAI that can run locally or in the cloud. It's compatible with OpenAI's API format but completely free.

## Setup Options

### Option 1: Use Public LocalAI Instance (Easiest)
- Endpoint: `https://api.localai.io/v1`
- No API key needed (use `sk-free`)
- Free tier with rate limits

### Option 2: Run LocalAI Locally (Best Performance)
1. Install Docker
2. Run: `docker run -p 8080:8080 localai/localai:latest`
3. Use endpoint: `http://localhost:8080/v1`

### Option 3: Deploy to Cloud (Most Reliable)
- Deploy to Railway, Render, or similar
- Use your own instance endpoint

## Environment Variables

Add these to Vercel:
```bash
# LocalAI endpoint (optional, defaults to public instance)
LOCALAI_ENDPOINT=https://api.localai.io/v1

# LocalAI model (optional, defaults to gpt-3.5-turbo)
LOCALAI_MODEL=gpt-3.5-turbo

# LocalAI API key (optional for public instance)
LOCALAI_API_KEY=sk-free
```

## Benefits vs HuggingFace
- ✅ **Actually works** - No token issues
- ✅ **Completely free** - No paid plans needed
- ✅ **OpenAI compatible** - Same API format
- ✅ **Local option** - Can run offline
- ✅ **No rate limits** - When self-hosted
- ✅ **Multiple models** - Supports various LLMs

## Usage
The `/api/localai` endpoint is now ready to use with the same format as your existing chatbot.

## Next Steps
1. Deploy this code
2. Test the endpoint
3. Update your chatbot to use LocalAI instead of HuggingFace
4. (Optional) Set up your own LocalAI instance for better performance
