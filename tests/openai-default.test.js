/**
 * Tests to verify OpenAI GPT is default and DeepSeek is eliminated
 * Ensures no POST calls go to /api/deepseek and OpenAI is used as fallback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  DEFAULT_ROLE_ASSIGNMENTS,
  getAPIById
} from '../src/constants/apiOptions.js';
import { routeLLMRequest } from '../src/utils/chatRouter.js';

// Mock the AI utility
vi.mock('../src/utils/ai.js', () => ({
  queryAI: vi.fn(),
  isAIServiceAvailable: vi.fn()
}));

describe('OpenAI Default Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have OpenAI enabled and DeepSeek disabled', () => {
    const openaiAPI = getAPIById('openai');
    const deepseekAPI = getAPIById('deepseek');
    
    expect(openaiAPI.enabled).toBe(true);
    expect(deepseekAPI.enabled).toBe(false);
  });

  it('should use OpenAI as fallback instead of DeepSeek', () => {
    expect(DEFAULT_ROLE_ASSIGNMENTS.fallback).toBe('openai');
    expect(DEFAULT_ROLE_ASSIGNMENTS.fallback).not.toBe('deepseek');
  });

  it('should use OpenAI for quotes, analytics, and auto modes instead of DeepSeek', () => {
    expect(DEFAULT_ROLE_ASSIGNMENTS.quotes).toBe('openai');
    expect(DEFAULT_ROLE_ASSIGNMENTS.analytics).toBe('openai');
  });

  it('should never make calls to /api/deepseek endpoint', async () => {
    const { queryAI } = await import('../src/utils/ai.js');
    queryAI.mockResolvedValue({ response: 'test response' });

    // Test all roles that previously used DeepSeek
    const rolesToTest = ['quotes', 'analytics', 'fallback'];
    
    for (const role of rolesToTest) {
      await routeLLMRequest('test prompt', role, DEFAULT_ROLE_ASSIGNMENTS);
    }

    // Verify no calls were made to DeepSeek endpoint
    const deepseekCalls = queryAI.mock.calls.filter(call => 
      call[1] && call[1].endpoint === '/api/deepseek'
    );
    
    expect(deepseekCalls).toHaveLength(0);
    
    // Verify all calls go to OpenAI endpoint
    const openaiCalls = queryAI.mock.calls.filter(call => 
      call[1] && call[1].endpoint === '/api/openai'
    );
    
    expect(openaiCalls.length).toBeGreaterThan(0);
  });

  it('should use OpenAI as fallback when other APIs are not implemented', async () => {
    const { queryAI } = await import('../src/utils/ai.js');
    queryAI.mockResolvedValue({ response: 'fallback response' });

    // Test with a role assigned to an unimplemented API
    const customAssignments = { 
      test: 'mistral',  // Mistral is not implemented
      fallback: 'openai'
    };
    
    await routeLLMRequest('test prompt', 'test', customAssignments);
    
    // Should fallback to OpenAI, not DeepSeek
    expect(queryAI).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ endpoint: '/api/openai' })
    );
  });

  it('should not contain any deepseek references in role assignments', () => {
    const assignmentValues = Object.values(DEFAULT_ROLE_ASSIGNMENTS);
    const hasDeepseek = assignmentValues.includes('deepseek');
    
    expect(hasDeepseek).toBe(false);
  });
});