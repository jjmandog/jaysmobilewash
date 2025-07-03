/**
 * API Key Input Modal
 * Modal component for adding community API keys
 */

import React, { useState } from 'react';

const APIKeyModal = ({ 
  isOpen, 
  onClose, 
  provider, 
  onSubmit,
  isSubmitting = false 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [contributor, setContributor] = useState('');
  const [error, setError] = useState('');

  // Provider configurations for UI guidance
  const providerConfigs = {
    openai: {
      name: 'OpenAI',
      placeholder: 'sk-...',
      helpText: 'Get your API key from platform.openai.com/api-keys',
      pattern: 'sk-[a-zA-Z0-9]{48,}'
    },
    anthropic: {
      name: 'Anthropic Claude',
      placeholder: 'sk-ant-api03-...',
      helpText: 'Get your API key from console.anthropic.com',
      pattern: 'sk-ant-api03-[a-zA-Z0-9_-]{95,}'
    },
    google: {
      name: 'Google Gemini',
      placeholder: 'Your-API-Key-Here',
      helpText: 'Get your API key from aistudio.google.com/app/apikey',
      pattern: '[a-zA-Z0-9_-]{39}'
    },
    cohere: {
      name: 'Cohere',
      placeholder: 'Your-API-Key-Here',
      helpText: 'Get your API key from dashboard.cohere.ai/api-keys',
      pattern: '[a-zA-Z0-9_-]{40,}'
    },
    replicate: {
      name: 'Replicate',
      placeholder: 'r8_...',
      helpText: 'Get your API key from replicate.com/account/api-tokens',
      pattern: 'r8_[a-zA-Z0-9]{40}'
    },
    perplexity: {
      name: 'Perplexity',
      placeholder: 'pplx-...',
      helpText: 'Get your API key from perplexity.ai/settings/api',
      pattern: 'pplx-[a-zA-Z0-9_-]{40,}'
    },
    mistral: {
      name: 'Mistral AI',
      placeholder: 'Your-API-Key-Here',
      helpText: 'Get your API key from console.mistral.ai',
      pattern: '[a-zA-Z0-9_-]{32,}'
    },
    together: {
      name: 'Together AI',
      placeholder: 'Your-API-Key-Here',
      helpText: 'Get your API key from api.together.xyz/settings/api-keys',
      pattern: '[a-zA-Z0-9_-]{40,}'
    },
    deepseek: {
      name: 'DeepSeek',
      placeholder: 'sk-... or hf_...',
      helpText: 'Get your API key from platform.deepseek.com/api_keys or use a Hugging Face API key',
      pattern: '(sk-[a-zA-Z0-9_-]{40,}|hf_[a-zA-Z0-9_-]{30,})'
    }
  };

  const config = providerConfigs[provider] || {
    name: provider,
    placeholder: 'Your-API-Key-Here',
    helpText: 'Enter your API key for this provider',
    pattern: '.+'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    // Basic pattern validation
    const regex = new RegExp(config.pattern);
    if (!regex.test(apiKey.trim())) {
      setError(`Invalid API key format for ${config.name}`);
      return;
    }

    try {
      await onSubmit({
        provider,
        apiKey: apiKey.trim(),
        contributor: contributor.trim() || 'anonymous'
      });
      
      // Reset form on success
      setApiKey('');
      setContributor('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to add API key');
    }
  };

  const handleClose = () => {
    setApiKey('');
    setContributor('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="api-key-modal-overlay" onClick={handleClose}>
      <div className="api-key-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add {config.name} API Key</h3>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Help the community by contributing your {config.name} API key. 
            This key will be shared with all users to enable {config.name} functionality.
          </p>

          <div className="key-info">
            <strong>📋 How to get your API key:</strong>
            <p>{config.helpText}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="apiKey">API Key *</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={config.placeholder}
                className="api-key-input"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contributor">Contributor Name (Optional)</label>
              <input
                id="contributor"
                type="text"
                value={contributor}
                onChange={(e) => setContributor(e.target.value)}
                placeholder="Your name or handle"
                className="contributor-input"
                disabled={isSubmitting}
                maxLength="50"
              />
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || !apiKey.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Key'}
              </button>
            </div>
          </form>

          <div className="security-notice">
            <div className="security-header">🔒 Security & Privacy</div>
            <ul>
              <li>API keys are stored securely and redacted from logs</li>
              <li>Keys are validated before being added to the community pool</li>
              <li>You can remove your contribution at any time</li>
              <li>All API usage is tracked for transparency</li>
            </ul>
          </div>
        </div>

        <style jsx>{`
          .api-key-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .api-key-modal {
            background: white;
            border-radius: 8px;
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 20px 10px;
            border-bottom: 1px solid #e5e7eb;
          }

          .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 24px;
            color: #6b7280;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
          }

          .close-button:hover {
            background: #f3f4f6;
            color: #374151;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-description {
            color: #6b7280;
            margin-bottom: 16px;
            line-height: 1.5;
          }

          .key-info {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
          }

          .key-info strong {
            color: #0369a1;
            display: block;
            margin-bottom: 4px;
          }

          .key-info p {
            margin: 0;
            color: #075985;
            font-size: 14px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: #374151;
            font-size: 14px;
          }

          .api-key-input,
          .contributor-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            font-family: 'Courier New', monospace;
            background: white;
            box-sizing: border-box;
          }

          .contributor-input {
            font-family: inherit;
          }

          .api-key-input:focus,
          .contributor-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }

          .api-key-input:disabled,
          .contributor-input:disabled {
            background: #f9fafb;
            color: #6b7280;
          }

          .error-message {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 10px 12px;
            border-radius: 6px;
            margin-bottom: 16px;
            font-size: 14px;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-bottom: 20px;
          }

          .cancel-button,
          .submit-button {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid transparent;
            transition: all 0.2s;
          }

          .cancel-button {
            background: #f9fafb;
            color: #374151;
            border-color: #d1d5db;
          }

          .cancel-button:hover:not(:disabled) {
            background: #f3f4f6;
          }

          .submit-button {
            background: #3b82f6;
            color: white;
          }

          .submit-button:hover:not(:disabled) {
            background: #2563eb;
          }

          .submit-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }

          .security-notice {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
          }

          .security-header {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
          }

          .security-notice ul {
            margin: 0;
            padding-left: 20px;
            color: #6b7280;
            font-size: 13px;
          }

          .security-notice li {
            margin-bottom: 4px;
            line-height: 1.4;
          }

          @media (max-width: 480px) {
            .api-key-modal {
              margin: 10px;
              max-height: calc(100vh - 20px);
            }

            .modal-header,
            .modal-body {
              padding: 16px;
            }

            .modal-actions {
              flex-direction: column;
            }

            .cancel-button,
            .submit-button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default APIKeyModal;