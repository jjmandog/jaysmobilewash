/**
 * API Dashboard - UI component for managing and testing APIs
 * Provides a comprehensive interface for the plug-and-play API system
 */

import React, { useState, useEffect } from 'react';
import { 
  initializeDynamicRouter, 
  getRoutingInfo, 
  testRouting, 
  reloadAPIs,
  getRegisteredAPI,
  getAPIsByCategory
} from '../utils/dynamicChatRouter.js';

const APIDashboard = () => {
  const [routingInfo, setRoutingInfo] = useState(null);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      await initializeDynamicRouter();
      const info = getRoutingInfo();
      setRoutingInfo(info);
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReloadAPIs = async () => {
    try {
      setLoading(true);
      await reloadAPIs();
      const info = getRoutingInfo();
      setRoutingInfo(info);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRouting = () => {
    if (!testInput.trim()) return;
    
    const results = testRouting(testInput);
    setTestResults(results);
  };

  const handleTestAPI = async (api) => {
    try {
      const response = await fetch(api.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: testInput || 'Test message',
          test: true
        })
      });

      const data = await response.json();
      setTestResults({
        ...testResults,
        apiResponse: data,
        apiTested: api.id
      });
    } catch (err) {
      setTestResults({
        ...testResults,
        apiError: err.message,
        apiTested: api.id
      });
    }
  };

  if (loading) {
    return (
      <div className="api-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading API Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-dashboard error">
        <div className="error-message">
          <h3>Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={initializeDashboard}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="api-dashboard">
      <div className="dashboard-header">
        <h2>API Dashboard</h2>
        <p>Manage and test your plug-and-play APIs</p>
        <button 
          onClick={handleReloadAPIs}
          className="reload-button"
          disabled={loading}
        >
          🔄 Reload APIs
        </button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'apis' ? 'active' : ''}
          onClick={() => setActiveTab('apis')}
        >
          APIs
        </button>
        <button 
          className={activeTab === 'test' ? 'active' : ''}
          onClick={() => setActiveTab('test')}
        >
          Test Routing
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab routingInfo={routingInfo} />
        )}
        
        {activeTab === 'apis' && (
          <APIsTab 
            routingInfo={routingInfo} 
            selectedAPI={selectedAPI}
            setSelectedAPI={setSelectedAPI}
            onTestAPI={handleTestAPI}
            testInput={testInput}
          />
        )}
        
        {activeTab === 'test' && (
          <TestTab
            testInput={testInput}
            setTestInput={setTestInput}
            testResults={testResults}
            onTest={handleTestRouting}
          />
        )}
        
        {activeTab === 'categories' && (
          <CategoriesTab routingInfo={routingInfo} />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ routingInfo }) => (
  <div className="overview-tab">
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total APIs</h3>
        <div className="stat-value">{routingInfo.registry.total}</div>
      </div>
      <div className="stat-card">
        <h3>Enabled APIs</h3>
        <div className="stat-value">{routingInfo.registry.enabled}</div>
      </div>
      <div className="stat-card">
        <h3>Categories</h3>
        <div className="stat-value">{routingInfo.registry.categories}</div>
      </div>
      <div className="stat-card">
        <h3>Status</h3>
        <div className="stat-value">
          {routingInfo.registry.initialized ? '✅ Ready' : '❌ Not Ready'}
        </div>
      </div>
    </div>
    
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="action-buttons">
        <button>Add New API</button>
        <button>Import Configuration</button>
        <button>Export Configuration</button>
        <button>View Logs</button>
      </div>
    </div>
  </div>
);

