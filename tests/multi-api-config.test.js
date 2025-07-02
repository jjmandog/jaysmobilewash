/**
 * Tests for Multi-API Configuration
 * Verifies that multiple AI APIs are properly enabled and configured
 */

import { describe, it, expect } from 'vitest';
import { 
  API_OPTIONS, 
  DEFAULT_ROLE_ASSIGNMENTS,
  getEnabledAPIs,
  getAPIById
} from '../src/constants/apiOptions.js';

describe('Multi-API Configuration', () => {
  it('should have multiple APIs enabled', () => {
    const enabledAPIs = getEnabledAPIs();
    
    // Should have more than just 'none'
    expect(enabledAPIs.length).toBeGreaterThan(1);
    
    // Should include the currently enabled APIs (openai is now primary)
    const enabledApiIds = enabledAPIs.map(api => api.id);
    expect(enabledApiIds).toContain('openai');
    expect(enabledApiIds).toContain('anthropic');
    expect(enabledApiIds).toContain('google');
    // DeepSeek should no longer be enabled
    expect(enabledApiIds).not.toContain('deepseek');
  });

  it('should have proper role assignments to different APIs', () => {
    // Different roles should be assigned to different APIs
    const assignmentValues = Object.values(DEFAULT_ROLE_ASSIGNMENTS);
    const uniqueAssignments = [...new Set(assignmentValues)];
    
    // Should use multiple different APIs (more than just 'none')
    expect(uniqueAssignments.length).toBeGreaterThan(1);
    expect(uniqueAssignments).toContain('openai');
    expect(uniqueAssignments).toContain('anthropic');
    expect(uniqueAssignments).toContain('google');
    // DeepSeek should no longer be in use
    expect(uniqueAssignments).not.toContain('deepseek');
  });

  it('should have specialized role assignments', () => {
    // Photo uploads should use Google (vision capabilities)
    expect(DEFAULT_ROLE_ASSIGNMENTS.photo_uploads).toBe('google');
    
    // Reasoning should use Anthropic (Claude excels at reasoning)
    expect(DEFAULT_ROLE_ASSIGNMENTS.reasoning).toBe('anthropic');
    
    // Tools should use OpenAI (good function calling)
    expect(DEFAULT_ROLE_ASSIGNMENTS.tools).toBe('openai');
    
    // Chat should use OpenAI (conversational)
    expect(DEFAULT_ROLE_ASSIGNMENTS.chat).toBe('openai');
    
    // Fallback should now use OpenAI (reliable and always enabled)
    expect(DEFAULT_ROLE_ASSIGNMENTS.fallback).toBe('openai');
    
    // Quotes and analytics should now use OpenAI instead of DeepSeek
    expect(DEFAULT_ROLE_ASSIGNMENTS.quotes).toBe('openai');
    expect(DEFAULT_ROLE_ASSIGNMENTS.analytics).toBe('openai');
  });

  it('should have all assigned APIs enabled', () => {
    Object.entries(DEFAULT_ROLE_ASSIGNMENTS).forEach(([role, apiId]) => {
      const api = getAPIById(apiId);
      expect(api).toBeDefined();
      expect(api.enabled).toBe(true);
    });
  });

  it('should have proper API endpoints configured', () => {
    const criticalAPIs = ['openai', 'anthropic', 'google'];
    
    criticalAPIs.forEach(apiId => {
      const api = getAPIById(apiId);
      expect(api).toBeDefined();
      expect(api.endpoint).toBeDefined();
      expect(api.endpoint).toMatch(/^\/api\//);
      expect(api.enabled).toBe(true);
    });
    
    // DeepSeek should be disabled
    const deepseekAPI = getAPIById('deepseek');
    expect(deepseekAPI).toBeDefined();
    expect(deepseekAPI.enabled).toBe(false);
  });
});