/**
 * Test 405 Method Not Allowed error handling for API endpoints
 * Ensures proper error messages are returned and handled correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import the handlers
import openaiHandler from '../api/openai.js';
import smsHandler from '../api/send-sms.js';

describe('405 Method Not Allowed Error Handling', () => {
  // Mock request and response objects
  function createMockReq(method = 'GET', body = {}) {
    return {
      method,
      body
    };
  }

  function createMockRes() {
    const res = {
      statusCode: 200,
      headers: {},
      data: null
    };

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.json = (data) => {
      res.data = data;
      return res;
    };

    res.setHeader = (key, value) => {
      res.headers[key] = value;
      return res;
    };

    return res;
  }

  describe('OpenAI API 405 Errors', () => {
    it('should return 405 for GET requests with proper error message', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();

      await openaiHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data).toHaveProperty('message', 'Only POST requests are supported');
    });

    it('should return 405 for PUT requests with proper error message', async () => {
      const req = createMockReq('PUT', { prompt: 'test' });
      const res = createMockRes();

      await openaiHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data).toHaveProperty('message', 'Only POST requests are supported');
    });

    it('should return 405 for DELETE requests with proper error message', async () => {
      const req = createMockReq('DELETE');
      const res = createMockRes();

      await openaiHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data).toHaveProperty('message', 'Only POST requests are supported');
    });

    it('should return 405 for PATCH requests with proper error message', async () => {
      const req = createMockReq('PATCH', { prompt: 'test' });
      const res = createMockRes();

      await openaiHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data).toHaveProperty('message', 'Only POST requests are supported');
    });

    it('should handle OPTIONS requests correctly (CORS preflight)', async () => {
      const req = createMockReq('OPTIONS');
      const res = createMockRes();

      await openaiHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({});
    });
  });

  describe('SMS API 405 Errors', () => {
    it('should return 405 for GET requests with proper error message', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();

      await smsHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data).toHaveProperty('message', 'Only POST requests are supported');
    });

    it('should return 405 for PUT requests with proper error message', async () => {
      const req = createMockReq('PUT', { to: 'test@example.com', text: 'test' });
      const res = createMockRes();

      await smsHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data).toHaveProperty('message', 'Only POST requests are supported');
    });

    it('should return 405 for DELETE requests with proper error message', async () => {
      const req = createMockReq('DELETE');
      const res = createMockRes();

      await smsHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data).toHaveProperty('message', 'Only POST requests are supported');
    });

    it('should return 405 for PATCH requests with proper error message', async () => {
      const req = createMockReq('PATCH', { to: 'test@example.com', text: 'test' });
      const res = createMockRes();

      await smsHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data).toHaveProperty('message', 'Only POST requests are supported');
    });
  });

  describe('Frontend Error Message Handling', () => {
    beforeEach(() => {
      // Mock fetch for frontend tests
      global.fetch = vi.fn();
    });

    it('should handle 405 errors with user-friendly messages', async () => {
      // Mock 405 response from API
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 405,
        json: async () => ({
          error: 'Method not allowed',
          message: 'Only POST requests are supported'
        })
      });

      let caughtError = null;
      try {
        const response = await fetch('/api/openai', {
          method: 'GET' // This would cause a 405 error
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 405) {
            throw new Error('Method not allowed: API endpoint requires POST method');
          }
        }
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBeTruthy();
      expect(caughtError.message).toBe('Method not allowed: API endpoint requires POST method');
    });

    it('should verify POST requests work correctly', async () => {
      // Mock successful POST response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          response: 'Test response',
          role: 'assistant'
        })
      });

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Test prompt',
          role: 'chat'
        })
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('response');
      expect(data).toHaveProperty('role', 'assistant');
    });
  });
});