/**
 * API Registry System - Plug-and-Play API Discovery and Management
 * Automatically scans /api directory and registers APIs based on metadata
 */

import { readdir } from 'fs/promises';
import { join } from 'path';

class APIRegistry {
  constructor() {
    this.registeredAPIs = new Map();
    this.categoryMap = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the registry by scanning and registering all APIs
   * @param {string} apiDir - Directory to scan for APIs (defaults to /api)
   * @returns {Promise<void>}
   */
  async initialize(apiDir = '/api') {
    if (this.initialized) return;

    try {
      // Convert relative path to absolute path
      const absoluteApiDir = join(process.cwd(), apiDir);
      
      // Get all API files
      const files = await readdir(absoluteApiDir);
      const apiFiles = files.filter(file => 
        file.endsWith('.js') && 
        !file.startsWith('_') && 
        !file.includes('.test.') &&
        !file.includes('.backup')
      );

      // Register each API
      for (const file of apiFiles) {
        await this.registerAPI(file, absoluteApiDir);
      }

      this.initialized = true;
      console.log(`API Registry initialized with ${this.registeredAPIs.size} APIs`);
    } catch (error) {
      console.error('Error initializing API Registry:', error);
      throw error;
    }
  }

  /**
   * Register a single API from file
   * @param {string} filename - API filename
   * @param {string} apiDir - API directory path
   * @returns {Promise<void>}
   */
  async registerAPI(filename, apiDir) {
    try {
      const filePath = join(apiDir, filename);
      const apiId = filename.replace('.js', '');
      
      // Dynamic import the API module
      const apiModule = await import(filePath);
      
      // Check if API has registration metadata
      if (!apiModule.register && !apiModule.metadata) {
        // Skip APIs without metadata (legacy APIs)
        console.warn(`API ${apiId} has no registration metadata, skipping`);
        return;
      }

      // Get API metadata
      const metadata = apiModule.metadata || (apiModule.register && apiModule.register());
      
      if (!metadata) {
        console.warn(`API ${apiId} registration returned no metadata`);
        return;
      }

      // Validate required metadata fields
      const requiredFields = ['name', 'description', 'categories', 'handler'];
      const missingFields = requiredFields.filter(field => !metadata[field]);
      
      if (missingFields.length > 0) {
        console.warn(`API ${apiId} missing required metadata fields: ${missingFields.join(', ')}`);
        return;
      }

      // Create full API registration
      const apiRegistration = {
        id: apiId,
        filename,
        endpoint: `/api/${apiId}`,
        enabled: metadata.enabled !== false,
        registeredAt: new Date().toISOString(),
        module: apiModule,
        ...metadata
      };

      // Register the API
      this.registeredAPIs.set(apiId, apiRegistration);

      // Add to category mappings
      if (Array.isArray(metadata.categories)) {
        metadata.categories.forEach(category => {
          if (!this.categoryMap.has(category)) {
            this.categoryMap.set(category, []);
          }
          this.categoryMap.get(category).push(apiId);
        });
      }

      console.log(`Registered API: ${apiId} with categories: ${metadata.categories?.join(', ')}`);
    } catch (error) {
      console.error(`Error registering API ${filename}:`, error);
    }
  }

  /**
   * Get all registered APIs
   * @returns {Map<string, Object>} Map of API ID to registration data
   */
  getAllAPIs() {
    return new Map(this.registeredAPIs);
  }

  /**
   * Get API by ID
   * @param {string} apiId - API identifier
   * @returns {Object|null} API registration data or null if not found
   */
  getAPI(apiId) {
    return this.registeredAPIs.get(apiId) || null;
  }

  /**
   * Get APIs by category
   * @param {string} category - Category name
   * @returns {Array<Object>} Array of API registration data
   */
  getAPIsByCategory(category) {
    const apiIds = this.categoryMap.get(category) || [];
    return apiIds.map(id => this.registeredAPIs.get(id)).filter(Boolean);
  }

  /**
   * Get all available categories
   * @returns {Array<string>} Array of category names
   */
  getCategories() {
    return Array.from(this.categoryMap.keys());
  }

  /**
   * Find best matching APIs for a given input
   * @param {string} input - User input to classify
   * @param {Object} options - Classification options
   * @returns {Array<Object>} Array of matching APIs sorted by relevance
   */
  findMatchingAPIs(input, options = {}) {
    const { limit = 3, threshold = 0.1 } = options;
    
    // Simple keyword-based matching (can be enhanced with NLP)
    const matches = [];
    
    for (const [apiId, api] of this.registeredAPIs) {
      if (!api.enabled) continue;
      
      let score = 0;
      const inputLower = input.toLowerCase();
      
      // Check categories
      if (api.categories) {
        for (const category of api.categories) {
          if (inputLower.includes(category.toLowerCase())) {
            score += 0.5;
          }
        }
      }
      
      // Check keywords
      if (api.keywords) {
        for (const keyword of api.keywords) {
          if (inputLower.includes(keyword.toLowerCase())) {
            score += 0.3;
          }
        }
      }
      
      // Check description
      if (api.description && inputLower.includes(api.description.toLowerCase().split(' ')[0])) {
        score += 0.2;
      }
      
      if (score >= threshold) {
        matches.push({ api, score });
      }
    }
    
    // Sort by score and return top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(match => match.api);
  }

  /**
   * Get registry statistics
   * @returns {Object} Statistics about the registry
   */
  getStats() {
    const enabled = Array.from(this.registeredAPIs.values()).filter(api => api.enabled).length;
    const disabled = this.registeredAPIs.size - enabled;
    
    return {
      total: this.registeredAPIs.size,
      enabled,
      disabled,
      categories: this.categoryMap.size,
      initialized: this.initialized
    };
  }

  /**
   * Reload the registry (useful for development)
   * @returns {Promise<void>}
   */
  async reload() {
    this.registeredAPIs.clear();
    this.categoryMap.clear();
    this.initialized = false;
    await this.initialize();
  }

  /**
   * Enable/disable an API
   * @param {string} apiId - API identifier
   * @param {boolean} enabled - Whether to enable or disable
   * @returns {boolean} Success status
   */
  setAPIEnabled(apiId, enabled) {
    const api = this.registeredAPIs.get(apiId);
    if (!api) return false;
    
    api.enabled = enabled;
    return true;
  }
}

// Global registry instance
const apiRegistry = new APIRegistry();

export default apiRegistry;
export { APIRegistry };