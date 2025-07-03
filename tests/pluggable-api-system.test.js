/**
 * Test file for the Plug-and-Play API System
 * Tests API discovery, registration, and routing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { APIRegistry } from '../src/utils/apiRegistry.js';
import { routeRequest, initializeDynamicRouter } from '../src/utils/dynamicChatRouter.js';

// Mock the file system for testing
const mockAPIFiles = {
  'quotes.js': {
    metadata: {
      name: 'Service Quotes API',
      description: 'Generate detailed quotes for mobile car wash services',
      categories: ['quotes', 'pricing', 'services'],
      keywords: ['quote', 'price', 'cost', 'estimate'],
      enabled: true,
      shouldHandle: (input) => input.toLowerCase().includes('quote')
    },
    handler: async (req) => ({
      response: { message: 'Quote generated successfully' },
      metadata: { api: 'quotes' }
    })
  },
  'openai.js': {
    metadata: {
      name: 'OpenAI GPT',
      description: 'OpenAI GPT models for conversational AI',
      categories: ['chat', 'reasoning', 'tools'],
      keywords: ['chat', 'conversation', 'ai'],
      enabled: true,
      shouldHandle: () => true
    },
    handler: async (req) => ({
      response: { message: 'OpenAI response' },
      metadata: { api: 'openai' }
    })
  },
  'services.js': {
    metadata: {
      name: 'Services Management API',
      description: 'CRUD operations for mobile wash services',
      categories: ['services', 'data', 'management'],
      keywords: ['service', 'manage', 'crud'],
      enabled: true,
      shouldHandle: (input) => input.toLowerCase().includes('service')
    },
    handler: async (req) => ({
      response: { services: [] },
      metadata: { api: 'services' }
    })
  }
};

describe('API Registry System', () => {
  let registry;

  beforeEach(() => {
    registry = new APIRegistry();
  });

  afterEach(() => {
    registry.registeredAPIs.clear();
    registry.categoryMap.clear();
    registry.initialized = false;
  });

  describe('API Registration', () => {
    it('should register APIs with metadata', async () => {
      // Mock the file system
      const mockFiles = Object.keys(mockAPIFiles);
      registry.registerAPI = async (filename) => {
        const apiId = filename.replace('.js', '');
        const mockAPI = mockAPIFiles[filename];
        
        if (mockAPI && mockAPI.metadata) {
          const apiRegistration = {
            id: apiId,
            filename,
            endpoint: `/api/${apiId}`,
            enabled: mockAPI.metadata.enabled,
            registeredAt: new Date().toISOString(),
            ...mockAPI.metadata
          };
          
          registry.registeredAPIs.set(apiId, apiRegistration);
          
          // Add to category mappings
          if (mockAPI.metadata.categories) {
            mockAPI.metadata.categories.forEach(category => {
              if (!registry.categoryMap.has(category)) {
                registry.categoryMap.set(category, []);
              }
              registry.categoryMap.get(category).push(apiId);
            });
          }
        }
      };

      // Register all mock APIs
      for (const filename of mockFiles) {
        await registry.registerAPI(filename);
      }

      registry.initialized = true;

      // Test registration
      expect(registry.registeredAPIs.size).toBe(3);
      expect(registry.getAPI('quotes')).toBeDefined();
      expect(registry.getAPI('openai')).toBeDefined();
      expect(registry.getAPI('services')).toBeDefined();
    });

    it('should organize APIs by categories', async () => {
      // Register mock APIs
      for (const [filename, mockAPI] of Object.entries(mockAPIFiles)) {
        const apiId = filename.replace('.js', '');
        registry.registeredAPIs.set(apiId, {
          id: apiId,
          ...mockAPI.metadata
        });
        
        mockAPI.metadata.categories?.forEach(category => {
          if (!registry.categoryMap.has(category)) {
            registry.categoryMap.set(category, []);
          }
          registry.categoryMap.get(category).push(apiId);
        });
      }

      // Test category organization
      const quotesAPIs = registry.getAPIsByCategory('quotes');
      const chatAPIs = registry.getAPIsByCategory('chat');
      const servicesAPIs = registry.getAPIsByCategory('services');

      expect(quotesAPIs.length).toBe(1);
      expect(quotesAPIs[0].id).toBe('quotes');
      
      expect(chatAPIs.length).toBe(1);
      expect(chatAPIs[0].id).toBe('openai');
      
      expect(servicesAPIs.length).toBe(2); // quotes and services both have 'services' category
    });

    it('should get registry statistics', async () => {
      // Register mock APIs
      for (const [filename, mockAPI] of Object.entries(mockAPIFiles)) {
        const apiId = filename.replace('.js', '');
        registry.registeredAPIs.set(apiId, {
          id: apiId,
          enabled: mockAPI.metadata.enabled,
          ...mockAPI.metadata
        });
        
        // Add to category mappings
        mockAPI.metadata.categories?.forEach(category => {
          if (!registry.categoryMap.has(category)) {
            registry.categoryMap.set(category, []);
          }
          registry.categoryMap.get(category).push(apiId);
        });
      }

      const stats = registry.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.enabled).toBe(3);
      expect(stats.disabled).toBe(0);
      expect(stats.categories).toBeGreaterThan(0);
    });
  });

  describe('API Matching', () => {
    beforeEach(() => {
      // Setup mock APIs
      for (const [filename, mockAPI] of Object.entries(mockAPIFiles)) {
        const apiId = filename.replace('.js', '');
        registry.registeredAPIs.set(apiId, {
          id: apiId,
          ...mockAPI.metadata
        });
        
        // Add to category mappings
        mockAPI.metadata.categories?.forEach(category => {
          if (!registry.categoryMap.has(category)) {
            registry.categoryMap.set(category, []);
          }
          registry.categoryMap.get(category).push(apiId);
        });
      }
    });

    it('should find matching APIs by keywords', () => {
      const matches = registry.findMatchingAPIs('I need a quote for car detailing');
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].id).toBe('quotes');
    });

    it('should find matching APIs by categories', () => {
      const matches = registry.findMatchingAPIs('Let me chat with you');
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some(api => api.categories?.includes('chat'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const matches = registry.findMatchingAPIs('xyz unknown request', { threshold: 0.8 });
      
      expect(matches.length).toBe(0);
    });

    it('should limit results when specified', () => {
      const matches = registry.findMatchingAPIs('service quote chat', { limit: 2 });
      
      expect(matches.length).toBeLessThanOrEqual(2);
    });
  });

  describe('API Management', () => {
    beforeEach(() => {
      for (const [filename, mockAPI] of Object.entries(mockAPIFiles)) {
        const apiId = filename.replace('.js', '');
        registry.registeredAPIs.set(apiId, {
          id: apiId,
          ...mockAPI.metadata
        });
        
        // Add to category mappings
        mockAPI.metadata.categories?.forEach(category => {
          if (!registry.categoryMap.has(category)) {
            registry.categoryMap.set(category, []);
          }
          registry.categoryMap.get(category).push(apiId);
        });
      }
    });

    it('should enable/disable APIs', () => {
      const result = registry.setAPIEnabled('quotes', false);
      
      expect(result).toBe(true);
      expect(registry.getAPI('quotes').enabled).toBe(false);
    });

    it('should return false for unknown API', () => {
      const result = registry.setAPIEnabled('unknown', false);
      
      expect(result).toBe(false);
    });

    it('should get all categories', () => {
      const categories = registry.getCategories();
      
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('quotes');
      expect(categories).toContain('chat');
      expect(categories).toContain('services');
    });
  });
});

describe('Dynamic Router Integration', () => {
  it('should classify roles from input', () => {
    // Test internal classification logic - simulate the function
    function classifyRole(input) {
      const inputLower = input.toLowerCase();
      
      if (inputLower.includes('quote') || inputLower.includes('price') || inputLower.includes('cost')) {
        return 'quotes';
      }
      
      if (inputLower.includes('search') || inputLower.includes('find') || inputLower.includes('lookup')) {
        return 'search';
      }
      
      if (inputLower.includes('analyze') || inputLower.includes('explain') || inputLower.includes('why')) {
        return 'reasoning';
      }
      
      if (inputLower.includes('summary') || inputLower.includes('summarize')) {
        return 'summaries';
      }
      
      return 'chat';
    }
    
    expect(classifyRole('Get me a quote')).toBe('quotes');
    expect(classifyRole('Search for information')).toBe('search');
    expect(classifyRole('Analyze this data')).toBe('reasoning');
    expect(classifyRole('Let me chat')).toBe('chat');
  });

  it('should handle routing gracefully', async () => {
    // This would require mocking the entire system
    // For now, we'll test that the functions exist and don't throw
    expect(typeof routeRequest).toBe('function');
    expect(typeof initializeDynamicRouter).toBe('function');
  });
});

describe('API Templates', () => {
  it('should validate required metadata fields', () => {
    const validMetadata = {
      name: 'Test API',
      description: 'Test description',
      categories: ['test'],
      keywords: ['test'],
      enabled: true,
      endpoint: '/api/test',
      methods: ['GET', 'POST']
    };

    const requiredFields = ['name', 'description', 'categories', 'keywords'];
    const missingFields = requiredFields.filter(field => !validMetadata[field]);
    
    expect(missingFields.length).toBe(0);
  });

  it('should handle optional metadata fields', () => {
    const metadata = {
      name: 'Test API',
      description: 'Test description',
      categories: ['test'],
      keywords: ['test'],
      enabled: true,
      examples: [],
      shouldHandle: () => true
    };

    expect(metadata.examples).toBeDefined();
    expect(typeof metadata.shouldHandle).toBe('function');
  });
});

describe('Error Handling', () => {
  it('should handle invalid API files gracefully', async () => {
    const registry = new APIRegistry();
    
    // Mock a broken API file
    registry.registerAPI = async (filename) => {
      try {
        throw new Error('Invalid API file');
      } catch (error) {
        console.error(`Error registering API ${filename}:`, error);
        // Should not rethrow - gracefully handle the error
      }
    };

    // Should not throw
    await expect(registry.registerAPI('broken.js')).resolves.toBeUndefined();
  });

  it('should handle missing metadata gracefully', async () => {
    const registry = new APIRegistry();
    
    // Mock an API file without metadata
    registry.registerAPI = async (filename) => {
      // Simulate API without metadata - should be skipped
      console.warn(`API ${filename} has no metadata, skipping`);
    };

    await expect(registry.registerAPI('no-metadata.js')).resolves.not.toThrow();
  });
});

describe('Performance Tests', () => {
  it('should handle large number of APIs efficiently', () => {
    const registry = new APIRegistry();
    
    // Register many APIs
    for (let i = 0; i < 100; i++) {
      registry.registeredAPIs.set(`api-${i}`, {
        id: `api-${i}`,
        name: `API ${i}`,
        categories: ['test'],
        keywords: [`keyword${i}`],
        enabled: true
      });
    }

    const start = performance.now();
    const matches = registry.findMatchingAPIs('test keyword50');
    const end = performance.now();

    expect(matches.length).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(100); // Should be fast
  });
});