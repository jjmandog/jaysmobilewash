/**
 * Enhanced AIChatBox Integration Example
 * Shows how to integrate the modular API assignment system with the existing AIChatBox
 */

import React, { useState, useRef, useEffect } from 'react';
import { routeLLMRequest } from '../utils/chatRouter.js';
import { DEFAULT_ROLE_ASSIGNMENTS } from '../constants/apiOptions.js';
import { logError, MODULE_CONTEXTS } from '../utils/errorHandler.js';

const EnhancedAIChatBox = ({ 
  className = '',
  placeholder = 'Ask me about our mobile detailing services...', 
  maxLength = 500,
  disabled = false,
  roleAssignments = DEFAULT_ROLE_ASSIGNMENTS,
  currentRole = 'chat',
  onQuery,
  showRoleSelector = true
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const textareaRef = useRef(null);

  const remainingChars = maxLength - prompt.length;

  // Available roles for selection
  const availableRoles = [
    { id: 'chat', name: 'General Chat' },
    { id: 'quotes', name: 'Get Quote' },
    { id: 'search', name: 'Search Info' },
    { id: 'summaries', name: 'Summarize' },
    { id: 'reasoning', name: 'Analysis' }
  ];

  // Enhanced submit handler using the new routing system
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      // Use the new routing system instead of direct AI query
      const result = await routeLLMRequest(prompt.trim(), selectedRole, roleAssignments);
      
      // Handle different response formats
      let responseText = '';
      if (typeof result === 'string') {
        responseText = result;
      } else if (result.choices && result.choices[0]) {
        responseText = result.choices[0].message?.content || result.choices[0].text || JSON.stringify(result);
      } else if (result.response) {
        responseText = result.response;
      } else {
        responseText = JSON.stringify(result, null, 2);
      }
      
      setResponse(responseText);
      
      // Call custom handler if provided
      if (onQuery) {
        onQuery(result, selectedRole, roleAssignments);
      }

    } catch (err) {
      logError(MODULE_CONTEXTS.CHAT_BOT, 'Enhanced chat error', err, { 
        selectedRole, 
        prompt: prompt?.substring(0, 100),
        roleAssignments 
      });
      setError(err.message || 'An error occurred while processing your request.');
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

  return (
    <div className={`enhanced-ai-chatbox ${className}`}>
      <style jsx>{`
        .enhanced-ai-chatbox {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .chatbox-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #f8fafc;
          border-radius: 12px 12px 0 0;
        }
        
        .chatbox-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        
        .role-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .role-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .role-select {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }
        
        .api-info {
          font-size: 12px;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }
        
        .chatbox-form {
          padding: 20px;
        }
        
        .chatbox-input {
          width: 100%;
          min-height: 60px;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }
        
        .chatbox-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        
        .chatbox-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }
        
        .char-counter {
          font-size: 12px;
          color: #6b7280;
        }
        
        .char-counter.warning {
          color: #dc2626;
        }
        
        .chatbox-actions {
          display: flex;
          gap: 8px;
        }
        
        .chatbox-button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .chatbox-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .button-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        
        .button-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }
        
        .button-primary {
          background: #3b82f6;
          color: white;
        }
        
        .button-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .response-container {
          padding: 0 20px 20px;
        }
        
        .response-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }
        
        .response-text {
          white-space: pre-wrap;
          line-height: 1.6;
          color: #374151;
          margin: 0;
        }
        
        .response-meta {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #6b7280;
          display: flex;
          justify-content: space-between;
        }
        
        .loading-box {
          background: #dbeafe;
          color: #1e40af;
          text-align: center;
          padding: 16px;
          margin-top: 16px;
          border-radius: 8px;
        }
        
        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 16px;
          margin-top: 16px;
          border-radius: 8px;
        }
        
        @media (max-width: 768px) {
          .enhanced-ai-chatbox {
            margin: 10px;
            border-radius: 8px;
          }
          
          .chatbox-actions {
            flex-direction: column;
          }
          
          .chatbox-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="chatbox-header">
        <h3 className="chatbox-title">🤖 Enhanced AI Assistant</h3>
        
        {showRoleSelector && (
          <div className="role-selector">
            <label className="role-label">Mode:</label>
            <select 
              className="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={isLoading}
            >
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="api-info">
          Using: {roleAssignments[selectedRole] || 'Not assigned'} API
        </div>
      </div>

      <form onSubmit={handleSubmit} className="chatbox-form">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="chatbox-input"
          disabled={disabled || isLoading}
          aria-label="AI chat input"
        />
        
        <div className="chatbox-meta">
          <span className={`char-counter ${remainingChars < 50 ? 'warning' : ''}`}>
            {remainingChars} characters remaining
          </span>
          
          <div className="chatbox-actions">
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || isLoading || (!prompt && !response)}
              className="chatbox-button button-secondary"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={disabled || isLoading || !prompt.trim()}
              className="chatbox-button button-primary"
            >
              {isLoading ? 'Processing...' : 'Send'}
            </button>
          </div>
        </div>
      </form>

      <div className="response-container">
        {isLoading && (
          <div className="loading-box">
            <div>🤖 Processing with {roleAssignments[selectedRole]} API...</div>
          </div>
        )}

        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        {response && !isLoading && (
          <div className="response-box">
            <pre className="response-text">{response}</pre>
            <div className="response-meta">
              <span>Role: {selectedRole}</span>
              <span>API: {roleAssignments[selectedRole]}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAIChatBox;