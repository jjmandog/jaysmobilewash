/**
 * Comprehensive Test Suite for /api/ai Serverless Endpoint
 * Tests POST requests, error handling, user-agent blocking, and API integration
 * Production-grade testing with full edge case coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../api/ai.js';

describe('/api/ai Serverless Endpoint', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset environment variables
    process.env.OPENROUTER_API_KEY = 'test-api-key-mock';
    
    // Mock request object
    mockReq = {
      method: 'POST',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'referer': 'https://jaysmobilewash.net',
        'origin': 'https://jaysmobilewash.net'
      },
      body: {
        messages: [
          { role: 'user', content: 'Tell me about your car detailing services' }
        ],
        max_tokens: 500,
        temperature: 0.7
      }
    };

    // Mock response object
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
  });

  describe('HTTP Method Validation', () => {
    it('should reject GET requests with 405 Method Not Allowed', async () => {
      mockReq.method = 'GET';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('should reject PUT requests with 405 Method Not Allowed', async () => {
      mockReq.method = 'PUT';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('should reject DELETE requests with 405 Method Not Allowed', async () => {
      mockReq.method = 'DELETE';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('should accept POST requests', async () => {
      // Mock successful OpenRouter API response
      mockFetch({
        choices: [
          {
            message: {
              content: 'I can help you with information about our car detailing services.'
            }
          }
        ]
      });

      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(405);
    });
  });

  describe('User-Agent Blocking', () => {
    const blockedUserAgents = [
      'openrouter',
      'bot',
      'crawler',
      'spider',
      'curl',
      'wget',
      'python',
      'scrapy'
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
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

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
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(403);
    });
  });

  describe('API Key Validation', () => {
    it('should return 500 error when OPENROUTER_API_KEY is missing', async () => {
      delete process.env.OPENROUTER_API_KEY;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
    });

    it('should return 500 error when OPENROUTER_API_KEY is empty', async () => {
      process.env.OPENROUTER_API_KEY = '';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Server configuration error' });
    });

    it('should proceed when OPENROUTER_API_KEY is valid', async () => {
      process.env.OPENROUTER_API_KEY = 'valid-api-key';
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });
  });

  describe('OpenRouter API Integration', () => {
    it('should forward request to OpenRouter API with correct parameters', async () => {
      mockFetch({
        choices: [{ message: { content: 'API Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': mockReq.headers.referer,
            'X-Title': "Jay's Mobile Wash"
          }),
          body: expect.stringContaining('deepseek/deepseek-r1-distill-llama-70b:free')
        })
      );
    });

    it('should use origin as referer fallback', async () => {
      delete mockReq.headers.referer;
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'HTTP-Referer': mockReq.headers.origin
          })
        })
      );
    });

    it('should use default referer when both referer and origin are missing', async () => {
      delete mockReq.headers.referer;
      delete mockReq.headers.origin;
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'HTTP-Referer': 'https://jaysmobilewash.net'
          })
        })
      );
    });

    it('should return successful response from OpenRouter', async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: 'I can help you with information about our premium mobile detailing services.'
            }
          }
        ]
      };

      mockFetch(mockApiResponse, 200, true);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockApiResponse);
    });

    it('should handle OpenRouter API errors gracefully', async () => {
      mockFetch({ error: 'API Error' }, 429, false);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'API Error' });
    });
  });

  describe('Request Body Validation', () => {
    it('should handle missing messages array', async () => {
      mockReq.body = {};
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"messages":[]')
        })
      );
    });

    it('should use default max_tokens when not provided', async () => {
      delete mockReq.body.max_tokens;
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"max_tokens":500')
        })
      );
    });

    it('should use default temperature when not provided', async () => {
      delete mockReq.body.temperature;
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"temperature":0.7')
        })
      );
    });

    it('should preserve custom parameters from request body', async () => {
      mockReq.body.custom_param = 'test_value';
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"custom_param":"test_value"')
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetchReject(new Error('Network error'));

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should handle fetch timeout', async () => {
      mockFetchReject(new Error('Request timeout'));

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should handle malformed JSON responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('Security Headers', () => {
    it('should include proper security headers in API request', async () => {
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json',
            'X-Title': "Jay's Mobile Wash"
          })
        })
      );
    });
  });

  describe('Model Configuration', () => {
    it('should use the correct AI model', async () => {
      mockFetch({
        choices: [{ message: { content: 'Response' } }]
      });

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"model":"deepseek/deepseek-r1-distill-llama-70b:free"')
        })
      );
    });
  });
});