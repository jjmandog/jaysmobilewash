/**
 * Tailwind CSS Integration Tests
 * Tests to ensure Tailwind CSS is properly integrated without CDN
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Tailwind CSS Integration', () => {
  let dom;
  let document;

  beforeEach(async () => {
    // Load the actual index.html file
    const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
    dom = new JSDOM(htmlContent);
    document = dom.window.document;
  });

  describe('CDN Removal Validation', () => {
    it('should not reference Tailwind CDN', () => {
      const scriptTags = document.querySelectorAll('script[src]');
      const scripts = Array.from(scriptTags).map(script => script.src);
      
      expect(scripts.some(src => src.includes('cdn.tailwindcss.com'))).toBe(false);
    });

    it('should reference local Tailwind CSS file', () => {
      const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
      const stylesheets = Array.from(linkTags).map(link => link.getAttribute('href'));
      
      expect(stylesheets.some(href => href === 'dist/tailwind.css')).toBe(true);
    });

    it('should have built Tailwind CSS file', () => {
      const filePath = path.join(process.cwd(), 'dist', 'tailwind.css');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Check file has content (should be more than just empty directives)
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(1000); // Built CSS should be substantial
    });

    it('should have Tailwind directives in source CSS', () => {
      const filePath = path.join(process.cwd(), 'src', 'tailwind.css');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('@tailwind base');
      expect(content).toContain('@tailwind components');
      expect(content).toContain('@tailwind utilities');
    });
  });

  describe('All HTML Files Validation', () => {
    const htmlFiles = [
      'index.html',
      'about.html', 
      'products.html',
      'privacy.html',
      'terms.html'
    ];

    htmlFiles.forEach(filename => {
      it(`should not use Tailwind CDN in ${filename}`, () => {
        if (fs.existsSync(path.join(process.cwd(), filename))) {
          const content = fs.readFileSync(path.join(process.cwd(), filename), 'utf-8');
          expect(content).not.toContain('cdn.tailwindcss.com');
        }
      });

      it(`should reference local Tailwind CSS in ${filename}`, () => {
        if (fs.existsSync(path.join(process.cwd(), filename))) {
          const content = fs.readFileSync(path.join(process.cwd(), filename), 'utf-8');
          expect(content).toContain('dist/tailwind.css');
        }
      });
    });
  });

  describe('Build Configuration', () => {
    it('should have tailwind.config.js', () => {
      const filePath = path.join(process.cwd(), 'tailwind.config.js');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have postcss.config.js', () => {
      const filePath = path.join(process.cwd(), 'postcss.config.js');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have build:css script in package.json', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(packageContent.scripts['build:css']).toBeDefined();
      expect(packageContent.scripts['build:css']).toContain('postcss');
    });

    it('should have Tailwind CSS and PostCSS dependencies', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(packageContent.devDependencies['tailwindcss']).toBeDefined();
      expect(packageContent.devDependencies['postcss']).toBeDefined();
      expect(packageContent.devDependencies['autoprefixer']).toBeDefined();
      expect(packageContent.devDependencies['@tailwindcss/postcss']).toBeDefined();
    });
  });
});