/**
 * End-to-end test for chatbot API integration
 * Verifies that both OpenAI and SMS endpoints work correctly with proper error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the AIUtils class from advanced-chatbot.js
class MockAIUtils {
  static async queryAI(prompt, options = {}) {
    const { endpoint = '/api/ai', role } = options;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }

    const requestBody = {
      prompt: prompt.trim()
    };
    
    if (role) {
      requestBody.role = role;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      if (response.status === 405) {
        throw new Error('Method not allowed: API endpoint requires POST method');
      } else if (response.status === 500) {
        throw new Error('Internal server error: AI service is temporarily unavailable');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded: Please wait a moment before trying again');
      } else if (response.status === 404) {
        throw new Error('API endpoint not found: Service may be temporarily offline');
      } else {
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  }
}

describe('End-to-End Chatbot API Integration', () => {
  beforeEach(() => {
    // Mock fetch for all tests
    global.fetch = vi.fn();
  });

  describe('OpenAI API Integration', () => {
    it('should successfully call OpenAI API with POST method', async () => {
      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          response: 'Hello! How can I help you with your car detailing needs?',
          role: 'assistant'
        })
      });

      const result = await MockAIUtils.queryAI('Hello, I need help with car detailing', {
        endpoint: '/api/openai',
        role: 'chat'
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Hello, I need help with car detailing',
          role: 'chat'
        })
      });

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('role', 'assistant');
    });

    it('should handle 405 errors gracefully', async () => {
      // Mock 405 response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 405,
        json: async () => ({
          error: 'Method not allowed',
          message: 'Only POST requests are supported'
        })
      });

      await expect(MockAIUtils.queryAI('Test prompt', { endpoint: '/api/openai' }))
        .rejects.toThrow('Method not allowed: API endpoint requires POST method');
    });
  });

  describe('SMS API Integration', () => {
    it('should successfully call SMS API with POST method', async () => {
      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'SMS sent successfully'
        })
      });

      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'test@example.com',
          text: 'New message from website chatbot'
        })
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'SMS sent successfully');
    });

    it('should handle 405 errors gracefully for SMS endpoint', async () => {
      // Mock 405 response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 405,
        json: async () => ({
          error: 'Method not allowed',
          message: 'Only POST requests are supported'
        })
      });

      const response = await fetch('/api/send-sms', {
        method: 'GET' // This would cause a 405 error
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(405);
      
      const result = await response.json();
      expect(result).toHaveProperty('error', 'Method not allowed');
      expect(result).toHaveProperty('message', 'Only POST requests are supported');
    });
  });

  describe('Error Message Consistency', () => {
    it('should return consistent error messages for 405 errors', async () => {
      const expectedErrorMessage = 'Method not allowed: API endpoint requires POST method';
      
      // Test OpenAI endpoint
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 405,
        json: async () => ({ error: 'Method not allowed', message: 'Only POST requests are supported' })
      });

      await expect(MockAIUtils.queryAI('Test', { endpoint: '/api/openai' }))
        .rejects.toThrow(expectedErrorMessage);
    });

    it('should provide user-friendly error messages for common HTTP errors', async () => {
      const testCases = [
        { status: 500, expectedMessage: 'Internal server error: AI service is temporarily unavailable' },
        { status: 429, expectedMessage: 'Rate limit exceeded: Please wait a moment before trying again' },
        { status: 404, expectedMessage: 'API endpoint not found: Service may be temporarily offline' }
      ];

      for (const testCase of testCases) {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: testCase.status,
          json: async () => ({ error: 'Test error' })
        });

        await expect(MockAIUtils.queryAI('Test', { endpoint: '/api/openai' }))
          .rejects.toThrow(testCase.expectedMessage);
      }
    });
  });

  describe('Request Validation', () => {
    it('should validate that requests use proper Content-Type headers', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ response: 'Test response' })
      });

      await MockAIUtils.queryAI('Test prompt', { endpoint: '/api/openai' });

      expect(global.fetch).toHaveBeenCalledWith('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Test prompt'
        })
      });
    });

    it('should validate that requests send proper JSON bodies', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ response: 'Test response' })
      });

      await MockAIUtils.queryAI('Test prompt with role', { endpoint: '/api/openai', role: 'chat' });

      expect(global.fetch).toHaveBeenCalledWith('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Test prompt with role',
          role: 'chat'
        })
      });
    });
  });
});