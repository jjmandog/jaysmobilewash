## Available OpenRouter Models (Free Tier) - July 2025

This is the current list of all available free OpenRouter models integrated into Jay's Mobile Wash AI chatbot:

### 🤖 Model List (Total: 9 Free Models)

1. **DeepSeek Chat** (`deepseek/deepseek-chat`)
   - Type: General-purpose conversation and reasoning
   - Strengths: Excellent reasoning, coding, analysis
   - Best for: Complex questions, detailed explanations

2. **Mistral 7B Instruct** (`mistralai/mistral-7b-instruct`)
   - Type: Instruction-following model
   - Strengths: Clear instructions, structured responses
   - Best for: Task completion, professional communication

3. **Llama 3 8B Instruct** (`meta-llama/llama-3-8b-instruct`)
   - Type: Meta's open-source instruction model
   - Strengths: Balanced performance, good reasoning
   - Best for: General chat, informational queries

4. **Gemma 7B IT** (`google/gemma-7b-it`)
   - Type: Google's open-source language model
   - Strengths: Efficient performance, good reasoning
   - Best for: General conversation, balanced responses

5. **Qwen 2 7B Instruct** (`qwen/qwen-2-7b-instruct`)
   - Type: Alibaba's multilingual model
   - Strengths: Multilingual support, technical knowledge
   - Best for: Technical questions, diverse language support

6. **Phi-3 Medium** (`microsoft/phi-3-medium-4k-instruct`)
   - Type: Microsoft's efficient small model
   - Strengths: Fast responses, good reasoning for size
   - Best for: Quick answers, resource-efficient processing

7. **Zephyr 7B Beta** (`huggingfaceh4/zephyr-7b-beta`)
   - Type: Hugging Face's fine-tuned model
   - Strengths: Community-driven improvements
   - Best for: Open-source enthusiasts, experimental features

8. **OpenChat 7B** (`openchat/openchat-7b`)
   - Type: Optimized for conversational AI
   - Strengths: Natural conversation flow
   - Best for: Casual chat, customer interactions

9. **Llama 3.3 Nemotron Super 49B** (`nvidia/llama-3.3-nemotron-super-49b-v1`)
   - Type: NVIDIA's enhanced large model
   - Strengths: Advanced reasoning, complex tasks
   - Best for: Sophisticated analysis, complex problem-solving

### 🛡️ Admin Protection Features

- **Model Selection**: Dropdown is disabled by default
- **Settings Panel**: Locked until admin mode activated
- **Admin Access**: Type "josh" to unlock admin features
- **Visual Indicators**: Grayed out elements when locked
- **Scrollable Dropdown**: Proper overflow handling for long model list

### 🚀 Auto-Selection Mode

When "Auto (Let AI choose)" is selected, the system intelligently routes requests based on:
- **Quotes**: Uses reasoning-capable models
- **Search**: Uses knowledge-focused models  
- **Analysis**: Uses detailed analysis models
- **Chat**: Uses conversational models
- **Default**: Falls back to DeepSeek Chat

### 📊 Usage Notes

- All models are **completely free** via OpenRouter
- No API costs for basic usage
- Models may have rate limits during peak times
- Fallback to local knowledge base if models unavailable
- Admin can switch models in real-time for testing

### 🔧 Technical Implementation

- Uses OpenRouter API proxy (`/api/openrouter`)
- Model selection passed in request body
- Error handling for unavailable models
- Response includes which model was used
- Logging for admin debugging

Last Updated: July 4, 2025
