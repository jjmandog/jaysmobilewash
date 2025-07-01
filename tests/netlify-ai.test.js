/**
 * Comprehensive Test Suite for Netlify /netlify/functions/ai.js Serverless Function
 * Tests POST requests, error handling, user-agent blocking, and Hugging Face API integration
 * Ensures identical functionality to the Vercel /api/ai.js endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import the Netlify function handler
const { handler } = await import('../netlify/functions/ai.js');

describe('Netlify /netlify/functions/ai Serverless Function', () => {
  let mockEvent, mockContext;

  beforeEach(() => {
    // Reset environment variables
    process.env.HF_API_KEY = 'test-hf-api-key-mock';
    
    // Mock Netlify event object
    mockEvent = {
      httpMethod: 'POST',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Tell me about your car detailing services'
      })
    };

    // Mock Netlify context object
    mockContext = {};
  });

  describe('HTTP Method Validation', () => {
    it('should accept POST requests', async () => {
      // Mock successful Hugging Face response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([{ generated_text: 'I can help you with car detailing services.' }])
      });

      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(200);
      expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('should reject GET requests with 405 Method Not Allowed', async () => {
      mockEvent.httpMethod = 'GET';
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(405);
      expect(JSON.parse(result.body)).toEqual({ error: 'Method not allowed' });
      expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('should reject PUT requests with 405 Method Not Allowed', async () => {
      mockEvent.httpMethod = 'PUT';
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(405);
      expect(JSON.parse(result.body)).toEqual({ error: 'Method not allowed' });
    });

    it('should include CORS headers in 405 responses', async () => {
      mockEvent.httpMethod = 'GET';
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Access-Control-Allow-Methods']).toBe('POST');
    });
  });

  describe('User-Agent Blocking', () => {
    const botUserAgents = [
      'Googlebot/2.1',
      'Mozilla/5.0 (compatible; bingbot/2.0)',
      'crawler-test',
      'spider-bot',
      'curl/7.68.0',
      'Wget/1.20.3',
      'python-requests/2.25.1',
      'Scrapy/2.5.0'
    ];

    botUserAgents.forEach(userAgent => {
      it(`should block ${userAgent}`, async () => {
        mockEvent.headers['user-agent'] = userAgent;
        
        const result = await handler(mockEvent, mockContext);
        
        expect(result.statusCode).toBe(403);
        expect(JSON.parse(result.body)).toEqual({ error: 'Access denied' });
      });
    });

    it('should allow legitimate browser user agents', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([{ generated_text: 'Response' }])
      });

      mockEvent.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).not.toBe(403);
    });
  });

  describe('Environment Variable Validation', () => {
    it('should return 500 error when HF_API_KEY is missing', async () => {
      delete process.env.HF_API_KEY;
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({ error: 'HF_API_KEY not set in environment' });
    });

    it('should proceed when HF_API_KEY is set', async () => {
      process.env.HF_API_KEY = 'valid-key';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([{ generated_text: 'Response' }])
      });
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).not.toBe(500);
    });
  });

  describe('Request Body Validation', () => {
    it('should handle valid JSON body with prompt', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([{ generated_text: 'Response' }])
      });

      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(200);
    });

    it('should return 400 error for invalid JSON', async () => {
      mockEvent.body = '{ invalid json }';
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'Invalid JSON body' });
    });

    it('should return 400 error when prompt is missing', async () => {
      mockEvent.body = JSON.stringify({ message: 'no prompt field' });
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'No prompt provided' });
    });

    it('should return 400 error when prompt is empty', async () => {
      mockEvent.body = JSON.stringify({ prompt: '' });
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'No prompt provided' });
    });

    it('should handle missing body gracefully', async () => {
      mockEvent.body = null;
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'No prompt provided' });
    });
  });

  describe('Hugging Face API Integration', () => {
    it('should forward request to Hugging Face API with correct parameters', async () => {
      const mockResponse = [{ generated_text: 'I can help you with car detailing services.' }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse)
      });

      const result = await handler(mockEvent, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api-inference.huggingface.co/models/gpt2',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${process.env.HF_API_KEY}`,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ inputs: 'Tell me about your car detailing services' })
        })
      );

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockResponse);
    });

    it('should return Hugging Face response data directly', async () => {
      const mockHFResponse = [
        { generated_text: 'Complete car detailing services include exterior washing, interior cleaning, and protective coatings.' }
      ];
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockHFResponse)
      });

      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockHFResponse);
      expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('should handle Hugging Face API errors properly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: vi.fn().mockResolvedValue({ error: 'Rate limit exceeded' })
      });

      const result = await handler(mockEvent, mockContext);
      
      expect(result.statusCode).toBe(429);
      expect(JSON.parse(result.body)).toEqual({ error: 'Rate limit exceeded' });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      process.env.HF_API_KEY = 'valid-key';
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await handler(mockEvent, mockContext);

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({ error: 'Internal server error' });
    });

    it('should handle fetch timeout', async () => {
      process.env.HF_API_KEY = 'valid-key';
      global.fetch = vi.fn().mockRejectedValue(new Error('Request timeout'));

      const result = await handler(mockEvent, mockContext);

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({ error: 'Internal server error' });
    });

    it('should include CORS headers in error responses', async () => {
      mockEvent.body = '{ invalid json }';
      
      const result = await handler(mockEvent, mockContext);
      
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('should log errors for debugging', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Test error'));

      await handler(mockEvent, mockContext);

      expect(consoleSpy).toHaveBeenCalledWith('Hugging Face API error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Response Format Compliance', () => {
    it('should return proper Netlify function response format', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([{ generated_text: 'Test response' }])
      });

      const result = await handler(mockEvent, mockContext);
      
      // Check response structure
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('body');
      
      // Check required headers
      expect(result.headers).toHaveProperty('Content-Type');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
      
      // Check body is valid JSON string
      expect(() => JSON.parse(result.body)).not.toThrow();
    });
  });
});