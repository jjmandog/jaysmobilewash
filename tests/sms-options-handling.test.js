/**
 * Test that verifies OPTIONS requests are handled correctly for SMS API
 * This test would have failed before our fix because SMS API didn't handle OPTIONS
 */

import { describe, it, expect } from 'vitest';
import smsHandler from '../api/send-sms.js';

describe('SMS API OPTIONS Request Handling', () => {
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

  it('should handle OPTIONS requests correctly (previously would have returned 405)', async () => {
    const req = createMockReq('OPTIONS');
    const res = createMockRes();

    await smsHandler(req, res);

    // Should return 200 for OPTIONS (CORS preflight), not 405
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual({});
    
    // Should have proper CORS headers
    expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
    expect(res.headers).toHaveProperty('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  });
});