/**
 * Test Suite for /api/send-sms Serverless Endpoint - HTTP Method Validation
 * Tests enhanced 405 error handling and core validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock nodemailer to avoid complex mocking issues
vi.mock('nodemailer', () => ({
  default: {
    createTransporter: () => ({
      sendMail: () => Promise.resolve({ messageId: 'test-id' })
    })
  }
}));

import handler from '../api/send-sms.js';

describe('/api/send-sms Enhanced 405 Error Handling', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Mock request object
    mockReq = {
      method: 'POST',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: {
        name: 'John Doe',
        phone: '555-123-4567',
        service: 'Premium Detail',
        date: '2025-01-15',
        time: '10:00 AM'
      }
    };

    // Mock response object
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis()
    };
  });

  describe('Enhanced HTTP Method Validation', () => {
    it('should reject GET requests with detailed 405 Method Not Allowed', async () => {
      mockReq.method = 'GET';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed',
        message: 'GET requests are not supported. This endpoint only accepts POST requests.',
        supportedMethods: ['POST', 'OPTIONS'],
        endpoint: '/api/send-sms'
      });
    });

    it('should reject PUT requests with detailed 405 Method Not Allowed', async () => {
      mockReq.method = 'PUT';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed',
        message: 'PUT requests are not supported. This endpoint only accepts POST requests.',
        supportedMethods: ['POST', 'OPTIONS'],
        endpoint: '/api/send-sms'
      });
    });

    it('should reject DELETE requests with detailed 405 Method Not Allowed', async () => {
      mockReq.method = 'DELETE';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed',
        message: 'DELETE requests are not supported. This endpoint only accepts POST requests.',
        supportedMethods: ['POST', 'OPTIONS'],
        endpoint: '/api/send-sms'
      });
    });

    it('should reject PATCH requests with detailed 405 Method Not Allowed', async () => {
      mockReq.method = 'PATCH';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed',
        message: 'PATCH requests are not supported. This endpoint only accepts POST requests.',
        supportedMethods: ['POST', 'OPTIONS'],
        endpoint: '/api/send-sms'
      });
    });

    it('should accept OPTIONS requests for CORS preflight', async () => {
      mockReq.method = 'OPTIONS';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should set proper CORS headers', async () => {
      await handler(mockReq, mockRes);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    });
  });

  describe('User-Agent Blocking', () => {
    ['bot', 'crawler', 'spider', 'curl', 'wget', 'python', 'scrapy', 'postman'].forEach(agent => {
      it(`should block user-agent containing "${agent}"`, async () => {
        mockReq.headers['user-agent'] = `Mozilla/5.0 ${agent} test`;
        
        await handler(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied' });
      });
    });
  });

  describe('Environment Variables Validation', () => {
    it('should return 500 error when Gmail credentials are missing', async () => {
      const originalGmailUser = process.env.GMAIL_USER;
      delete process.env.GMAIL_USER;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
      
      // Restore
      process.env.GMAIL_USER = originalGmailUser;
    });
  });

  describe('Request Body Validation', () => {
    it('should return 400 error for missing required fields', async () => {
      // Set environment variables for this test
      process.env.GMAIL_USER = 'test@gmail.com';
      process.env.GMAIL_APP_PASSWORD = 'test-password';
      
      delete mockReq.body.name;
      delete mockReq.body.phone;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Name is required', 'Phone number is required']
      });
    });
  });
});