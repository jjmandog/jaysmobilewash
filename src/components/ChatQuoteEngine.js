/**
 * ChatQuoteEngine Component - Example usage of routeLLMRequest with role-specific routing
 * Demonstrates how child components can leverage the modular API assignment system
 */

import React, { useState } from 'react';
import { routeLLMRequest } from '../utils/chatRouter.js';
import { DEFAULT_ROLE_ASSIGNMENTS } from '../constants/apiOptions.js';

const ChatQuoteEngine = ({ 
  assignments = DEFAULT_ROLE_ASSIGNMENTS,
  className = '',
  onQuoteGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    serviceType: '',
    vehicleSize: '',
    condition: '',
    location: '',
    additionalServices: []
  });

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle additional services checkboxes
  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service]
    }));
  };

  // Generate quote using the quotes role
  const generateQuote = async () => {
    if (!formData.serviceType || !formData.vehicleSize) {
      setError('Please select service type and vehicle size');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build detailed prompt for quote generation
      const prompt = `Generate a detailed mobile car detailing quote for:
        - Service Type: ${formData.serviceType}
        - Vehicle Size: ${formData.vehicleSize}
        - Current Condition: ${formData.condition || 'Standard'}
        - Location: ${formData.location || 'Los Angeles/Orange County area'}
        - Additional Services: ${formData.additionalServices.join(', ') || 'None'}
        
        Please provide:
        1. Base service price
        2. Additional service costs
        3. Total estimated price
        4. Estimated time required
        5. What's included in the service
        6. Any recommendations based on vehicle condition
        
        Format as a professional quote for Jay's Mobile Wash.`;

      // Use the quotes role with current API assignments
      const response = await routeLLMRequest(prompt, 'quotes', assignments);
      
      const quoteData = {
        response: response,
        formData: formData,
        timestamp: new Date().toISOString(),
        apiUsed: assignments.quotes
      };
      
      setQuote(quoteData);
      
      if (onQuoteGenerated) {
        onQuoteGenerated(quoteData);
      }

      // Fire GA4 event for quote generation
      try {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'quote_generated', {
            event_category: 'quote_engine',
            service_type: formData.serviceType,
            vehicle_size: formData.vehicleSize,
            api_used: assignments.quotes
          });
        }
      } catch (analyticsError) {
        console.warn('Failed to send analytics event:', analyticsError);
      }

    } catch (err) {
      setError(`Failed to generate quote: ${err.message}`);
      console.error('Quote generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`chat-quote-engine ${className}`}>
      <style jsx>{`
        .chat-quote-engine {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          max-width: 600px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .quote-header {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .quote-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        
        .api-info {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }
        
        .quote-form {
          display: grid;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .form-label {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }
        
        .form-select, .form-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }
        
        .form-select:focus, .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        
        .checkbox-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          margin-top: 8px;
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox-item input {
          margin: 0;
        }
        
        .checkbox-item label {
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }
        
        .generate-button {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
        }
        
        .generate-button:hover {
          background: #2563eb;
        }
        
        .generate-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .quote-result {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 16px;
          margin-top: 20px;
        }
        
        .quote-response {
          white-space: pre-wrap;
          line-height: 1.6;
          color: #374151;
          font-size: 14px;
        }
        
        .quote-meta {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #6b7280;
          display: flex;
          justify-content: space-between;
        }
        
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          margin-top: 16px;
        }
        
        .loading-state {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }
        
        @media (max-width: 768px) {
          .chat-quote-engine {
            padding: 16px;
          }
          
          .checkbox-group {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="quote-header">
        <h3 className="quote-title">AI Quote Generator</h3>
        <div className="api-info">
          Using API: {assignments.quotes || 'Not assigned'} for quote generation
        </div>
      </div>

      <div className="quote-form">
        <div className="form-group">
          <label className="form-label">Service Type *</label>
          <select
            className="form-select"
            value={formData.serviceType}
            onChange={(e) => handleInputChange('serviceType', e.target.value)}
          >
            <option value="">Select a service...</option>
            <option value="exterior-detail">Exterior Detail</option>
            <option value="interior-detail">Interior Detail</option>
            <option value="full-detail">Full Detail</option>
            <option value="ceramic-coating">Ceramic Coating</option>
            <option value="paint-correction">Paint Correction</option>
            <option value="maintenance-wash">Maintenance Wash</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Vehicle Size *</label>
          <select
            className="form-select"
            value={formData.vehicleSize}
            onChange={(e) => handleInputChange('vehicleSize', e.target.value)}
          >
            <option value="">Select vehicle size...</option>
            <option value="compact">Compact Car</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="truck">Truck</option>
            <option value="luxury">Luxury Vehicle</option>
            <option value="exotic">Exotic/Supercar</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Vehicle Condition</label>
          <select
            className="form-select"
            value={formData.condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
          >
            <option value="">Select condition...</option>
            <option value="excellent">Excellent (Well maintained)</option>
            <option value="good">Good (Minor wear)</option>
            <option value="fair">Fair (Noticeable wear)</option>
            <option value="poor">Poor (Heavy wear/damage)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Beverly Hills, CA"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Additional Services</label>
          <div className="checkbox-group">
            {[
              'Engine Bay Cleaning',
              'Headlight Restoration',
              'Tire Shine',
              'Leather Conditioning',
              'Pet Hair Removal',
              'Odor Elimination'
            ].map(service => (
              <div key={service} className="checkbox-item">
                <input
                  type="checkbox"
                  id={service}
                  checked={formData.additionalServices.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                />
                <label htmlFor={service}>{service}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        className="generate-button"
        onClick={generateQuote}
        disabled={isGenerating || !formData.serviceType || !formData.vehicleSize}
      >
        {isGenerating ? 'Generating Quote...' : 'Generate AI Quote'}
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {quote && (
        <div className="quote-result">
          <div className="quote-response">
            {typeof quote.response === 'string' ? quote.response : 
             quote.response.choices?.[0]?.message?.content || 
             JSON.stringify(quote.response, null, 2)}
          </div>
          <div className="quote-meta">
            <span>Generated: {new Date(quote.timestamp).toLocaleString()}</span>
            <span>API: {quote.apiUsed}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatQuoteEngine;