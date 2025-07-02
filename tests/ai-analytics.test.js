/**
 * AI Analytics Tests
 * Tests for the AI provider analytics and smart selection system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initializeAnalytics,
  recordRequestStart,
  recordRequestEnd,
  selectBestProvider,
  getAnalyticsData,
  setSmartSelectEnabled,
  isSmartSelectEnabled,
  getFallbackStats
} from '../src/utils/aiAnalytics.js';

// Mock gtag for analytics events
global.gtag = vi.fn();

describe('AI Analytics', () => {
  beforeEach(() => {
    initializeAnalytics();
    vi.clearAllMocks();
  });

  describe('Request Tracking', () => {
    it('should record request start', () => {
      const request = recordRequestStart('openai', 'chat', 'test-req-1');
      
      expect(request).toHaveProperty('id');
      expect(request).toHaveProperty('provider', 'openai');
      expect(request).toHaveProperty('role', 'chat');
      expect(request).toHaveProperty('startTime');
      expect(request.success).toBe(null);
    });

    it('should record request completion', () => {
      const request = recordRequestStart('openai', 'chat');
      
      // Simulate some delay
      setTimeout(() => {
        recordRequestEnd(request.id, true);
      }, 10);
      
      expect(request).toHaveProperty('id');
    });

    it('should track failed requests', () => {
      const request = recordRequestStart('anthropic', 'reasoning');
      recordRequestEnd(request.id, false, 'API Error', false);
      
      const analytics = getAnalyticsData();
      expect(analytics.providers.anthropic.failedRequests).toBe(1);
      expect(analytics.providers.anthropic.successRate).toBeLessThan(1);
    });

    it('should track fallback usage', () => {
      const request = recordRequestStart('openai', 'chat');
      recordRequestEnd(request.id, true, null, true);
      
      const fallbackStats = getFallbackStats();
      expect(fallbackStats.fallbackRequests).toBe(1);
      expect(fallbackStats.fallbackRate).toBe(1);
    });
  });

  describe('Smart Selection', () => {
    it('should select best provider from available list', () => {
      const availableProviders = ['openai', 'anthropic', 'google'];
      const selected = selectBestProvider(availableProviders, 'reasoning');
      
      expect(availableProviders).toContain(selected);
    });

    it('should return null for empty provider list', () => {
      const selected = selectBestProvider([], 'chat');
      expect(selected).toBe(null);
    });

    it('should return single provider when only one available', () => {
      const selected = selectBestProvider(['openai'], 'chat');
      expect(selected).toBe('openai');
    });

    it('should prefer providers with better performance', () => {
      // Simulate some requests to create performance data
      const req1 = recordRequestStart('openai', 'chat');
      recordRequestEnd(req1.id, true, null, false);
      
      const req2 = recordRequestStart('anthropic', 'chat');
      recordRequestEnd(req2.id, false, 'Error', false);
      
      const selected = selectBestProvider(['openai', 'anthropic'], 'chat');
      expect(selected).toBe('openai'); // Should prefer the successful one
    });
  });

  describe('Smart Select Toggle', () => {
    it('should enable and disable smart select', () => {
      expect(isSmartSelectEnabled()).toBe(false);
      
      setSmartSelectEnabled(true);
      expect(isSmartSelectEnabled()).toBe(true);
      
      setSmartSelectEnabled(false);
      expect(isSmartSelectEnabled()).toBe(false);
    });

    it('should fire analytics event when toggled', () => {
      setSmartSelectEnabled(true);
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'smart_select_toggled', {
        enabled: true
      });
    });
  });

  describe('Analytics Data', () => {
    it('should return comprehensive analytics data', () => {
      const analytics = getAnalyticsData();
      
      expect(analytics).toHaveProperty('providers');
      expect(analytics).toHaveProperty('summary');
      
      expect(analytics.providers).toHaveProperty('openai');
      expect(analytics.providers.openai).toHaveProperty('totalRequests');
      expect(analytics.providers.openai).toHaveProperty('successRate');
      expect(analytics.providers.openai).toHaveProperty('performanceScore');
      
      expect(analytics.summary).toHaveProperty('totalRequests');
      expect(analytics.summary).toHaveProperty('smartSelectEnabled');
    });

    it('should update metrics after requests', () => {
      const beforeAnalytics = getAnalyticsData();
      
      const request = recordRequestStart('openai', 'chat');
      recordRequestEnd(request.id, true);
      
      const afterAnalytics = getAnalyticsData();
      
      expect(afterAnalytics.providers.openai.totalRequests)
        .toBe(beforeAnalytics.providers.openai.totalRequests + 1);
      expect(afterAnalytics.providers.openai.successfulRequests)
        .toBe(beforeAnalytics.providers.openai.successfulRequests + 1);
    });
  });

  describe('Performance Scoring', () => {
    it('should calculate performance scores correctly', () => {
      // Simulate successful requests
      for (let i = 0; i < 5; i++) {
        const req = recordRequestStart('openai', 'chat');
        recordRequestEnd(req.id, true);
      }
      
      // Simulate failed requests
      for (let i = 0; i < 2; i++) {
        const req = recordRequestStart('anthropic', 'chat');
        recordRequestEnd(req.id, false, 'Error');
      }
      
      const analytics = getAnalyticsData();
      
      expect(analytics.providers.openai.performanceScore)
        .toBeGreaterThan(analytics.providers.anthropic.performanceScore);
    });

    it('should mark providers as unavailable after consecutive failures', () => {
      // Simulate consecutive failures
      for (let i = 0; i < 4; i++) {
        const req = recordRequestStart('anthropic', 'chat');
        recordRequestEnd(req.id, false, 'Error');
      }
      
      const analytics = getAnalyticsData();
      expect(analytics.providers.anthropic.isAvailable).toBe(false);
    });
  });

  describe('Fallback Statistics', () => {
    it('should track fallback usage correctly', () => {
      // Record some regular requests
      for (let i = 0; i < 3; i++) {
        const req = recordRequestStart('openai', 'chat');
        recordRequestEnd(req.id, true, null, false);
      }
      
      // Record some fallback requests
      for (let i = 0; i < 2; i++) {
        const req = recordRequestStart('anthropic', 'chat');
        recordRequestEnd(req.id, true, null, true);
      }
      
      const stats = getFallbackStats();
      
      expect(stats.totalRequests).toBe(5);
      expect(stats.fallbackRequests).toBe(2);
      expect(stats.fallbackRate).toBe(0.4);
      expect(stats.fallbacksByProvider.anthropic).toBe(2);
    });
  });

  describe('Request History Management', () => {
    it('should limit request history size', () => {
      // Generate more than 1000 requests to test pruning
      for (let i = 0; i < 1100; i++) {
        const req = recordRequestStart('openai', 'chat');
        recordRequestEnd(req.id, true);
      }
      
      const analytics = getAnalyticsData();
      expect(analytics.summary.recentRequests.length).toBeLessThanOrEqual(10);
    });
  });
});

describe('Analytics Edge Cases', () => {
  beforeEach(() => {
    initializeAnalytics();
    vi.clearAllMocks();
  });

  it('should handle missing request ID gracefully', () => {
    expect(() => {
      recordRequestEnd('nonexistent-id', true);
    }).not.toThrow();
  });

  it('should handle empty provider metrics', () => {
    const selected = selectBestProvider(['nonexistent'], 'chat');
    expect(selected).toBe('nonexistent'); // Should fallback to first available
  });

  it('should handle analytics without gtag', () => {
    delete global.gtag;
    
    expect(() => {
      setSmartSelectEnabled(true);
    }).not.toThrow();
  });
});