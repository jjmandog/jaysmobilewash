/**
 * AIChatBox Component - React SPA example component for AI interactions
 * Uses the AI utility helper to POST prompts and display responses
 * Designed to integrate seamlessly without affecting existing layout or styling
 */

import React, { useState, useRef, useEffect } from 'react';
import { queryAI, sanitizePrompt, isAIServiceAvailable } from '../utils/ai.js';

const AIChatBox = ({ 
  className = '',
  placeholder = 'Ask me about our mobile detailing services...', 
  maxLength = 500,
  disabled = false 
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);
  const textareaRef = useRef(null);

  // Check service availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await isAIServiceAvailable();
      setIsServiceAvailable(available);
    };
    checkAvailability();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanitizedPrompt = sanitizePrompt(prompt);
    if (!sanitizedPrompt) {
      setError('Please enter a valid question or prompt');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const aiResponse = await queryAI(sanitizedPrompt);
      
      // Handle Hugging Face response format
      if (Array.isArray(aiResponse) && aiResponse.length > 0) {
        // GPT-2 returns an array with generated_text
        const generatedText = aiResponse[0].generated_text || 'No response generated';
        setResponse(generatedText);
      } else if (aiResponse.generated_text) {
        setResponse(aiResponse.generated_text);
      } else {
        setResponse(JSON.stringify(aiResponse, null, 2));
      }
    } catch (err) {
      console.error('AI query error:', err);
      setError(err.message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
    setError('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const remainingChars = maxLength - prompt.length;

  return (
    <div className={`ai-chatbox ${className}`}>
      <style jsx>{`
        .ai-chatbox {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .ai-chatbox-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .ai-chatbox-input {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }
        
        .ai-chatbox-input:focus {
          outline: none;
          border-color: #007cba;
          box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
        }
        
        .ai-chatbox-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #666;
        }
        
        .ai-chatbox-actions {
          display: flex;
          gap: 10px;
        }
        
        .ai-chatbox-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .ai-chatbox-button-primary {
          background: #007cba;
          color: white;
        }
        
        .ai-chatbox-button-primary:hover:not(:disabled) {
          background: #005a87;
        }
        
        .ai-chatbox-button-secondary {
          background: #f0f0f0;
          color: #333;
        }
        
        .ai-chatbox-button-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }
        
        .ai-chatbox-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .ai-chatbox-response {
          margin-top: 20px;
          padding: 15px;
          border-radius: 4px;
          background: #f8f9fa;
        }
        
        .ai-chatbox-response-content {
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.5;
        }
        
        .ai-chatbox-error {
          background: #ffe6e6;
          color: #d63384;
          border-left: 4px solid #d63384;
        }
        
        .ai-chatbox-loading {
          background: #e3f2fd;
          color: #1976d2;
          text-align: center;
        }
        
        .ai-chatbox-unavailable {
          background: #fff3cd;
          color: #856404;
          border-left: 4px solid #ffc107;
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 4px;
        }
        
        @media (max-width: 768px) {
          .ai-chatbox {
            margin: 0;
            border-radius: 0;
            box-shadow: none;
          }
          
          .ai-chatbox-actions {
            flex-direction: column;
          }
          
          .ai-chatbox-button {
            width: 100%;
          }
        }
      `}</style>

      {!isServiceAvailable && (
        <div className="ai-chatbox-unavailable">
          ⚠️ AI service is currently unavailable. Please try again later.
        </div>
      )}

      <form onSubmit={handleSubmit} className="ai-chatbox-form">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="ai-chatbox-input"
          disabled={disabled || isLoading || !isServiceAvailable}
          aria-label="AI chat input"
        />
        
        <div className="ai-chatbox-meta">
          <span className={remainingChars < 50 ? 'text-warning' : ''}>
            {remainingChars} characters remaining
          </span>
          
          <div className="ai-chatbox-actions">
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || isLoading || (!prompt && !response)}
              className="ai-chatbox-button ai-chatbox-button-secondary"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={disabled || isLoading || !prompt.trim() || !isServiceAvailable}
              className="ai-chatbox-button ai-chatbox-button-primary"
            >
              {isLoading ? 'Generating...' : 'Ask AI'}
            </button>
          </div>
        </div>
      </form>

      {isLoading && (
        <div className="ai-chatbox-response ai-chatbox-loading">
          <div>🤖 Generating response...</div>
        </div>
      )}

      {error && (
        <div className="ai-chatbox-response ai-chatbox-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && !isLoading && (
        <div className="ai-chatbox-response">
          <strong>AI Response:</strong>
          <div className="ai-chatbox-response-content">{response}</div>
        </div>
      )}
    </div>
  );
};

export default AIChatBox;