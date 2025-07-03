/**
 * Example integration showing how to migrate existing chat components
 * to use the new plug-and-play API system
 */

import React, { useState, useEffect } from 'react';
import { routeRequest, getRoutingInfo } from '../utils/dynamicChatRouter.js';
import DynamicAIChatBox from './DynamicAIChatBox.jsx';
import APIDashboard from './APIDashboard.jsx';

// Example 1: Simple Migration
const MigratedChatComponent = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserMessage = async (message) => {
    setLoading(true);
    try {
      // Old way: Fixed routing
      // const result = await routeLLMRequest(message, 'chat', assignments);
      
      // New way: Dynamic routing
      const result = await routeRequest(message);
      setResponse(result.content || result.response || result);
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="migrated-chat">
      <h3>Migrated Chat Component</h3>
      <DynamicAIChatBox 
        onQuery={handleUserMessage}
        showRoutingInfo={true}
      />
      {response && (
        <div className="response">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

// Example 2: Advanced Integration with API Management
const AdvancedChatInterface = () => {
  const [routingInfo, setRoutingInfo] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Load routing information
    const loadRoutingInfo = async () => {
      try {
        const info = getRoutingInfo();
        setRoutingInfo(info);
      } catch (error) {
        console.error('Failed to load routing info:', error);
      }
    };

    loadRoutingInfo();
  }, []);

  const handleChatQuery = async (prompt, response, routing) => {
    // Add to chat history
    const newEntry = {
      id: Date.now(),
      prompt,
      response,
      routing,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, newEntry]);
  };

  return (
    <div className="advanced-chat-interface">
      <div className="interface-header">
        <h2>Jay's Mobile Wash AI Assistant</h2>
        <div className="controls">
          {routingInfo && (
            <div className="routing-status">
              <span>APIs: {routingInfo.registry.enabled}/{routingInfo.registry.total}</span>
            </div>
          )}
          <button 
            onClick={() => setShowDashboard(!showDashboard)}
            className="dashboard-toggle"
          >
            {showDashboard ? 'Hide' : 'Show'} API Dashboard
          </button>
        </div>
      </div>

      {showDashboard && (
        <div className="dashboard-section">
          <APIDashboard />
        </div>
      )}

      <div className="chat-section">
        <DynamicAIChatBox 
          onQuery={handleChatQuery}
          showRoutingInfo={true}
          placeholder="Ask about our mobile detailing services, get quotes, or manage bookings..."
        />
      </div>

      {chatHistory.length > 0 && (
        <div className="chat-history">
          <h3>Recent Conversations</h3>
          <div className="history-list">
            {chatHistory.slice(-5).map(entry => (
              <div key={entry.id} className="history-item">
                <div className="history-prompt">
                  <strong>You:</strong> {entry.prompt}
                </div>
                <div className="history-response">
                  <strong>Assistant:</strong> {entry.response}
                </div>
                {entry.routing && (
                  <div className="history-routing">
                    <small>Routed to: {entry.routing.routedTo}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Example 3: Custom API Integration
const CustomAPIExample = () => {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Example: Test if our custom quote API is working
    const testQuoteAPI = async () => {
      try {
        const response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'full detail',
            vehicleType: 'car'
          })
        });

        if (response.ok) {
          setApiStatus('working');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        setApiStatus('error');
      }
    };

    testQuoteAPI();
  }, []);

  const handleQuoteRequest = async () => {
    try {
      // Direct API call example
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'ceramic coating',
          vehicleType: 'SUV',
          addOns: ['interior protection', 'tire shine']
        })
      });

      const data = await response.json();
      console.log('Quote generated:', data.quote);
    } catch (error) {
      console.error('Quote request failed:', error);
    }
  };

  return (
    <div className="custom-api-example">
      <h3>Custom API Integration Example</h3>
      
      <div className="api-status">
        <span>Quote API Status: </span>
        <span className={`status-${apiStatus}`}>
          {apiStatus === 'checking' ? '🔄 Checking...' : 
           apiStatus === 'working' ? '✅ Working' : 
           '❌ Error'}
        </span>
      </div>

      <button onClick={handleQuoteRequest}>
        🧾 Test Quote Generation
      </button>

      <div className="integration-info">
        <h4>How this works:</h4>
        <ul>
          <li>✅ Quote API automatically discovered in /api directory</li>
          <li>✅ Metadata defines categories: ['quotes', 'pricing', 'services']</li>
          <li>✅ Keywords enable automatic routing: ['quote', 'price', 'cost']</li>
          <li>✅ Zero configuration - just drop the file and it works!</li>
        </ul>
      </div>
    </div>
  );
};

// Main export component showing all examples
const PlugAndPlayExamples = () => {
  const [activeExample, setActiveExample] = useState('migrated');

  const examples = {
    migrated: { component: MigratedChatComponent, title: 'Simple Migration' },
    advanced: { component: AdvancedChatInterface, title: 'Advanced Integration' },
    custom: { component: CustomAPIExample, title: 'Custom API Example' }
  };

  const ActiveComponent = examples[activeExample].component;

  return (
    <div className="plug-and-play-examples">
      <div className="examples-header">
        <h1>🔌 Plug-and-Play API System Examples</h1>
        <div className="example-tabs">
          {Object.entries(examples).map(([key, { title }]) => (
            <button
              key={key}
              className={`tab ${activeExample === key ? 'active' : ''}`}
              onClick={() => setActiveExample(key)}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      <div className="example-content">
        <ActiveComponent />
      </div>

      <div className="usage-guide">
        <h3>📚 Quick Usage Guide</h3>
        <div className="guide-steps">
          <div className="step">
            <h4>1. Create API File</h4>
            <code>cp api-templates/pluggable-api.js api/my-api.js</code>
          </div>
          <div className="step">
            <h4>2. Define Metadata</h4>
            <code>categories: ['chat', 'tools'], keywords: ['help', 'assist']</code>
          </div>
          <div className="step">
            <h4>3. Implement Logic</h4>
            <code>async function processRequest(message, options) {`{}`}</code>
          </div>
          <div className="step">
            <h4>4. Test & Use</h4>
            <code>await routeRequest('user message')</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlugAndPlayExamples;
export { MigratedChatComponent, AdvancedChatInterface, CustomAPIExample };