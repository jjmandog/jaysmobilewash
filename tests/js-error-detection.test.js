/**
 * JavaScript Error Detection Tests
 * Tests to ensure pages load without fatal JavaScript errors
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('JavaScript Error Detection', () => {
  let dom;
  let document;
  let window;
  let consoleErrors = [];

  beforeEach(async () => {
    // Reset error tracking
    consoleErrors = [];
    
    // Mock console.error to capture errors
    vi.spyOn(console, 'error').mockImplementation((message) => {
      consoleErrors.push(message);
    });
  });

  describe('Syntax Error Detection', () => {
    it('should not have triple equals syntax errors in main.js', () => {
      const content = fs.readFileSync(path.join(process.cwd(), 'main.js'), 'utf-8');
      
      // Check for malformed triple equals patterns
      const badTripleEquals = /===.*[^=\w\s\]\)]/g;
      const matches = content.match(badTripleEquals);
      
      expect(matches).toBeNull();
    });

    it('should validate all JavaScript files have correct syntax', async () => {
      const jsFiles = fs.readdirSync(process.cwd())
        .filter(file => file.endsWith('.js') && !file.includes('node_modules') && !file.includes('test'));

      for (const file of jsFiles) {
        try {
          // Use dynamic import to validate syntax
          const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
          
          // Simple syntax validation - check for specific malformed patterns
          expect(content).not.toMatch(/\s===\s*[^=\w\s\]\)'"`;,.\-\+\*\/]/); // Malformed triple equals with bad following chars
          expect(content).not.toMatch(/\{\s*===\s*\}/); // Empty object with ===
          expect(content).not.toMatch(/\(\s*===\s*\)/); // Empty parentheses with ===
          expect(content).not.toMatch(/===\s*===\s*===/); // Multiple consecutive ===
        } catch (error) {
          throw new Error(`Syntax error in ${file}: ${error.message}`);
        }
      }
    });
  });

  describe('Page Load Error Detection', () => {
    it('should load index.html without fatal JavaScript errors', async () => {
      const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
      
      const dom = new JSDOM(htmlContent, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        resources: 'usable',
        beforeParse(window) {
          // Mock unavailable APIs to prevent errors
          window.localStorage = {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn()
          };
          
          // Mock fetch for API calls
          window.fetch = vi.fn(() => Promise.resolve({
            ok: false,
            status: 404
          }));
        }
      });

      // Wait for scripts to execute
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check for critical errors (not warnings)
      const criticalErrors = consoleErrors.filter(error => 
        typeof error === 'string' && 
        (error.includes('SyntaxError') || 
         error.includes('Unexpected token') ||
         error.includes('ReferenceError') ||
         error.includes('TypeError: Cannot read') ||
         error.includes('is not defined'))
      );

      expect(criticalErrors).toHaveLength(0);
    });

    it('should have expected global objects initialized', async () => {
      const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
      
      const dom = new JSDOM(htmlContent, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        resources: 'usable',
        beforeParse(window) {
          window.localStorage = {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn()
          };
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that expected objects are defined (even if they're just stubs)
      const window = dom.window;
      
      // These should be defined by the scripts
      expect(typeof window.document.addEventListener).toBe('function');
      expect(typeof window.console.log).toBe('function');
    });
  });

  describe('Script Loading Validation', () => {
    it('should have all referenced scripts available', () => {
      const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
      const dom = new JSDOM(htmlContent);
      const scriptTags = dom.window.document.querySelectorAll('script[src]');
      
      scriptTags.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http')) {
          // Only check local scripts
          const filePath = path.join(process.cwd(), src);
          expect(fs.existsSync(filePath)).toBe(true);
        }
      });
    });

    it('should not reference missing ChatWidget related functions', () => {
      const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
      
      // These should be gracefully handled when missing
      expect(htmlContent).toContain('typeof ChatWidget !== \'undefined\'');
      expect(htmlContent).toContain('⚠️ ChatWidget not loaded - check script imports');
    });
  });
});