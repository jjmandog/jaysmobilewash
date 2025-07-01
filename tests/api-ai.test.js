/**
 * Comprehensive Test Suite for /api/ai Serverless Endpoint
 * Tests POST requests, error handling, user-agent blocking, and Hugging Face API integration
 * Production-grade testing with full edge case coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../api/ai.js';

describe('/api/ai Serverless Endpoint', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset environment variables
    process.env.HF_API_KEY = 'test-hf-api-key-mock';
    
    // Mock request object for Hugging Face format
    mockReq = {
      method: 'POST',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: {
        prompt: 'Tell me about your car detailing services'
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
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      });
    });

    it('should reject PUT requests with 405 Method Not Allowed', async () => {
      mockReq.method = 'PUT';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      });
    });

    it('should reject DELETE requests with 405 Method Not Allowed', async () => {
      mockReq.method = 'DELETE';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      });
    });

    it('should accept POST requests', async () => {
      // Mock successful Hugging Face API response
      const mockFetch = (responseData, status = 200, ok = true) => {
        global.fetch = vi.fn().mockResolvedValue({
          ok,
          status,
          json: vi.fn().mockResolvedValue(responseData)
        });
      };

      mockFetch([{
        generated_text: 'I can help you with information about our car detailing services.'
      }]);

      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(405);
    });
  });

  describe('User-Agent Blocking', () => {
    // Mock fetch function for successful responses
    const mockFetch = (responseData, status = 200, ok = true) => {
      global.fetch = vi.fn().mockResolvedValue({
        ok,
        status,
        json: vi.fn().mockResolvedValue(responseData)
      });
    };

    const mockFetchReject = (error) => {
      global.fetch = vi.fn().mockRejectedValue(error);
    };

    const blockedUserAgents = [
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
      mockFetch([{
        generated_text: 'Response'
      }]);

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
      mockFetch([{
        generated_text: 'Response'
      }]);
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(403);
    });
  });

  describe('API Key Validation', () => {
    it('should return 500 error when HF_API_KEY is missing', async () => {
      delete process.env.HF_API_KEY;
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'HF_API_KEY not set in environment' });
    });

    it('should return 500 error when HF_API_KEY is empty', async () => {
      process.env.HF_API_KEY = '';
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'HF_API_KEY not set in environment' });
    });

    it('should proceed when HF_API_KEY is valid', async () => {
      process.env.HF_API_KEY = 'valid-api-key';
      
      // Mock fetch function
      const mockFetch = (responseData, status = 200, ok = true) => {
        global.fetch = vi.fn().mockResolvedValue({
          ok,
          status,
          json: vi.fn().mockResolvedValue(responseData)
        });
      };
      
      mockFetch([{ generated_text: 'Response' }]);
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });
  });

  describe('Hugging Face API Integration', () => {
    // Mock fetch function
    const mockFetch = (responseData, status = 200, ok = true) => {
      global.fetch = vi.fn().mockResolvedValue({
        ok,
        status,
        json: vi.fn().mockResolvedValue(responseData)
      });
    };

    const mockFetchReject = (error) => {
      global.fetch = vi.fn().mockRejectedValue(error);
    };

    it('should forward request to Hugging Face API with correct parameters', async () => {
      mockFetch([{ generated_text: 'I can help you with car detailing services.' }]);

      await handler(mockReq, mockRes);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api-inference.huggingface.co/models/gpt2',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${process.env.HF_API_KEY}`,
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"inputs":"Tell me about your car detailing services"')
        })
      );
    });

    it('should return successful response from Hugging Face', async () => {
      const mockApiResponse = [
        {
          generated_text: 'Tell me about your car detailing services. We offer premium mobile car detailing with ceramic coating and paint correction.'
        }
      ];

      mockFetch(mockApiResponse, 200, true);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockApiResponse);
    });

    it('should handle Hugging Face API errors gracefully', async () => {
      mockFetch({ error: 'Model loading' }, 503, false);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Model loading' });
    });
  });

  describe('Request Body Validation', () => {
    it('should return 400 error for missing prompt', async () => {
      mockReq.body = {};
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No prompt provided' });
    });

    it('should return 400 error for empty prompt', async () => {
      mockReq.body = { prompt: '' };
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No prompt provided' });
    });

    it('should handle string request body', async () => {
      mockReq.body = '{"prompt": "Test prompt"}';
      
      // Mock fetch function
      const mockFetch = (responseData, status = 200, ok = true) => {
        global.fetch = vi.fn().mockResolvedValue({
          ok,
          status,
          json: vi.fn().mockResolvedValue(responseData)
        });
      };
      
      mockFetch([{ generated_text: 'Response' }]);
      
      await handler(mockReq, mockRes);
      
      expect(mockRes.status).not.toHaveBeenCalledWith(400);
    });
  });

  describe('Error Handling', () => {
    // Mock fetch function
    const mockFetch = (responseData, status = 200, ok = true) => {
      global.fetch = vi.fn().mockResolvedValue({
        ok,
        status,
        json: vi.fn().mockResolvedValue(responseData)
      });
    };

    const mockFetchReject = (error) => {
      global.fetch = vi.fn().mockRejectedValue(error);
    };

    it('should handle network errors', async () => {
      process.env.HF_API_KEY = 'valid-key';
      mockFetchReject(new Error('Network error'));

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should handle fetch timeout', async () => {
      process.env.HF_API_KEY = 'valid-key';
      mockFetchReject(new Error('Request timeout'));

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should handle malformed JSON responses', async () => {
      process.env.HF_API_KEY = 'valid-key';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});