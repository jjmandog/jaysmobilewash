#!/bin/bash
# LocalAI Setup Script
# This script sets up a LocalAI instance with popular models

echo "🚀 Setting up LocalAI instance..."

# Option 1: Quick Docker setup (recommended for testing)
echo "Starting LocalAI with Docker..."
docker run -d \
  --name localai \
  -p 8080:8080 \
  -e DEBUG=true \
  -e MODELS_PATH=/models \
  -v $(pwd)/models:/models \
  localai/localai:latest

echo "⏳ Waiting for LocalAI to start..."
sleep 10

# Download popular models
echo "📥 Downloading models..."
mkdir -p models

# Download lightweight models
curl -L "https://huggingface.co/microsoft/DialoGPT-medium/resolve/main/pytorch_model.bin" -o models/dialogpt-medium.bin
curl -L "https://huggingface.co/gpt2/resolve/main/pytorch_model.bin" -o models/gpt2.bin

# Create model configurations
cat > models/gpt2.yaml << EOF
name: gpt2
backend: transformers
parameters:
  model: gpt2
  max_tokens: 512
  temperature: 0.7
EOF

cat > models/chat.yaml << EOF
name: chat
backend: transformers  
parameters:
  model: microsoft/DialoGPT-medium
  max_tokens: 512
  temperature: 0.7
EOF

echo "✅ LocalAI setup complete!"
echo "🌐 API endpoint: http://localhost:8080/v1"
echo "📋 Test with: curl http://localhost:8080/v1/models"
