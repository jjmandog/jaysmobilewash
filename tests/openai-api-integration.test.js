/**
 * Integration test for the OpenAI API endpoint
 * Tests the actual serverless function implementation
 */

import { describe, it, expect } from 'vitest';

// Import the handler function
import handler from '../api/openai.js';

describe('OpenAI API Endpoint - Integration Tests', () => {
  // Mock request and response objects
  function createMockReq(method = 'POST', body = {}) {
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

  it('should handle valid POST request with prompt and role', async () => {
    const req = createMockReq('POST', {
      prompt: 'Hello, I need help with car detailing',
      role: 'chat'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toHaveProperty('response');
    expect(res.data).toHaveProperty('role', 'assistant');
    expect(typeof res.data.response).toBe('string');
    expect(res.data.response.length).toBeGreaterThan(0);
  });

  it('should handle valid POST request with prompt only (default role)', async () => {
    const req = createMockReq('POST', {
      prompt: 'What services do you offer?'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toHaveProperty('response');
    expect(res.data).toHaveProperty('role', 'assistant');
  });

  it('should return appropriate response for different roles', async () => {
    const testCases = [
      { role: 'quotes', prompt: 'How much for a full detail?' },
      { role: 'reasoning', prompt: 'Why should I choose ceramic coating?' },
      { role: 'chat', prompt: 'Hello there!' }
    ];

    for (const testCase of testCases) {
      const req = createMockReq('POST', testCase);
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('response');
      expect(res.data).toHaveProperty('role', 'assistant');
      expect(typeof res.data.response).toBe('string');
    }
  });

  it('should return 405 for non-POST methods', async () => {
    const req = createMockReq('GET');
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res.data).toHaveProperty('error', 'Method not allowed');
  });

  it('should return 200 for OPTIONS (CORS preflight)', async () => {
    const req = createMockReq('OPTIONS');
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
  });

  it('should return 400 for missing prompt', async () => {
    const req = createMockReq('POST', {
      role: 'chat'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data).toHaveProperty('error', 'Bad Request');
    expect(res.data.message).toContain('prompt');
  });

  it('should return 400 for empty prompt', async () => {
    const req = createMockReq('POST', {
      prompt: '   ',
      role: 'chat'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data).toHaveProperty('error', 'Bad Request');
  });

  it('should return 400 for prompt that is too long', async () => {
    const req = createMockReq('POST', {
      prompt: 'a'.repeat(10001),
      role: 'chat'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data).toHaveProperty('error', 'Bad Request');
    expect(res.data.message).toContain('too long');
  });

  it('should set CORS headers', async () => {
    const req = createMockReq('POST', {
      prompt: 'Test prompt',
      role: 'chat'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    expect(res.headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization');
  });
});