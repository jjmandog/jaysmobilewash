/**
 * Comprehensive Test Suite for /api/send-sms Serverless Endpoint
 * Tests POST requests, OPTIONS preflight, error handling, user-agent blocking, and SMS functionality
 * Production-grade testing with full edge case coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock nodemailer properly
vi.mock('nodemailer', () => ({
  default: {
    createTransporter: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
    }))
  }
}));

// Import handler after mocking
import handler from '../api/send-sms.js';
import nodemailer from 'nodemailer';

describe('/api/send-sms Serverless Endpoint', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset environment variables
    process.env.GMAIL_USER = 'test@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'test-app-password';
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup nodemailer mock
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' });
    const mockCreateTransporter = vi.fn(() => ({ sendMail: mockSendMail }));
    vi.mocked(nodemailer.createTransporter).mockImplementation(mockCreateTransporter);
    
    // Mock request object
    mockReq = {
      method: 'POST',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'origin': 'https://jaysmobilewash.net'
      },
      body: {
        name: 'John Doe',
        phone: '555-123-4567',
        service: 'Premium Detail',
        date: '2025-01-15',
        time: '10:00 AM',
        notes: 'Please call before arriving'
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

  describe('HTTP Method Validation', () => {
    it('should reject GET requests with enhanced 405 Method Not Allowed', async () => {
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

    it('should reject PUT requests with enhanced 405 Method Not Allowed', async () => {
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

    it('should reject DELETE requests with enhanced 405 Method Not Allowed', async () => {
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

    it('should accept OPTIONS requests for CORS preflight', async () => {
      mockReq.method = 'OPTIONS';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should accept POST requests', async () => {
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(405);
    });
  });

  describe('CORS Headers', () => {
    it('should set proper CORS headers', async () => {
      await handler(mockReq, mockRes);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    });
  });

  describe('User-Agent Blocking', () => {
    const blockedUserAgents = [
      'bot',
      'crawler', 
      'spider',
      'curl',
      'wget',
      'python',
      'scrapy',
      'postman'
    ];

    blockedUserAgents.forEach(agent => {
      it(`should block user-agent containing "${agent}"`, async () => {
        mockReq.headers['user-agent'] = `Mozilla/5.0 ${agent} test`;
        
        await handler(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied' });
      });

      it(`should block user-agent with uppercase "${agent.toUpperCase()}"`, async () => {
        mockReq.headers['user-agent'] = `Mozilla/5.0 ${agent.toUpperCase()} test`;
        
        await handler(mockReq, mockRes);
        
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied' });
      });
    });

    it('should allow legitimate browser user-agents', async () => {
      const legitimateUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      ];

      for (const userAgent of legitimateUserAgents) {
        mockReq.headers['user-agent'] = userAgent;
        
        await handler(mockReq, mockRes);
        
        expect(mockRes.status).not.toHaveBeenCalledWith(403);
      }
    });

    it('should handle missing user-agent header', async () => {
      delete mockReq.headers['user-agent'];
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(403);
    });
  });

  describe('Environment Variables Validation', () => {
    it('should return 500 error when GMAIL_USER is missing', async () => {
      delete process.env.GMAIL_USER;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
    });

    it('should return 500 error when GMAIL_APP_PASSWORD is missing', async () => {
      delete process.env.GMAIL_APP_PASSWORD;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
    });

    it('should return 500 error when both Gmail credentials are missing', async () => {
      delete process.env.GMAIL_USER;
      delete process.env.GMAIL_APP_PASSWORD;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
    });
  });

  describe('Request Body Validation', () => {
    it('should return 400 error for missing name', async () => {
      delete mockReq.body.name;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Name is required']
      });
    });

    it('should return 400 error for missing phone', async () => {
      delete mockReq.body.phone;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Phone number is required']
      });
    });

    it('should return 400 error for missing service', async () => {
      delete mockReq.body.service;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Service is required']
      });
    });

    it('should return 400 error for missing date', async () => {
      delete mockReq.body.date;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Date is required']
      });
    });

    it('should return 400 error for missing time', async () => {
      delete mockReq.body.time;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Time is required']
      });
    });

    it('should return 400 error for multiple missing fields', async () => {
      delete mockReq.body.name;
      delete mockReq.body.phone;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Name is required', 'Phone number is required']
      });
    });

    it('should return 400 error for empty string values', async () => {
      mockReq.body.name = '';
      mockReq.body.phone = '   ';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Name is required', 'Phone number is required']
      });
    });
  });

  describe('SMS Message Formatting', () => {
    it('should successfully send SMS with valid data', async () => {
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'SMS notification sent successfully',
        messageLength: expect.any(Number)
      });
    });

    it('should handle booking data without notes', async () => {
      delete mockReq.body.notes;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'SMS notification sent successfully',
        messageLength: expect.any(Number)
      });
    });

    it('should limit message length to 160 characters', async () => {
      // Create a long message by adding very long notes
      mockReq.body.notes = 'This is a very long note that should cause the SMS message to exceed 160 characters and thus should be truncated with ellipsis to fit within the standard SMS length limit.';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      // The response should include messageLength
      const call = mockRes.json.mock.calls.find(call => call[0].messageLength);
      expect(call[0].messageLength).toBeLessThanOrEqual(160);
    });
  });

  describe('Error Handling', () => {
    it('should handle email authentication errors', async () => {
      // Mock nodemailer to throw authentication error
      const mockSendMail = vi.fn().mockRejectedValue({ code: 'EAUTH', message: 'Authentication failed' });
      vi.mocked(nodemailer.createTransporter).mockReturnValue({ sendMail: mockSendMail });
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email authentication failed' });
    });

    it('should handle email connection errors', async () => {
      // Mock nodemailer to throw connection error
      const mockSendMail = vi.fn().mockRejectedValue({ code: 'ECONNECTION', message: 'Connection failed' });
      vi.mocked(nodemailer.createTransporter).mockReturnValue({ sendMail: mockSendMail });
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email service connection failed' });
    });

    it('should handle general errors', async () => {
      // Mock nodemailer to throw general error
      const mockSendMail = vi.fn().mockRejectedValue(new Error('General error'));
      vi.mocked(nodemailer.createTransporter).mockReturnValue({ sendMail: mockSendMail });
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});