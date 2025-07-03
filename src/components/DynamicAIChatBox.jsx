/**
 * Enhanced AI Chat Box with Dynamic API Routing
 * Uses the new plug-and-play API system for intelligent routing
 */

import React, { useState, useRef, useEffect } from 'react';
import { routeRequest, initializeDynamicRouter, getRoutingInfo } from '../utils/dynamicChatRouter.js';
import './APIDashboard.css';

const DynamicAIChatBox = ({ 
  className = '',
  placeholder = 'Ask me anything about our mobile detailing services...', 
  maxLength = 500,
  disabled = false,
  onQuery,
  showRoutingInfo = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [routingInfo, setRoutingInfo] = useState(null);
  const [lastRoutedAPI, setLastRoutedAPI] = useState(null);
  const textareaRef = useRef(null);

  const remainingChars = maxLength - prompt.length;

  // Initialize the dynamic router
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDynamicRouter();
        if (showRoutingInfo) {
          setRoutingInfo(getRoutingInfo());
        }
      } catch (err) {
        console.error('Failed to initialize dynamic router:', err);
      }
    };
    init();
  }, [showRoutingInfo]);

  // Enhanced submit handler using dynamic routing
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse('');
    setLastRoutedAPI(null);

    try {
      // Use the new dynamic routing system
      const result = await routeRequest(prompt.trim(), 'chat', {
        context: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });
      
      // Handle different response formats
      let responseText = '';
      let apiInfo = null;
      
      if (typeof result === 'string') {
        responseText = result;
      } else if (result.content) {
        responseText = result.content;
        apiInfo = result.metadata;
      } else if (result.response) {
        responseText = result.response;
        apiInfo = result.metadata;
      } else if (result.choices && result.choices[0]) {
        responseText = result.choices[0].message?.content || result.choices[0].text || JSON.stringify(result);
      } else {
        responseText = JSON.stringify(result);
      }

      setResponse(responseText);
      setLastRoutedAPI(apiInfo);
      
      // Call the onQuery callback if provided
      if (onQuery) {
        onQuery(prompt.trim(), responseText, apiInfo);
      }
      
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
    setError('');
    setLastRoutedAPI(null);
  };

  return (
    <div className={`dynamic-ai-chat-box ${className}`}>
      <div className="chat-header">
        <h3>AI Assistant</h3>
        <div className="chat-controls">
          {showRoutingInfo && routingInfo && (
            <div className="routing-info">
              <span>APIs: {routingInfo.registry.enabled}/{routingInfo.registry.total}</span>
            </div>
          )}
          <button onClick={handleClear} className="clear-button">
            Clear
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-section">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            rows={3}
            className="chat-input"
          />
          
          <div className="input-footer">
            <span className={`char-count ${remainingChars < 50 ? 'warning' : ''}`}>
              {remainingChars} characters remaining
            </span>
            <button 
              type="submit" 
              disabled={!prompt.trim() || isLoading || disabled}
              className="submit-button"
            >
              {isLoading ? (
                <span className="loading-spinner small"></span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {response && (
        <div className="response-section">
          <div className="response-header">
            <span className="response-label">Response:</span>
            {lastRoutedAPI && (
              <div className="routing-details">
                <span className="routed-to">
                  Routed to: {lastRoutedAPI.routedTo || 'Unknown'}
                </span>
                {lastRoutedAPI.categories && (
                  <span className="api-categories">
                    {lastRoutedAPI.categories.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="response-content">
            <pre className="response-text">{response}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicAIChatBox;