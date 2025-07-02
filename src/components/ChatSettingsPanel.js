/**
 * ChatSettingsPanel Component - User-configurable API assignment panel
 * Provides dropdowns for each role allowing live assignment of APIs
 * Changes propagate instantly via props and fire GA4 events
 */

import React, { useState, useEffect } from 'react';
import { 
  API_OPTIONS, 
  CHAT_ROLES, 
  DEFAULT_ROLE_ASSIGNMENTS,
  getEnabledAPIs,
  validateRoleAssignments 
} from '../constants/apiOptions.js';
import { logWarning, MODULE_CONTEXTS } from '../utils/errorHandler.js';

const ChatSettingsPanel = ({ 
  assignments = DEFAULT_ROLE_ASSIGNMENTS,
  onAssignmentsChange,
  className = '',
  isOpen = false,
  onToggle
}) => {
  const [currentAssignments, setCurrentAssignments] = useState(assignments);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get enabled APIs for dropdowns
  const enabledAPIs = getEnabledAPIs();

  // Update internal state when props change
  useEffect(() => {
    setCurrentAssignments(assignments);
    setHasUnsavedChanges(false);
  }, [assignments]);

  // Validate assignments when they change
  useEffect(() => {
    const errors = validateRoleAssignments(currentAssignments);
    setValidationErrors(errors);
  }, [currentAssignments]);

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
      logWarning(MODULE_CONTEXTS.ANALYTICS, 'Failed to send analytics event', error);
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
          padding: 16px;
          margin: 8px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
        }
        
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .settings-title {
          font-size: 18px;
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
        
        .role-assignments {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .role-assignment {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border: 1px solid #f3f4f6;
          border-radius: 4px;
          background: #f9fafb;
        }
        
        .role-label {
          min-width: 120px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }
        
        .role-description {
          flex: 1;
          font-size: 12px;
          color: #6b7280;
        }
        
        .api-select {
          min-width: 140px;
          padding: 4px 8px;
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
          padding: 6px 12px;
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
        }
        
        @media (max-width: 768px) {
          .chat-settings-panel {
            margin: 4px 0;
            padding: 12px;
          }
          
          .role-assignment {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          
          .role-label {
            min-width: auto;
          }
          
          .api-select {
            width: 100%;
          }
        }
      `}</style>

      <div className="settings-header">
        <h3 className="settings-title">API Assignment Settings</h3>
        {onToggle && (
          <button className="settings-toggle" onClick={onToggle}>
            Close
          </button>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <div key={index} className="validation-error">⚠️ {error}</div>
          ))}
        </div>
      )}

      <div className="role-assignments">
        {CHAT_ROLES.map(role => (
          <div key={role.id} className="role-assignment">
            <div className="role-label">{role.name}</div>
            <div className="role-description">{role.description}</div>
            <select
              className="api-select"
              value={currentAssignments[role.id] || ''}
              onChange={(e) => handleRoleChange(role.id, e.target.value)}
            >
              <option value="">Select API...</option>
              {enabledAPIs.map(api => (
                <option key={api.id} value={api.id}>
                  {api.name}
                </option>
              ))}
            </select>
          </div>
        ))}
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
        Changes are applied instantly. Settings are saved automatically.
      </div>
    </div>
  );
};

export default ChatSettingsPanel;