/**
 * Tests for Google Vision API Integration
 */

import { describe, it, expect, vi } from 'vitest';

describe('Google Vision API Integration', () => {
  it('should have google vision utility module', async () => {
    const module = await import('../src/utils/googleVision.js');
    
    expect(module.analyzeImageWithGoogleVision).toBeDefined();
    expect(module.isGoogleVisionAvailable).toBeDefined();
    expect(typeof module.analyzeImageWithGoogleVision).toBe('function');
    expect(typeof module.isGoogleVisionAvailable).toBe('function');
  });

  it('should fallback to simulated analysis when Vision API is unavailable', async () => {
    const { analyzeImageWithGoogleVision } = await import('../src/utils/googleVision.js');
    
    // Mock fetch to simulate API failure
    global.fetch = vi.fn().mockRejectedValue(new Error('API unavailable'));
    
    const mockFileData = {
      name: 'test-car.jpg',
      type: 'image/jpeg',
      data: 'data:image/jpeg;base64,/9j/test...' // Mock base64 data
    };
    
    const results = await analyzeImageWithGoogleVision(mockFileData);
    
    // Should return simulated results when API fails
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('issue');
    expect(results[0]).toHaveProperty('recommendation');
  });

  it('should format recommendations correctly', async () => {
    const { analyzeImageWithGoogleVision } = await import('../src/utils/googleVision.js');
    
    // Mock successful Vision API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        responses: [{
          labelAnnotations: [
            { description: 'Car', score: 0.95 },
            { description: 'Vehicle', score: 0.90 },
            { description: 'Dirt', score: 0.7 }
          ],
          localizedObjectAnnotations: [
            { name: 'Wheel', score: 0.85 }
          ],
          imagePropertiesAnnotation: {
            dominantColors: {
              colors: [
                { color: { red: 50, green: 50, blue: 50 } } // Dark color
              ]
            }
          }
        }]
      })
    });
    
    const mockFileData = {
      name: 'test-car.jpg',
      type: 'image/jpeg',
      data: 'data:image/jpeg;base64,/9j/test...'
    };
    
    const results = await analyzeImageWithGoogleVision(mockFileData);
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // Check that recommendations have the expected structure
    results.forEach(result => {
      expect(result).toHaveProperty('issue');
      expect(result).toHaveProperty('recommendation');
      expect(typeof result.issue).toBe('string');
      expect(typeof result.recommendation).toBe('string');
      expect(result.recommendation).toContain('$'); // Should contain pricing
    });
  });

  it('should handle Vision API health check', async () => {
    const { isGoogleVisionAvailable } = await import('../src/utils/googleVision.js');
    
    // Mock successful health check
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    
    const isAvailable = await isGoogleVisionAvailable();
    expect(typeof isAvailable).toBe('boolean');
    
    // Should handle failed health check
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    const isAvailableFailed = await isGoogleVisionAvailable();
    expect(isAvailableFailed).toBe(false);
  });

  it('should properly encode image data for Vision API', async () => {
    const { analyzeImageWithGoogleVision } = await import('../src/utils/googleVision.js');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ responses: [{}] })
    });
    
    const mockFileData = {
      name: 'test-car.jpg',
      type: 'image/jpeg',
      data: 'data:image/jpeg;base64,VGVzdERhdGE=' // "TestData" in base64
    };
    
    await analyzeImageWithGoogleVision(mockFileData);
    
    // Check that fetch was called with correct structure
    expect(global.fetch).toHaveBeenCalledWith('/api/google-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: { content: 'VGVzdERhdGE=' }, // Should strip the data:image/jpeg;base64, prefix
        features: [
          { type: 'LABEL_DETECTION', maxResults: 15 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 15 },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'SAFE_SEARCH_DETECTION' }
        ]
      })
    });
  });
});