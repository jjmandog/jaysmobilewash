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
    
    // Should have more than just 'none' and 'deepseek'
    expect(enabledAPIs.length).toBeGreaterThan(2);
    
    // Should include the newly enabled APIs
    const enabledApiIds = enabledAPIs.map(api => api.id);
    expect(enabledApiIds).toContain('openai');
    expect(enabledApiIds).toContain('anthropic');
    expect(enabledApiIds).toContain('google');
    expect(enabledApiIds).toContain('deepseek');
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
    expect(uniqueAssignments).toContain('deepseek');
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
    
    // Fallback should use DeepSeek (reliable)
    expect(DEFAULT_ROLE_ASSIGNMENTS.fallback).toBe('deepseek');
  });

  it('should have all assigned APIs enabled', () => {
    Object.entries(DEFAULT_ROLE_ASSIGNMENTS).forEach(([role, apiId]) => {
      const api = getAPIById(apiId);
      expect(api).toBeDefined();
      expect(api.enabled).toBe(true);
    });
  });

  it('should have proper API endpoints configured', () => {
    const criticalAPIs = ['openai', 'anthropic', 'google', 'deepseek'];
    
    criticalAPIs.forEach(apiId => {
      const api = getAPIById(apiId);
      expect(api).toBeDefined();
      expect(api.endpoint).toBeDefined();
      expect(api.endpoint).toMatch(/^\/api\//);
      expect(api.enabled).toBe(true);
    });
  });
});