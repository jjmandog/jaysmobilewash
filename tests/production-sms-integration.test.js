/**
 * Production SMS Integration Test
 * Tests that the chatbot can successfully send SMS notifications
 */

import { describe, it, expect, vi } from 'vitest';
import handler from '../pages/api/send-sms.js';
import fallbackHandler from '../pages/api/sms-fallback.js';

describe('Production SMS Integration', () => {
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

  describe('Chatbot SMS Notification Flow', () => {
    it('should successfully send SMS notification with chatbot data', async () => {
      const chatbotMessage = 'New message from website chatbot:\n\n"Hello, I need a quote for car detailing"\n\nTime: 7/3/2025, 1:00:00 AM\nWebsite: jaysmobilewash.net';
      
      const req = createMockReq('POST', {
        to: '5622289429@vtext.com',
        from: 'noreply@jaysmobilewash.net',
        subject: 'New Chatbot Message',
        text: chatbotMessage
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('success', true);
      expect(res.data).toHaveProperty('message', 'SMS sent successfully');
      
      // Verify CORS headers are set
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
    });

    it('should handle fallback SMS when primary fails', async () => {
      const req = createMockReq('POST', {
        phone: '5622289429',
        message: 'New website message: "Hello, I need a quote for car detailing" - 1:00:00 AM'
      });
      const res = createMockRes();

      await fallbackHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('success', true);
      expect(res.data).toHaveProperty('message', 'SMS fallback sent successfully');
      expect(res.data).toHaveProperty('carrier', 'Verizon');
      expect(res.data).toHaveProperty('to', '5622289429@vtext.com');
      
      // Verify CORS headers are set
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });

    it('should handle long messages with truncation', async () => {
      const longMessage = 'This is a very long message that exceeds the typical character limit for SMS messages. It contains a lot of text that should be truncated properly when sent through the email-to-SMS gateway. The system should handle this gracefully and ensure the message is delivered successfully.';
      
      const req = createMockReq('POST', {
        to: '5622289429@vtext.com',
        from: 'noreply@jaysmobilewash.net',
        subject: 'New Chatbot Message',
        text: longMessage
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('success', true);
    });

    it('should validate required fields for primary SMS', async () => {
      const req = createMockReq('POST', {
        from: 'noreply@jaysmobilewash.net',
        subject: 'New Chatbot Message'
        // Missing 'to' and 'text' fields
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('error', 'Missing required fields: to, text');
    });

    it('should validate required fields for fallback SMS', async () => {
      const req = createMockReq('POST', {
        // Missing 'phone' and 'message' fields
      });
      const res = createMockRes();

      await fallbackHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('error', 'Missing required fields: phone, message');
    });
  });

  describe('CORS Preflight Support', () => {
    it('should handle OPTIONS requests for primary SMS endpoint', async () => {
      const req = createMockReq('OPTIONS');
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({});
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
    });

    it('should handle OPTIONS requests for fallback SMS endpoint', async () => {
      const req = createMockReq('OPTIONS');
      const res = createMockRes();

      await fallbackHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({});
      expect(res.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(res.headers).toHaveProperty('Access-Control-Allow-Methods', 'POST, OPTIONS');
    });
  });
});