/**
 * Test Setup Configuration
 * Global test utilities and environment setup for Jay's Mobile Wash tests
 */

import { vi } from 'vitest';

// Mock fetch for testing API endpoints
global.fetch = vi.fn();

// Mock environment variables for testing
process.env.OPENROUTER_API_KEY = 'test-api-key-mock';

// Global test utilities
global.mockFetch = (responseData, status = 200, ok = true) => {
  global.fetch.mockResolvedValueOnce({
    ok,
    status,
    json: async () => responseData,
    text: async () => JSON.stringify(responseData)
  });
};

global.mockFetchReject = (error) => {
  global.fetch.mockRejectedValueOnce(error);
};

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});