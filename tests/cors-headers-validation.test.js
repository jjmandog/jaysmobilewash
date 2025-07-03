/**
 * Test CORS headers validation for API endpoints
 * Ensures proper CORS headers are set for all responses including OPTIONS and errors
 */

import { describe, it, expect } from 'vitest';

// Import the handlers
import openaiHandler from '../api/openai.js';
import smsHandler from '../api/send-sms.js';

describe('CORS Headers Validation', () => {
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

  describe('OpenAI API CORS Headers', () => {
    it('should set CORS headers for OPTIONS requests', async () => {
      const req = createMockReq('OPTIONS');
      const res = createMockRes();

      await openaiHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      expect(res.headers).toHaveProperty('Access-Control-Max-Age', '86400');
    });

    it('should set CORS headers for 405 error responses', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();

      await openaiHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      expect(res.headers).toHaveProperty('Access-Control-Max-Age', '86400');
    });

    it('should set CORS headers for successful POST requests', async () => {
      const req = createMockReq('POST', { prompt: 'Hello' });
      const res = createMockRes();

      await openaiHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      expect(res.headers).toHaveProperty('Access-Control-Max-Age', '86400');
    });
  });

  describe('SMS API CORS Headers', () => {
    it('should set CORS headers for OPTIONS requests', async () => {
      const req = createMockReq('OPTIONS');
      const res = createMockRes();

      await smsHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      expect(res.headers).toHaveProperty('Access-Control-Max-Age', '86400');
    });

    it('should set CORS headers for 405 error responses', async () => {
      const req = createMockReq('GET');
      const res = createMockRes();

      await smsHandler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      expect(res.headers).toHaveProperty('Access-Control-Max-Age', '86400');
    });

    it('should set CORS headers for successful POST requests', async () => {
      const req = createMockReq('POST', { to: 'test@example.com', text: 'Hello' });
      const res = createMockRes();

      await smsHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      expect(res.headers).toHaveProperty('Access-Control-Max-Age', '86400');
    });
  });
});