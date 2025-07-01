/**
 * ChatBotModule Component - Main integration component for chat bot functionality
 * Integrates settings panel and passes assignments to all chat modules
 * No layout changes, only additive integration
 */

import React, { useState, useEffect } from 'react';
import ChatSettingsPanel from './ChatSettingsPanel.js';
import AIChatBox from './AIChatBox.jsx';
import { DEFAULT_ROLE_ASSIGNMENTS } from '../constants/apiOptions.js';
import { routeLLMRequest } from '../utils/chatRouter.js';

const ChatBotModule = ({ 
  className = '',
  showSettings = false,
  defaultRole = 'chat',
  onResponse,
  ...otherProps 
}) => {
  const [assignments, setAssignments] = useState(DEFAULT_ROLE_ASSIGNMENTS);
  const [settingsOpen, setSettingsOpen] = useState(showSettings);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load assignments from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chatbot-role-assignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAssignments(parsed);
      }
    } catch (error) {
      console.warn('Failed to load saved assignments:', error);
    }
  }, []);

  // Save assignments to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('chatbot-role-assignments', JSON.stringify(assignments));
    } catch (error) {
      console.warn('Failed to save assignments:', error);
    }
  }, [assignments]);

  // Handle assignment changes from settings panel
  const handleAssignmentsChange = (newAssignments) => {
    setAssignments(newAssignments);
    
    // Fire GA4 event for bulk changes
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'chat_assignments_updated', {
          event_category: 'chat_settings',
          event_label: 'bulk_update',
          assignments: Object.keys(newAssignments).length
        });
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  };

  // Enhanced AI query function that uses routing
  const handleAIQuery = async (prompt, role = defaultRole) => {
    setIsProcessing(true);
    
    try {
      const response = await routeLLMRequest(prompt, role, assignments);
      
      if (onResponse) {
        onResponse(response, role, assignments);
      }
      
      // Fire success GA4 event
      try {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'chat_query_success', {
            event_category: 'chat_interaction',
            event_label: role,
            api_used: assignments[role]
          });
        }
      } catch (error) {
        console.warn('Failed to send analytics event:', error);
      }
      
      return response;
    } catch (error) {
      // Fire error GA4 event
      try {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'chat_query_error', {
            event_category: 'chat_interaction',
            event_label: role,
            error_message: error.message
          });
        }
      } catch (analyticsError) {
        console.warn('Failed to send analytics event:', analyticsError);
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
    
    // Fire GA4 event
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'chat_settings_toggled', {
          event_category: 'chat_settings',
          event_label: settingsOpen ? 'closed' : 'opened'
        });
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  };

  return (
    <div className={`chatbot-module ${className}`}>
      <style jsx>{`
        .chatbot-module {
          position: relative;
          width: 100%;
        }
        
        .chatbot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .settings-toggle-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .settings-toggle-btn:hover {
          background: #2563eb;
        }
        
        .settings-toggle-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .chatbot-content {
          position: relative;
        }
        
        .processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 8px;
          backdrop-filter: blur(2px);
        }
        
        .processing-message {
          background: #3b82f6;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .role-indicator {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
          padding: 2px 6px;
          background: #f3f4f6;
          border-radius: 2px;
          display: inline-block;
        }
        
        .assignments-summary {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 8px;
          margin: 8px 0;
          font-size: 12px;
          color: #475569;
        }
        
        .assignment-item {
          display: inline-block;
          margin: 2px 4px;
          padding: 2px 6px;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 3px;
        }
        
        @media (max-width: 768px) {
          .chatbot-header {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }
          
          .settings-toggle-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="chatbot-header">
        <div className="role-indicator">
          Active Role: {defaultRole} → {assignments[defaultRole] || 'Not assigned'}
        </div>
        <button
          className="settings-toggle-btn"
          onClick={toggleSettings}
          disabled={isProcessing}
        >
          <span>⚙️</span>
          {settingsOpen ? 'Hide Settings' : 'API Settings'}
        </button>
      </div>

      {settingsOpen && (
        <ChatSettingsPanel
          assignments={assignments}
          onAssignmentsChange={handleAssignmentsChange}
          isOpen={settingsOpen}
          onToggle={toggleSettings}
        />
      )}

      <div className="chatbot-content">
        {isProcessing && (
          <div className="processing-overlay">
            <div className="processing-message">
              Processing with {assignments[defaultRole] || 'default'} API...
            </div>
          </div>
        )}

        {/* Enhanced AIChatBox with routing support */}
        <AIChatBox
          {...otherProps}
          disabled={isProcessing}
          // Custom query handler that uses our routing
          onQuery={handleAIQuery}
          // Pass current assignments as context
          roleAssignments={assignments}
          currentRole={defaultRole}
        />
      </div>

      {/* Show current assignments summary when settings are closed */}
      {!settingsOpen && (
        <div className="assignments-summary">
          <strong>Current API Assignments:</strong>
          {Object.entries(assignments).map(([role, api]) => (
            <span key={role} className="assignment-item">
              {role}: {api}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBotModule;