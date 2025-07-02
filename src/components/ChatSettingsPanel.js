/**
 * ChatSettingsPanel Component - Enhanced with Community API Key Vault
 * Provides dropdowns for each role allowing live assignment of APIs
 * Shows provider availability status and community key management
 * Includes Smart Select mode when all required keys are available
 */

import React, { useState, useEffect } from 'react';
import { 
  API_OPTIONS, 
  CHAT_ROLES, 
  DEFAULT_ROLE_ASSIGNMENTS,
  getEnabledAPIs,
  validateRoleAssignments,
  getAPIById
} from '../constants/apiOptions.js';
import { canEnableSmartSelection } from '../utils/chatRouter.js';
import APIKeyModal from './APIKeyModal.jsx';

const ChatSettingsPanel = ({ 
  assignments = DEFAULT_ROLE_ASSIGNMENTS,
  onAssignmentsChange,
  className = '',
  isOpen = false,
  onToggle,
  smartSelectEnabled = false,
  onSmartSelectChange
}) => {
  const [currentAssignments, setCurrentAssignments] = useState(assignments);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [communityStatus, setCommunityStatus] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canEnableSmartSelect, setCanEnableSmartSelect] = useState(false);

  // Get enabled APIs for dropdowns
  const enabledAPIs = getEnabledAPIs();

  // Update internal state when props change
  useEffect(() => {
    setCurrentAssignments(assignments);
    setHasUnsavedChanges(false);
  }, [assignments]);

  // Load community key status on component mount and periodically
  useEffect(() => {
    loadCommunityStatus();
    const interval = setInterval(loadCommunityStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update smart select availability when community status changes
  useEffect(() => {
    const canEnable = canEnableSmartSelection();
    setCanEnableSmartSelect(canEnable);
  }, [communityStatus]);

  // Validate assignments when they change
  useEffect(() => {
    const errors = validateRoleAssignments(currentAssignments);
    setValidationErrors(errors);
  }, [currentAssignments]);

  // Load community key status from API
  const loadCommunityStatus = async () => {
    try {
      const response = await fetch('/api/community-keys');
      if (response.ok) {
        const data = await response.json();
        setCommunityStatus(data.data || {});
      }
    } catch (error) {
      console.warn('Failed to load community key status:', error);
    }
  };

  // Handle role assignment change
  const handleRoleChange = (roleId, apiId) => {
    const newAssignments = {
      ...currentAssignments,
      [roleId]: apiId
    };
    
    setCurrentAssignments(newAssignments);
    setHasUnsavedChanges(true);
    
    // Instantly propagate changes
    if (onAssignmentsChange) {
      onAssignmentsChange(newAssignments);
    }
    
    // Fire GA4 event
    fireGA4Event('chat_role_assignment_changed', {
      role: roleId,
      api: apiId,
      previous_api: currentAssignments[roleId]
    });
  };

  // Handle smart select toggle
  const handleSmartSelectToggle = () => {
    const newValue = !smartSelectEnabled;
    if (onSmartSelectChange) {
      onSmartSelectChange(newValue);
    }
    
    fireGA4Event('smart_select_toggled', {
      enabled: newValue
    });
  };

  // Handle adding API key
  const handleAddKey = async (keyData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/community-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(keyData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh community status
        await loadCommunityStatus();
        setModalOpen(false);
        setSelectedProvider(null);
        
        fireGA4Event('community_key_added', {
          provider: keyData.provider,
          success: true
        });
      } else {
        throw new Error(result.message || 'Failed to add API key');
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      fireGA4Event('community_key_added', {
        provider: keyData.provider,
        success: false,
        error: error.message
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clicking on disabled provider
  const handleProviderClick = (providerId) => {
    const providerStatus = communityStatus.providers?.[providerId];
    if (!providerStatus?.isValid) {
      setSelectedProvider(providerId);
      setModalOpen(true);
    }
  };

  // Get provider status for display
  const getProviderStatus = (apiId) => {
    const status = communityStatus.providers?.[apiId];
    if (!status) return { available: false, hasKey: false };
    
    return {
      available: status.isValid,
      hasKey: status.hasKey,
      required: status.required
    };
  };

  // Reset to defaults
  const handleReset = () => {
    setCurrentAssignments(DEFAULT_ROLE_ASSIGNMENTS);
    setHasUnsavedChanges(true);
    
    if (onAssignmentsChange) {
      onAssignmentsChange(DEFAULT_ROLE_ASSIGNMENTS);
    }
    
    fireGA4Event('chat_settings_reset', {});
  };

  // Fire GA4 event helper
  const fireGA4Event = (eventName, parameters) => {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'chat_settings',
          event_label: 'api_assignment',
          ...parameters
        });
      } else if (typeof ga !== 'undefined') {
        ga('send', 'event', 'chat_settings', eventName, 'api_assignment');
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`chat-settings-panel ${className}`}>
      <style jsx>{`
        .chat-settings-panel {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 700px;
        }
        
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .settings-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        
        .settings-toggle {
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .settings-toggle:hover {
          background: #4b5563;
        }

        /* Smart Select Section */
        .smart-select-section {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .smart-select-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .smart-select-info h4 {
          margin: 0 0 4px 0;
          color: #0369a1;
          font-size: 16px;
        }

        .smart-select-info p {
          margin: 0;
          color: #075985;
          font-size: 13px;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #3b82f6;
        }

        input:disabled + .slider {
          background-color: #d1d5db;
          cursor: not-allowed;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .smart-select-disabled {
          margin-top: 8px;
          color: #dc2626;
          font-size: 12px;
        }

        /* Community Pool Section */
        .community-pool-section {
          margin-bottom: 20px;
        }

        .community-pool-section h4 {
          margin: 0 0 12px 0;
          color: #1f2937;
          font-size: 16px;
        }

        .provider-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .provider-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #f9fafb;
          transition: all 0.2s;
          position: relative;
        }

        .provider-card.available {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .provider-card.unavailable {
          border-color: #ef4444;
          background: #fef2f2;
          cursor: pointer;
        }

        .provider-card.unavailable:hover {
          background: #fee2e2;
        }

        .provider-card.required {
          border-width: 2px;
        }

        .provider-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .provider-name {
          font-weight: 500;
          color: #1f2937;
          font-size: 13px;
        }

        .provider-status {
          font-size: 11px;
          margin-top: 2px;
        }

        .status-available {
          color: #22c55e;
        }

        .status-missing {
          color: #ef4444;
        }

        .required-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #f59e0b;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 500;
        }

        .add-key-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .add-key-btn:hover {
          background: #2563eb;
        }

        .community-stats {
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
        }

        /* Role Assignments Section */
        .role-assignments-section h4 {
          margin: 0 0 12px 0;
          color: #1f2937;
          font-size: 16px;
        }
        
        .role-assignments {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .role-assignment {
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #f9fafb;
        }
        
        .role-info {
          margin-bottom: 8px;
        }

        .role-label {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
          margin-bottom: 2px;
        }
        
        .role-description {
          font-size: 12px;
          color: #6b7280;
        }

        .assignment-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .api-select {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          color: #374151;
        }
        
        .api-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }

        .add-key-mini-btn {
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .add-key-mini-btn:hover {
          background: #d97706;
        }

        .assignment-warning {
          margin-top: 6px;
          color: #dc2626;
          font-size: 11px;
        }
        
        .validation-errors {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 12px;
          font-size: 12px;
        }
        
        .validation-error {
          margin: 2px 0;
        }
        
        .settings-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }
        
        .reset-button {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .reset-button:hover {
          background: #dc2626;
        }
        
        .reset-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .settings-info {
          font-size: 11px;
          color: #6b7280;
          text-align: center;
          margin-top: 8px;
          line-height: 1.4;
        }
        
        @media (max-width: 768px) {
          .chat-settings-panel {
            margin: 4px 0;
            padding: 16px;
          }

          .provider-grid {
            grid-template-columns: 1fr;
          }

          .smart-select-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .assignment-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .api-select {
            width: 100%;
          }
        }
      `}</style>

      <div className="settings-header">
        <h3 className="settings-title">🤖 AI Provider Settings</h3>
        {onToggle && (
          <button className="settings-toggle" onClick={onToggle}>
            Close
          </button>
        )}
      </div>

      {/* Smart Select Section */}
      <div className="smart-select-section">
        <div className="smart-select-header">
          <div className="smart-select-info">
            <h4>⚡ Auto: Smart Select</h4>
            <p>Automatically choose the best provider based on performance and availability</p>
          </div>
          <div className="smart-select-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={smartSelectEnabled}
                onChange={handleSmartSelectToggle}
                disabled={!canEnableSmartSelect}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        {!canEnableSmartSelect && (
          <div className="smart-select-disabled">
            <span>⚠️ All required API keys must be available to enable Smart Select</span>
          </div>
        )}
      </div>

      {/* Community Pool Status */}
      <div className="community-pool-section">
        <h4>🏛️ Community API Key Pool</h4>
        <div className="provider-grid">
          {API_OPTIONS.filter(api => api.id !== 'none').map(api => {
            const status = getProviderStatus(api.id);
            return (
              <div
                key={api.id}
                className={`provider-card ${status.available ? 'available' : 'unavailable'} ${status.required ? 'required' : ''}`}
                onClick={() => !status.available && handleProviderClick(api.id)}
              >
                <div className="provider-info">
                  <span className="provider-name">{api.name}</span>
                  <span className={`provider-status ${status.available ? 'status-available' : 'status-missing'}`}>
                    {status.available ? '✅ Available' : status.hasKey ? '⚠️ Invalid' : '❌ Missing'}
                  </span>
                </div>
                {status.required && (
                  <span className="required-badge">Required</span>
                )}
                {!status.available && (
                  <button className="add-key-btn">+ Add Key</button>
                )}
              </div>
            );
          })}
        </div>
        <div className="community-stats">
          <span>
            {communityStatus.stats?.valid || 0} of {communityStatus.stats?.total || 0} providers available
            {communityStatus.stats?.canEnableSmartSelect && ' • Smart Select Ready!'}
          </span>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <div key={index} className="validation-error">⚠️ {error}</div>
          ))}
        </div>
      )}

      {/* Role Assignments Section */}
      <div className="role-assignments-section">
        <h4>🎯 Role Assignments</h4>
        <div className="role-assignments">
          {CHAT_ROLES.map(role => {
            const assignedApi = getAPIById(currentAssignments[role.id]);
            const apiStatus = assignedApi ? getProviderStatus(assignedApi.id) : null;
            
            return (
              <div key={role.id} className="role-assignment">
                <div className="role-info">
                  <div className="role-label">{role.name}</div>
                  <div className="role-description">{role.description}</div>
                </div>
                <div className="assignment-controls">
                  <select
                    className="api-select"
                    value={currentAssignments[role.id] || ''}
                    onChange={(e) => handleRoleChange(role.id, e.target.value)}
                  >
                    <option value="">Select API...</option>
                    {enabledAPIs.map(api => {
                      const providerStatus = getProviderStatus(api.id);
                      return (
                        <option
                          key={api.id}
                          value={api.id}
                          disabled={!providerStatus.available && api.id !== 'none'}
                        >
                          {api.name} {!providerStatus.available && api.id !== 'none' ? '(No Key)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {apiStatus && !apiStatus.available && assignedApi.id !== 'none' && (
                    <button
                      className="add-key-mini-btn"
                      onClick={() => handleProviderClick(assignedApi.id)}
                      title={`Add ${assignedApi.name} API key`}
                    >
                      + Key
                    </button>
                  )}
                </div>
                {apiStatus && !apiStatus.available && assignedApi.id !== 'none' && (
                  <div className="assignment-warning">
                    ⚠️ API key required for {assignedApi.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="settings-actions">
        <button
          className="reset-button"
          onClick={handleReset}
          disabled={!hasUnsavedChanges && 
            JSON.stringify(currentAssignments) === JSON.stringify(DEFAULT_ROLE_ASSIGNMENTS)}
        >
          Reset to Defaults
        </button>
      </div>

      <div className="settings-info">
        Changes are applied instantly. Community keys are shared across all users.
      </div>

      {/* API Key Modal */}
      <APIKeyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onSubmit={handleAddKey}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ChatSettingsPanel;