// APIs Tab Component
const APIsTab = ({ routingInfo, selectedAPI, setSelectedAPI, onTestAPI, testInput }) => (
  <div className="apis-tab">
    <div className="apis-list">
      {routingInfo.apis.map(api => (
        <div 
          key={api.id} 
          className={`api-card ${selectedAPI?.id === api.id ? 'selected' : ''}`}
          onClick={() => setSelectedAPI(api)}
        >
          <div className="api-header">
            <h3>{api.name}</h3>
            <div className={`api-status ${api.enabled ? 'enabled' : 'disabled'}`}>
              {api.enabled ? '✅' : '❌'}
            </div>
          </div>
          <p className="api-description">{api.description}</p>
          <div className="api-categories">
            {api.categories?.map(category => (
              <span key={category} className="category-tag">{category}</span>
            ))}
          </div>
          <div className="api-actions">
            <button onClick={(e) => {
              e.stopPropagation();
              onTestAPI(api);
            }}>
              Test API
            </button>
            <button onClick={(e) => {
              e.stopPropagation();
              window.open(api.endpoint, '_blank');
            }}>
              View Endpoint
            </button>
          </div>
        </div>
      ))}
    </div>
    
    {selectedAPI && (
      <div className="api-details">
        <h3>API Details: {selectedAPI.name}</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>{selectedAPI.id}</span>
          </div>
          <div className="detail-item">
            <label>Endpoint:</label>
            <span>{selectedAPI.endpoint}</span>
          </div>
          <div className="detail-item">
            <label>Categories:</label>
            <span>{selectedAPI.categories?.join(', ')}</span>
          </div>
          <div className="detail-item">
            <label>Status:</label>
            <span>{selectedAPI.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Test Tab Component
const TestTab = ({ testInput, setTestInput, testResults, onTest }) => (
  <div className="test-tab">
    <div className="test-input-section">
      <h3>Test API Routing</h3>
      <div className="test-input-group">
        <textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="Enter test input to see which APIs would handle it..."
          rows={4}
        />
        <button onClick={onTest} disabled={!testInput.trim()}>
          Test Routing
        </button>
      </div>
    </div>
    
    {testResults && (
      <div className="test-results">
        <h3>Routing Results</h3>
        <div className="test-input-display">
          <strong>Input:</strong> {testResults.input}
        </div>
        
        <div className="matching-apis">
          <h4>Matching APIs ({testResults.matchingAPIs.length})</h4>
          {testResults.matchingAPIs.length > 0 ? (
            <div className="api-matches">
              {testResults.matchingAPIs.map((api, index) => (
                <div key={api.id} className="api-match">
                  <span className="match-rank">#{index + 1}</span>
                  <span className="match-name">{api.name}</span>
                  <span className="match-categories">
                    {api.categories?.join(', ')}
                  </span>
                  {api.shouldHandle !== null && (
                    <span className={`should-handle ${api.shouldHandle ? 'yes' : 'no'}`}>
                      {api.shouldHandle ? '✅ Would handle' : '❌ Would decline'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-matches">No matching APIs found. Would fallback to: {testResults.fallbackRole}</p>
          )}
        </div>
        
        {testResults.apiResponse && (
          <div className="api-response">
            <h4>API Response</h4>
            <pre>{JSON.stringify(testResults.apiResponse, null, 2)}</pre>
          </div>
        )}
        
        {testResults.apiError && (
          <div className="api-error">
            <h4>API Error</h4>
            <p>{testResults.apiError}</p>
          </div>
        )}
      </div>
    )}
  </div>
);

// Categories Tab Component
const CategoriesTab = ({ routingInfo }) => (
  <div className="categories-tab">
    <h3>API Categories</h3>
    <div className="categories-grid">
      {routingInfo.categories.map(category => {
        const categoryAPIs = routingInfo.apis.filter(api => 
          api.categories?.includes(category)
        );
        
        return (
          <div key={category} className="category-card">
            <h4>{category}</h4>
            <div className="category-apis">
              {categoryAPIs.map(api => (
                <div key={api.id} className="category-api">
                  <span className="api-name">{api.name}</span>
                  <span className={`api-status ${api.enabled ? 'enabled' : 'disabled'}`}>
                    {api.enabled ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default APIDashboard;