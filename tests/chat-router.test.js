/**
 * Tests for API Options and Chat Router functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  API_OPTIONS, 
  CHAT_ROLES, 
  DEFAULT_ROLE_ASSIGNMENTS,
  getEnabledAPIs,
  getAPIById,
  getRoleById,
  validateRoleAssignments
} from '../src/constants/apiOptions.js';
import { 
  routeLLMRequest, 
  isRoleAPIAvailable, 
  getRoutingStats 
} from '../src/utils/chatRouter.js';

// Mock the ai utility
vi.mock('../src/utils/ai.js', () => ({
  queryAI: vi.fn(),
  isAIServiceAvailable: vi.fn()
}));

describe('API Options Constants', () => {
  it('should have exactly 10 API options', () => {
    expect(API_OPTIONS).toHaveLength(10);
  });

  it('should have exactly 10 chat roles', () => {
    expect(CHAT_ROLES).toHaveLength(10);
  });

  it('should have all required role IDs', () => {
    const requiredRoles = [
      'reasoning', 'tools', 'quotes', 'photo_uploads', 'summaries',
      'search', 'chat', 'fallback', 'analytics', 'accessibility'
    ];
    
    const roleIds = CHAT_ROLES.map(role => role.id);
    requiredRoles.forEach(roleId => {
      expect(roleIds).toContain(roleId);
    });
  });

  it('should have default assignments for all roles', () => {
    CHAT_ROLES.forEach(role => {
      expect(DEFAULT_ROLE_ASSIGNMENTS).toHaveProperty(role.id);
      expect(typeof DEFAULT_ROLE_ASSIGNMENTS[role.id]).toBe('string');
    });
  });

  it('should have enabled APIs available', () => {
    const enabledAPIs = getEnabledAPIs();
    expect(enabledAPIs.length).toBeGreaterThan(0);
    enabledAPIs.forEach(api => {
      expect(api.enabled).toBe(true);
    });
  });

  it('should get API by ID correctly', () => {
    const api = getAPIById('openrouter');
    expect(api).toBeDefined();
    expect(api.id).toBe('openrouter');
    expect(api.name).toBe('OpenRouter');
  });

  it('should get role by ID correctly', () => {
    const role = getRoleById('quotes');
    expect(role).toBeDefined();
    expect(role.id).toBe('quotes');
    expect(role.name).toBe('Quotes');
  });

  it('should validate role assignments correctly', () => {
    // Valid assignments
    const validAssignments = { ...DEFAULT_ROLE_ASSIGNMENTS };
    const errors = validateRoleAssignments(validAssignments);
    expect(errors).toHaveLength(0);

    // Invalid assignments - missing role
    const invalidAssignments = { ...DEFAULT_ROLE_ASSIGNMENTS };
    delete invalidAssignments.quotes;
    const errorsInvalid = validateRoleAssignments(invalidAssignments);
    expect(errorsInvalid.length).toBeGreaterThan(0);
    expect(errorsInvalid[0]).toContain('not assigned');
  });
});

describe('Chat Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error for empty prompt', async () => {
    await expect(routeLLMRequest('', 'chat')).rejects.toThrow('Prompt is required');
  });

  it('should throw error for missing role', async () => {
    await expect(routeLLMRequest('test prompt', '')).rejects.toThrow('Role is required');
  });

  it('should throw error for unassigned role', async () => {
    const assignments = { chat: 'openrouter' }; // missing other roles
    await expect(routeLLMRequest('test', 'quotes', assignments)).rejects.toThrow('No API assigned');
  });

  it('should route to correct API for role', async () => {
    const { queryAI } = await import('../src/utils/ai.js');
    queryAI.mockResolvedValue({ response: 'test response' });

    const assignments = { chat: 'openrouter' };
    const result = await routeLLMRequest('test prompt', 'chat', assignments);
    
    expect(queryAI).toHaveBeenCalledWith(
      expect.stringContaining('test prompt'),
      expect.objectContaining({ endpoint: '/api/openrouter' })
    );
    expect(result).toEqual({ response: 'test response' });
  });

  it('should enhance prompt based on role', async () => {
    const { queryAI } = await import('../src/utils/ai.js');
    queryAI.mockResolvedValue({ response: 'test response' });

    const assignments = { quotes: 'openrouter' };
    await routeLLMRequest('vehicle detail', 'quotes', assignments);
    
    expect(queryAI).toHaveBeenCalledWith(
      expect.stringContaining('Provide a detailed service quote'),
      expect.any(Object)
    );
  });

  it('should fallback to fallback API on primary failure', async () => {
    const { queryAI } = await import('../src/utils/ai.js');
    queryAI
      .mockRejectedValueOnce(new Error('Primary API failed'))
      .mockResolvedValueOnce({ response: 'fallback response' });

    const assignments = { 
      chat: 'openrouter', 
      fallback: 'deepseek' 
    };
    
    const result = await routeLLMRequest('test', 'chat', assignments);
    expect(result).toEqual({ response: 'fallback response' });
    expect(queryAI).toHaveBeenCalledTimes(2);
  });

  it('should check role API availability', async () => {
    const { isAIServiceAvailable } = await import('../src/utils/ai.js');
    isAIServiceAvailable.mockResolvedValue(true);

    const assignments = { chat: 'openrouter' };
    const available = await isRoleAPIAvailable('chat', assignments);
    
    expect(available).toBe(true);
    expect(isAIServiceAvailable).toHaveBeenCalledWith('/api/openrouter');
  });

  it('should return routing statistics', () => {
    const assignments = {
      chat: 'openrouter',
      quotes: 'deepseek',
      reasoning: 'openrouter'
    };
    
    const stats = getRoutingStats(assignments);
    
    expect(stats).toHaveProperty('openrouter');
    expect(stats.openrouter.count).toBe(2);
    expect(stats.openrouter.roles).toEqual(['chat', 'reasoning']);
    
    expect(stats).toHaveProperty('deepseek');
    expect(stats.deepseek.count).toBe(1);
    expect(stats.deepseek.roles).toEqual(['quotes']);
  });
});

describe('API Integration', () => {
  it('should handle unknown API gracefully', async () => {
    const { queryAI } = await import('../src/utils/ai.js');
    queryAI.mockResolvedValue({ response: 'fallback response' });

    const assignments = { chat: 'unknown-api' };
    
    // Should throw error for unknown API
    await expect(routeLLMRequest('test', 'chat', assignments))
      .rejects.toThrow('Unknown API');
  });

  it('should handle disabled API with fallback', async () => {
    const { queryAI } = await import('../src/utils/ai.js');
    queryAI.mockResolvedValue({ response: 'fallback response' });

    // Mock disabled API
    const assignments = { 
      chat: 'anthropic', // disabled in API_OPTIONS
      fallback: 'openrouter' 
    };
    
    const result = await routeLLMRequest('test', 'chat', assignments);
    expect(result).toEqual({ response: 'fallback response' });
  });
});