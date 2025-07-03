/**
 * Community Key Vault Tests
 * Tests for the community API key management system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addCommunityKey,
  getCommunityKey,
  getCommunityKeyStatus,
  areAllRequiredKeysPresent,
  getCommunityKeyStats,
  getMissingProviders,
  removeCommunityKey,
  initializeCommunityVault
} from '../src/utils/communityKeyVault.js';

describe('Community Key Vault', () => {
  beforeEach(() => {
    // Reset vault before each test
    initializeCommunityVault();
  });

  describe('addCommunityKey', () => {
    it('should add a valid OpenAI key', async () => {
      const testKey = 'sk-' + 'a'.repeat(48);
      const result = await addCommunityKey('openai', testKey);
      
      expect(result.success).toBe(true);
      expect(result.provider).toBe('openai');
      expect(result.isValid).toBe(true);
    });

    it('should add a valid Hugging Face key to DeepSeek provider', async () => {
      const testKey = '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';
      const result = await addCommunityKey('deepseek', testKey, { 
        contributor: 'DeekSeek' 
      });
      
      expect(result.success).toBe(true);
      expect(result.provider).toBe('deepseek');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('DeepSeek API key added successfully');
    });

    it('should reject invalid key format', async () => {
      const result = await addCommunityKey('openai', 'invalid-key');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid API key format');
    });

    it('should reject unsupported provider', async () => {
      const result = await addCommunityKey('unsupported', 'any-key');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported provider');
    });
  });

  describe('getCommunityKey', () => {
    it('should return key for valid provider', async () => {
      const testKey = 'sk-' + 'a'.repeat(48);
      await addCommunityKey('openai', testKey);
      
      const retrievedKey = getCommunityKey('openai');
      expect(retrievedKey).toBe(testKey);
    });

    it('should return null for missing provider', () => {
      const key = getCommunityKey('nonexistent');
      expect(key).toBe(null);
    });

    it('should return null for invalid key', async () => {
      // Add an invalid key first (this will be marked as invalid)
      await addCommunityKey('openai', 'invalid-key');
      
      const key = getCommunityKey('openai');
      expect(key).toBe(null);
    });
  });

  describe('getCommunityKeyStatus', () => {
    it('should return status for all providers', () => {
      const status = getCommunityKeyStatus();
      
      expect(status).toHaveProperty('openai');
      expect(status).toHaveProperty('anthropic');
      expect(status).toHaveProperty('google');
      expect(status.openai).toHaveProperty('name');
      expect(status.openai).toHaveProperty('hasKey');
      expect(status.openai).toHaveProperty('isValid');
      expect(status.openai).toHaveProperty('required');
    });

    it('should show correct status after adding key', async () => {
      const testKey = 'sk-' + 'a'.repeat(48);
      await addCommunityKey('openai', testKey);
      
      const status = getCommunityKeyStatus();
      expect(status.openai.hasKey).toBe(true);
      expect(status.openai.isValid).toBe(true);
    });
  });

  describe('areAllRequiredKeysPresent', () => {
    it('should return false when required keys are missing', () => {
      const result = areAllRequiredKeysPresent();
      expect(result).toBe(false);
    });

    it('should return true when all required keys are present', async () => {
      // Add all required keys
      await addCommunityKey('openai', 'sk-' + 'a'.repeat(48));
      await addCommunityKey('anthropic', 'sk-ant-api03-' + 'a'.repeat(95));
      await addCommunityKey('google', 'a'.repeat(39));
      
      const result = areAllRequiredKeysPresent();
      expect(result).toBe(true);
    });
  });

  describe('getCommunityKeyStats', () => {
    it('should return correct statistics', async () => {
      const stats = getCommunityKeyStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('withKeys');
      expect(stats).toHaveProperty('valid');
      expect(stats).toHaveProperty('required');
      expect(stats).toHaveProperty('requiredValid');
      expect(stats).toHaveProperty('completionRate');
      expect(stats).toHaveProperty('canEnableSmartSelect');
      
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.completionRate).toBe('number');
      expect(typeof stats.canEnableSmartSelect).toBe('boolean');
    });

    it('should update stats after adding keys', async () => {
      const beforeStats = getCommunityKeyStats();
      
      await addCommunityKey('openai', 'sk-' + 'a'.repeat(48));
      
      const afterStats = getCommunityKeyStats();
      expect(afterStats.valid).toBe(beforeStats.valid + 1);
      expect(afterStats.completionRate).toBeGreaterThan(beforeStats.completionRate);
    });
  });

  describe('getMissingProviders', () => {
    it('should return list of providers without valid keys', () => {
      const missing = getMissingProviders();
      
      expect(Array.isArray(missing)).toBe(true);
      expect(missing.length).toBeGreaterThan(0);
      expect(missing[0]).toHaveProperty('id');
      expect(missing[0]).toHaveProperty('name');
      expect(missing[0]).toHaveProperty('required');
    });

    it('should exclude providers with valid keys', async () => {
      await addCommunityKey('openai', 'sk-' + 'a'.repeat(48));
      
      const missing = getMissingProviders();
      const openaiMissing = missing.find(p => p.id === 'openai');
      
      expect(openaiMissing).toBeUndefined();
    });
  });

  describe('removeCommunityKey', () => {
    it('should remove existing key', async () => {
      await addCommunityKey('openai', 'sk-' + 'a'.repeat(48));
      
      const removed = removeCommunityKey('openai');
      expect(removed).toBe(true);
      
      const key = getCommunityKey('openai');
      expect(key).toBe(null);
    });

    it('should return false for non-existent key', () => {
      const removed = removeCommunityKey('nonexistent');
      expect(removed).toBe(false);
    });
  });
});

describe('Community Key API Patterns', () => {
  const testPatterns = [
    {
      provider: 'openai',
      validKeys: ['sk-' + 'a'.repeat(48), 'sk-' + 'B'.repeat(50)],
      invalidKeys: ['sk-short', 'invalid-key', 'api-key-123']
    },
    {
      provider: 'anthropic',
      validKeys: ['sk-ant-api03-' + 'a'.repeat(95)],
      invalidKeys: ['sk-ant-api02-' + 'a'.repeat(95), 'claude-key-123']
    },
    {
      provider: 'google',
      validKeys: ['A'.repeat(39), 'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T'],
      invalidKeys: ['short', 'too-long-key-' + 'a'.repeat(50)]
    },
    {
      provider: 'deepseek',
      validKeys: ['sk-' + 'a'.repeat(48), 'hf_' + 'a'.repeat(30), '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'],
      invalidKeys: ['sk-short', 'hf_short', 'invalid-key', 'api-key-123']
    }
  ];

  testPatterns.forEach(({ provider, validKeys, invalidKeys }) => {
    describe(`${provider} key validation`, () => {
      validKeys.forEach((key, index) => {
        it(`should accept valid ${provider} key ${index + 1}`, async () => {
          const result = await addCommunityKey(provider, key);
          expect(result.success).toBe(true);
        });
      });

      invalidKeys.forEach((key, index) => {
        it(`should reject invalid ${provider} key ${index + 1}`, async () => {
          const result = await addCommunityKey(provider, key);
          expect(result.success).toBe(false);
        });
      });
    });
  });
});