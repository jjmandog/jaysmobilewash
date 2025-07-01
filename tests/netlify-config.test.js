/**
 * Test Suite for Netlify Configuration Files
 * Tests _redirects and netlify.toml configuration for SPA routing and 410 error handling
 */

import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import path from 'path';

describe('Netlify Configuration Files', () => {
  const projectRoot = process.cwd();
  
  describe('_redirects File', () => {
    it('should exist and contain required redirect rules', async () => {
      const redirectsPath = path.join(projectRoot, '_redirects');
      const content = await readFile(redirectsPath, 'utf-8');
      
      // Check SPA routing rule
      expect(content).toContain('/*           /index.html   200');
      
      // Check 410 Gone rule for invalid routes
      expect(content).toContain('/invalid-route    /410.html   410');
    });
  });

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
  });

  describe('Configuration Integration', () => {
    it('should have matching rules between _redirects and netlify.toml', async () => {
      const redirectsPath = path.join(projectRoot, '_redirects');
      const tomlPath = path.join(projectRoot, 'netlify.toml');
      
      const redirectsContent = await readFile(redirectsPath, 'utf-8');
      const tomlContent = await readFile(tomlPath, 'utf-8');
      
      // Both should have the invalid-route -> 410 rule
      expect(redirectsContent).toContain('/invalid-route');
      expect(tomlContent).toContain('/invalid-route');
      
      // Both should handle SPA routing
      expect(redirectsContent).toContain('/index.html   200');
      expect(tomlContent).toContain('to = "/index.html"');
    });
  });
});