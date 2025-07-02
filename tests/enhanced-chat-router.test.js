/**
 * Enhanced Chat Router Tests
 * Tests for the community key vault and smart selection integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  routeLLMRequest,
  canEnableSmartSelection,
  getSmartSelectionProviders,
  getRoutingStats
} from '../src/utils/chatRouter.js';
import { addCommunityKey, initializeCommunityVault } from '../src/utils/communityKeyVault.js';
import { initializeAnalytics, setSmartSelectEnabled } from '../src/utils/aiAnalytics.js';

// Mock the AI query function
vi.mock('../src/utils/ai.js', () => ({
  queryAI: vi.fn().mockResolvedValue({
    content: 'Mock AI response',
    role: 'assistant'
  }),
  isAIServiceAvailable: vi.fn().mockResolvedValue(true)
}));

describe('Enhanced Chat Router', () => {
  beforeEach(() => {
    initializeCommunityVault();
    initializeAnalytics();
    setSmartSelectEnabled(false);
    vi.clearAllMocks();
  });

  describe('Basic Routing', () => {
    it('should route to assigned API successfully', async () => {
      const assignments = { chat: 'openai' };
      
      const result = await routeLLMRequest('Hello', 'chat', assignments);
      
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('role', 'assistant');
    });

    it('should throw error for missing role assignment', async () => {
      const assignments = {};
      
      await expect(routeLLMRequest('Hello', 'chat', assignments))
        .rejects.toThrow('No API assigned for role: chat');
    });

    it('should handle unknown API gracefully', async () => {
      const assignments = { chat: 'unknown-api' };
      
      await expect(routeLLMRequest('Hello', 'chat', assignments))
        .rejects.toThrow('Unknown API: unknown-api');
    });
  });

  describe('Community Key Integration', () => {
    it('should use community key when API is disabled', async () => {
      // Add a community key for cohere (which is disabled by default)
      await addCommunityKey('cohere', 'a'.repeat(40));
      
      const assignments = { chat: 'cohere' };
      
      // Should not throw error even though cohere is disabled
      const result = await routeLLMRequest('Hello', 'chat', assignments);
      expect(result).toHaveProperty('content');
    });

    it('should fallback when no community key available for disabled API', async () => {
      const assignments = { chat: 'cohere', fallback: 'openai' };
      
      // Should fallback to openai since cohere is disabled and has no community key
      const result = await routeLLMRequest('Hello', 'chat', assignments);
      expect(result).toHaveProperty('content');
    });
  });

  describe('Smart Selection', () => {
    beforeEach(async () => {
      // Add community keys for smart selection
      await addCommunityKey('openai', 'sk-' + 'a'.repeat(48));
      await addCommunityKey('anthropic', 'sk-ant-api03-' + 'a'.repeat(95));
      await addCommunityKey('google', 'a'.repeat(39));
      setSmartSelectEnabled(true);
    });

    it('should use smart selection when enabled and keys available', async () => {
      const assignments = { chat: 'openai', fallback: 'openai' };
      const options = { smartSelect: true };
      
      const result = await routeLLMRequest('Hello', 'chat', assignments, options);
      expect(result).toHaveProperty('content');
    });

    it('should not use smart selection when disabled', async () => {
      setSmartSelectEnabled(false);
      
      const assignments = { chat: 'openai' };
      const options = { smartSelect: true };
      
      const result = await routeLLMRequest('Hello', 'chat', assignments, options);
      expect(result).toHaveProperty('content');
    });

    it('should check if smart selection can be enabled', async () => {
      const canEnable = canEnableSmartSelection();
      expect(typeof canEnable).toBe('boolean');
    });

    it('should get available providers for smart selection', () => {
      const providers = getSmartSelectionProviders();
      
      expect(Array.isArray(providers)).toBe(true);
      providers.forEach(provider => {
        expect(provider).toHaveProperty('id');
        expect(provider).toHaveProperty('name');
      });
    });
  });

  describe('Enhanced Routing Stats', () => {
    beforeEach(async () => {
      await addCommunityKey('openai', 'sk-' + 'a'.repeat(48));
    });

    it('should include community key status in routing stats', () => {
      const assignments = { chat: 'openai', reasoning: 'anthropic' };
      const stats = getRoutingStats(assignments);
      
      expect(stats).toHaveProperty('openai');
      expect(stats.openai).toHaveProperty('hasCommunityKey');
      expect(stats.openai).toHaveProperty('isAvailable');
      expect(stats.openai.hasCommunityKey).toBe(true);
    });

    it('should show availability based on enabled status or community key', () => {
      const assignments = { chat: 'cohere' }; // cohere is disabled by default
      const stats = getRoutingStats(assignments);
      
      expect(stats.cohere.enabled).toBe(false);
      expect(stats.cohere.hasCommunityKey).toBe(false);
      expect(stats.cohere.isAvailable).toBe(false);
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle API failures gracefully', async () => {
      // Mock AI query to fail
      const { queryAI } = await import('../src/utils/ai.js');
      queryAI.mockRejectedValueOnce(new Error('API Error'));
      
      const assignments = { chat: 'openai', fallback: 'anthropic' };
      
      // Should attempt fallback
      await expect(routeLLMRequest('Hello', 'chat', assignments))
        .resolves.toHaveProperty('content');
    });

    it('should throw error when both primary and fallback fail', async () => {
      const { queryAI } = await import('../src/utils/ai.js');
      queryAI.mockRejectedValue(new Error('API Error'));
      
      const assignments = { chat: 'openai', fallback: 'anthropic' };
      
      await expect(routeLLMRequest('Hello', 'chat', assignments))
        .rejects.toThrow();
    });

    it('should handle none API correctly', async () => {
      const assignments = { chat: 'none' };
      
      const result = await routeLLMRequest('Hello', 'chat', assignments);
      expect(result.content).toContain('AI services are currently disabled');
    });
  });

  describe('Input Validation', () => {
    it('should validate prompt parameter', async () => {
      const assignments = { chat: 'openai' };
      
      await expect(routeLLMRequest('', 'chat', assignments))
        .rejects.toThrow('Prompt is required and must be a non-empty string');
      
      await expect(routeLLMRequest(null, 'chat', assignments))
        .rejects.toThrow('Prompt is required and must be a non-empty string');
      
      await expect(routeLLMRequest(123, 'chat', assignments))
        .rejects.toThrow('Prompt is required and must be a non-empty string');
    });

    it('should validate role parameter', async () => {
      const assignments = { chat: 'openai' };
      
      await expect(routeLLMRequest('Hello', '', assignments))
        .rejects.toThrow('Role is required and must be a string');
      
      await expect(routeLLMRequest('Hello', null, assignments))
        .rejects.toThrow('Role is required and must be a string');
      
      await expect(routeLLMRequest('Hello', 123, assignments))
        .rejects.toThrow('Role is required and must be a string');
    });
  });

  describe('Prompt Enhancement', () => {
    it('should enhance prompts based on role', async () => {
      const { queryAI } = await import('../src/utils/ai.js');
      const assignments = { reasoning: 'openai' };
      
      await routeLLMRequest('Test prompt', 'reasoning', assignments);
      
      expect(queryAI).toHaveBeenCalledWith(
        expect.stringContaining('Please analyze this logically'),
        expect.any(Object)
      );
    });

    it('should enhance prompts for different roles', async () => {
      const { queryAI } = await import('../src/utils/ai.js');
      const assignments = { quotes: 'openai' };
      
      await routeLLMRequest('Test prompt', 'quotes', assignments);
      
      expect(queryAI).toHaveBeenCalledWith(
        expect.stringContaining('Provide a detailed service quote'),
        expect.any(Object)
      );
    });
  });
});