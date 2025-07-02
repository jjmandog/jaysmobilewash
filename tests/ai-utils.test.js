/**
 * Test Suite for AI Utility Helper
 * Tests the utility functions for querying the AI endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queryAI, sanitizePrompt, isAIServiceAvailable } from '../src/utils/ai.js';

describe('AI Utility Helper', () => {
  beforeEach(() => {
    // Clear all fetch mocks
    vi.restoreAllMocks();
  });

  describe('queryAI', () => {
    it('should successfully query the AI endpoint', async () => {
      // Mock successful response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([{
          generated_text: 'Test prompt response from AI'
        }])
      });

      const result = await queryAI('Test prompt');
      
      expect(global.fetch).toHaveBeenCalledWith('/api/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Test prompt'
        })
      });
      
      expect(result).toEqual([{
        generated_text: 'Test prompt response from AI'
      }]);
    });

    it('should throw error for empty prompt', async () => {
      await expect(queryAI('')).rejects.toThrow('Prompt is required and must be a non-empty string');
      await expect(queryAI('   ')).rejects.toThrow('Prompt is required and must be a non-empty string');
    });

    it('should throw error for invalid prompt type', async () => {
      await expect(queryAI(null)).rejects.toThrow('Prompt is required and must be a non-empty string');
      await expect(queryAI(123)).rejects.toThrow('Prompt is required and must be a non-empty string');
    });

    it('should handle HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({ error: 'No prompt provided' })
      });

      await expect(queryAI('test')).rejects.toThrow('No prompt provided');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(queryAI('test')).rejects.toThrow('Network error: Unable to connect to AI service');
    });
  });

  describe('sanitizePrompt', () => {
    it('should trim whitespace', () => {
      expect(sanitizePrompt('  test prompt  ')).toBe('test prompt');
    });

    it('should handle empty/null input', () => {
      expect(sanitizePrompt('')).toBe('');
      expect(sanitizePrompt(null)).toBe('');
      expect(sanitizePrompt(undefined)).toBe('');
    });

    it('should limit length to 1000 characters', () => {
      const longText = 'a'.repeat(1500);
      const result = sanitizePrompt(longText);
      expect(result.length).toBe(1000);
    });

    it('should handle non-string input', () => {
      expect(sanitizePrompt(123)).toBe('');
      expect(sanitizePrompt([])).toBe('');
      expect(sanitizePrompt({})).toBe('');
    });
  });

  describe('isAIServiceAvailable', () => {
    it('should return true when service is available', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([{ generated_text: 'test response' }])
      });

      const result = await isAIServiceAvailable();
      expect(result).toBe(true);
    });

    it('should return false when service is unavailable', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Service unavailable'));

      const result = await isAIServiceAvailable();
      expect(result).toBe(false);
    });

    it('should use custom endpoint', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue([{ generated_text: 'test response' }])
      });

      await isAIServiceAvailable('/custom/ai');
      
      expect(global.fetch).toHaveBeenCalledWith('/custom/ai', expect.anything());
    });
  });
});