/**
 * Integration test for the SMS endpoint
 * Tests the actual serverless function implementation
 */

import { describe, it, expect } from 'vitest';

// Import the handler function
import handler from '../api/send-sms.js';

describe('SMS API Endpoint - Integration Tests', () => {
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

  it('should handle valid POST request with required fields', async () => {
    const req = createMockReq('POST', {
      to: 'test@example.com',
      text: 'Test SMS message'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toHaveProperty('success', true);
    expect(res.data).toHaveProperty('message', 'SMS sent successfully');
  });

  it('should handle POST request with all fields', async () => {
    const req = createMockReq('POST', {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test Subject',
      text: 'Test SMS message with all fields'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toHaveProperty('success', true);
  });

  it('should return 405 for GET requests', async () => {
    const req = createMockReq('GET');
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res.data).toHaveProperty('error', 'Method not allowed');
  });

  it('should return 405 for PUT requests', async () => {
    const req = createMockReq('PUT', {
      to: 'test@example.com',
      text: 'Test message'
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res.data).toHaveProperty('error', 'Method not allowed');
  });

  it('should return 405 for DELETE requests', async () => {
    const req = createMockReq('DELETE');
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res.data).toHaveProperty('error', 'Method not allowed');
  });

  it('should return 400 for missing required fields', async () => {
    const req = createMockReq('POST', {
      from: 'sender@example.com'
      // Missing 'to' and 'text' fields
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data).toHaveProperty('error', 'Missing required fields: to, text');
  });

  it('should return 400 for missing text field', async () => {
    const req = createMockReq('POST', {
      to: 'test@example.com'
      // Missing 'text' field
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data).toHaveProperty('error', 'Missing required fields: to, text');
  });

  it('should return 400 for missing to field', async () => {
    const req = createMockReq('POST', {
      text: 'Test message'
      // Missing 'to' field
    });
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data).toHaveProperty('error', 'Missing required fields: to, text');
  });

  it('should return 400 for empty request body', async () => {
    const req = createMockReq('POST', {});
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data).toHaveProperty('error', 'Missing required fields: to, text');
  });

  it('should return 400 for null request body', async () => {
    const req = createMockReq('POST', null);
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.data).toHaveProperty('error', 'Missing required fields: to, text');
  });
});