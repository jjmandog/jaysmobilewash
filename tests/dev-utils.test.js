/**
 * Tests for development utilities
 * Basic tests to ensure dev utilities work correctly
 */

import { describe, it, expect, vi } from 'vitest';
import { devLog, isDevelopment, devTimer, isFeatureEnabled } from '../utils/dev-utils.js';

describe('Development Utilities', () => {
  describe('isDevelopment', () => {
    it('should return a boolean', () => {
      expect(typeof isDevelopment()).toBe('boolean');
    });
  });

  describe('devLog', () => {
    it('should not throw errors when called', () => {
      expect(() => devLog('Test message')).not.toThrow();
      expect(() => devLog('Test warning', 'warn')).not.toThrow();
      expect(() => devLog('Test error', 'error')).not.toThrow();
    });
  });

  describe('devTimer', () => {
    it('should return a function', () => {
      const stopTimer = devTimer('Test Timer');
      expect(typeof stopTimer).toBe('function');
      
      // Should not throw when called
      expect(() => stopTimer()).not.toThrow();
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return a boolean', () => {
      expect(typeof isFeatureEnabled('test-feature')).toBe('boolean');
    });

    it('should handle different feature names', () => {
      expect(() => isFeatureEnabled('feature-1')).not.toThrow();
      expect(() => isFeatureEnabled('feature-2')).not.toThrow();
      expect(() => isFeatureEnabled('')).not.toThrow();
    });
  });
});