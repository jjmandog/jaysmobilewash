# HuggingFace Gated Models API Access Guide

## Overview

This document explains how to access gated models (like Meta Llama models) via HuggingFace's API, based on official documentation research.

## Key Requirements for Gated Models

### 1. User Access Request
- **Must request access** via HuggingFace website for each gated model
- **Visit the model page** (e.g., `https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct`)
- **Click "Request Access"** and fill out the form
- **Wait for approval** (automatic or manual depending on model)

### 2. API Key Requirements
- **Token must have proper permissions** for inference
- **Must be associated with the approved user account**
- **Token should be fine-grained** with "Make calls to Inference API" permissions

### 3. API Endpoint Options

#### Option A: Direct Inference API (Recommended for gated models)
```
POST https://api-inference.huggingface.co/models/{model_id}
Headers:
  Authorization: Bearer {HF_API_KEY}
  Content-Type: application/json
Body:
  {
    "inputs": "Your prompt here",
    "parameters": {
      "max_new_tokens": 150,
      "temperature": 0.7,
      "do_sample": true
    }
  }
```

#### Option B: Inference Providers (Multi-provider routing)
```
POST https://router.huggingface.co/v1/chat/completions
Headers:
  Authorization: Bearer {HF_API_KEY}
  Content-Type: application/json
Body:
  {
    "model": "meta-llama/Llama-3.2-1B-Instruct",
    "messages": [{"role": "user", "content": "Hello"}]
  }
```

## Official Meta Llama Models (Gated Access Required)

### Llama 3.2 Series
- `meta-llama/Llama-3.2-1B`
- `meta-llama/Llama-3.2-1B-Instruct`
- `meta-llama/Llama-3.2-3B`
- `meta-llama/Llama-3.2-3B-Instruct`
- `meta-llama/Llama-3.2-11B-Vision-Instruct`
- `meta-llama/Llama-3.2-90B-Vision-Instruct`

### Llama 3.1 Series
- `meta-llama/Llama-3.1-8B`
- `meta-llama/Llama-3.1-8B-Instruct`
- `meta-llama/Llama-3.1-70B`
- `meta-llama/Llama-3.1-70B-Instruct`
- `meta-llama/Llama-3.1-405B`
- `meta-llama/Llama-3.1-405B-Instruct`

### Llama 3.3 Series
- `meta-llama/Llama-3.3-70B-Instruct`

### Llama 2 Series
- `meta-llama/Llama-2-7b-chat-hf`
- `meta-llama/Llama-2-13b-chat-hf`
- `meta-llama/Llama-2-70b-chat-hf`

### Llama Guard
- `meta-llama/Llama-Guard-3-8B`
- `meta-llama/Llama-Guard-3-1B`

## Common Error Responses

### 403 Forbidden
```json
{
  "error": "You don't have access to this model. Please request access."
}
```
**Solution:** Request access via HuggingFace website

### 404 Not Found
```json
{
  "error": "Model not found"
}
```
**Solution:** Check model name/path, ensure it exists

### 401 Unauthorized
```json
{
  "error": "Invalid authentication credentials"
}
```
**Solution:** Check API key validity and permissions

## Testing Strategy

1. **Test API key validity** with a public model first
2. **Test each gated model** individually
3. **Handle different error scenarios** gracefully
4. **Implement fallback options** for denied access

## Implementation Notes

- Always use the exact model names from HuggingFace Hub
- Include proper error handling for access denial
- Consider rate limiting and quota management
- Use the direct Inference API for most reliable gated access
- Test with simple prompts first before complex requests

## Action Items

1. ✅ Research HuggingFace gated models documentation
2. ⏳ Test user's API key with gated models
3. ⏳ Update API implementation with correct endpoints
4. ⏳ Implement proper error handling for gated access
5. ⏳ Create fallback options for denied access

---

*Last updated: January 2025*
