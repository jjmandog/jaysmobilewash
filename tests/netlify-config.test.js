/**
 * Test Suite for Netlify Configuration Files
 * Tests netlify.toml configuration for SPA routing and 410 error handling
 */

import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import path from 'path';

describe('Netlify Configuration Files', () => {
  const projectRoot = process.cwd();

  describe('410.html Error Page', () => {
    it('should exist and be properly configured', async () => {
      const errorPagePath = path.join(projectRoot, '410.html');
      const content = await readFile(errorPagePath, 'utf-8');
      
      // Check essential elements
      expect(content).toContain('410');
      expect(content).toContain('Content No Longer Available');
      expect(content).toContain('permanently removed');
      expect(content).toContain('noindex, follow'); // SEO directive
    });
  });

  describe('netlify.toml Configuration', () => {
    it('should contain required redirect rules', async () => {
      const tomlPath = path.join(projectRoot, 'netlify.toml');
      const content = await readFile(tomlPath, 'utf-8');
      
      // Check AI API redirect rule
      expect(content).toContain('from = "/api/ai"');
      expect(content).toContain('to = "/.netlify/functions/ai"');
      expect(content).toContain('status = 200');
      
      // Check 410 redirect rule
      expect(content).toContain('from = "/invalid-route"');
      expect(content).toContain('to = "/410.html"');
      expect(content).toContain('status = 410');
      
      // Check SPA routing rule
      expect(content).toContain('from = "/*"');
      expect(content).toContain('to = "/index.html"');
      expect(content).toContain('status = 200');
      
      // Check build configuration
      expect(content).toContain('publish = "."');
      expect(content).toContain('directory = "netlify/functions"');
    });

    it('should have proper Node.js version specified', async () => {
      const tomlPath = path.join(projectRoot, 'netlify.toml');
      const content = await readFile(tomlPath, 'utf-8');
      
      expect(content).toContain('NODE_VERSION = "18"');
    });
  });
});