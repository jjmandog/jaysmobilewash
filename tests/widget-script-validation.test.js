/**
 * Widget Script Validation Tests
 * Tests to ensure script files are properly referenced and loaded
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Widget Script Validation', () => {
  let dom;
  let document;
  let window;

  beforeEach(async () => {
    // Load the actual index.html file
    const htmlContent = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
    dom = new JSDOM(htmlContent, {
      url: 'http://localhost',
      runScripts: 'outside-only',
      resources: 'usable'
    });
    document = dom.window.document;
    window = dom.window;
  });

  describe('Script Tag Validation', () => {
    it('should not reference missing trainableBaseTemplate.js', () => {
      const scriptTags = document.querySelectorAll('script[src]');
      const scripts = Array.from(scriptTags).map(script => script.src);
      
      expect(scripts.some(src => src.includes('trainableBaseTemplate.js'))).toBe(false);
    });

    it('should not reference missing chatWidget.js', () => {
      const scriptTags = document.querySelectorAll('script[src]');
      const scripts = Array.from(scriptTags).map(script => script.src);
      
      expect(scripts.some(src => src.includes('chatWidget.js'))).toBe(false);
    });

    it('should not reference missing aiTrainingInterface.js', () => {
      const scriptTags = document.querySelectorAll('script[src]');
      const scripts = Array.from(scriptTags).map(script => script.src);
      
      expect(scripts.some(src => src.includes('aiTrainingInterface.js'))).toBe(false);
    });

    it('should reference main.js', () => {
      const scriptTags = document.querySelectorAll('script[src]');
      const scripts = Array.from(scriptTags).map(script => script.getAttribute('src'));
      
      expect(scripts.some(src => src === 'main.js')).toBe(true);
    });

    it('should reference chatbot-handler.js', () => {
      const scriptTags = document.querySelectorAll('script[src]');
      const scripts = Array.from(scriptTags).map(script => script.getAttribute('src'));
      
      expect(scripts.some(src => src === 'chatbot-handler.js')).toBe(true);
    });

    it('should reference spa-seo-head-manager.js', () => {
      const scriptTags = document.querySelectorAll('script[src]');
      const scripts = Array.from(scriptTags).map(script => script.getAttribute('src'));
      
      expect(scripts.some(src => src === 'spa-seo-head-manager.js')).toBe(true);
    });
  });

  describe('File Existence Validation', () => {
    it('should have main.js file exist', () => {
      const filePath = path.join(process.cwd(), 'main.js');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have chatbot-handler.js file exist', () => {
      const filePath = path.join(process.cwd(), 'chatbot-handler.js');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have spa-seo-head-manager.js file exist', () => {
      const filePath = path.join(process.cwd(), 'spa-seo-head-manager.js');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should not have trainableBaseTemplate.js file', () => {
      const filePath = path.join(process.cwd(), 'trainableBaseTemplate.js');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should not have chatWidget.js file', () => {
      const filePath = path.join(process.cwd(), 'chatWidget.js');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should not have aiTrainingInterface.js file', () => {
      const filePath = path.join(process.cwd(), 'aiTrainingInterface.js');
      expect(fs.existsSync(filePath)).toBe(false);
    });
  });
});