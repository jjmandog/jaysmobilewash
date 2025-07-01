/**
 * Vitest Configuration for Jay's Mobile Wash
 * Production-grade testing setup for API endpoints and utilities
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/setup.js',
        '**/*.config.js',
        'scripts/',
        'dist/',
        '*.html'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': './'
    }
  }
});