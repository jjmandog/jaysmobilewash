/**
 * Test Suite for Robots.txt Validation
 * Tests robots.txt format, hash URL blocking, and compliance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFile } from 'fs/promises';
import path from 'path';
import RobotsValidator from '../scripts/robots-validator.js';

describe('Robots.txt Validation', () => {
  let validator;
  const testRobotsPath = path.join(process.cwd(), 'robots.txt');

  beforeEach(() => {
    validator = new RobotsValidator({
      robotsPath: testRobotsPath,
      baseUrl: 'https://www.jaysmobilewash.net'
    });
  });

  describe('Hash URL Blocking', () => {
    it('should validate hash URL blocking patterns', async () => {
      const content = await readFile(testRobotsPath, 'utf-8');
      const result = validator.parseAndValidate(content);

      expect(result.hashBlocking.present).toBe(true);
      expect(result.hashBlocking.specific).toBe(true); // Disallow: /#
      expect(result.hashBlocking.general).toBe(true);  // Disallow: /*#*
    });

    it('should identify missing hash blocking', () => {
      const content = `
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://example.com/sitemap.xml
      `;
      const result = validator.parseAndValidate(content);

      expect(result.hashBlocking.present).toBe(false);
      expect(result.issues).toContain('Missing specific hash URL blocking (Disallow: /#)');
      expect(result.issues).toContain('Missing general hash URL blocking (Disallow: /*#*)');
    });
  });

  describe('Required Disallow Patterns', () => {
    it('should validate all required disallow patterns', async () => {
      const content = await readFile(testRobotsPath, 'utf-8');
      const result = validator.parseAndValidate(content);

      const requiredPatterns = ['/api/', '/admin/', '/*#*', '/#'];
      requiredPatterns.forEach(pattern => {
        const found = result.requiredDisallows.find(r => r.pattern === pattern);
        expect(found?.present).toBe(true);
      });
    });

    it('should identify missing required patterns', () => {
      const content = `
User-agent: *
Allow: /
Disallow: /private/
Sitemap: https://example.com/sitemap.xml
      `;
      const result = validator.parseAndValidate(content);

      expect(result.issues).toContain('Missing required disallow pattern: /api/');
      expect(result.issues).toContain('Missing required disallow pattern: /admin/');
      expect(result.issues).toContain('Missing required disallow pattern: /*#*');
      expect(result.issues).toContain('Missing required disallow pattern: /#');
    });
  });

  describe('Sitemap Validation', () => {
    it('should validate sitemap declarations', async () => {
      const content = await readFile(testRobotsPath, 'utf-8');
      const result = validator.parseAndValidate(content);

      expect(result.sitemaps.length).toBeGreaterThan(0);
      
      const requiredSitemaps = ['sitemap.xml', 'sitemap-services.xml', 'sitemap-locations.xml'];
      requiredSitemaps.forEach(sitemap => {
        const found = result.sitemapValidation.find(s => s.filename === sitemap);
        expect(found?.present).toBe(true);
      });
    });

    it('should validate sitemap URLs are absolute', () => {
      const content = `
User-agent: *
Allow: /
Sitemap: /sitemap.xml
Sitemap: https://example.com/sitemap.xml
      `;
      const result = validator.parseAndValidate(content);

      expect(result.issues).toContain('Sitemap URL should be absolute: /sitemap.xml');
    });

    it('should warn about non-HTTPS sitemaps', () => {
      const content = `
User-agent: *
Allow: /
Sitemap: http://example.com/sitemap.xml
      `;
      const result = validator.parseAndValidate(content);

      expect(result.warnings).toContain('Sitemap should use HTTPS: http://example.com/sitemap.xml');
    });
  });

  describe('User Agent Validation', () => {
    it('should validate user agent declarations', async () => {
      const content = await readFile(testRobotsPath, 'utf-8');
      const result = validator.parseAndValidate(content);

      expect(result.userAgentValidation.hasWildcard).toBe(true);
      expect(result.userAgents).toContain('*');
    });

    it('should warn about missing wildcard user agent', () => {
      const content = `
User-agent: Googlebot
Allow: /
Disallow: /admin/
      `;
      const result = validator.parseAndValidate(content);

      expect(result.warnings).toContain('Missing wildcard User-agent (*)');
    });
  });

  describe('Format Validation', () => {
    it('should identify empty directives', () => {
      const content = `
User-agent: *
Allow: 
Disallow: /admin/
Sitemap:
      `;
      const result = validator.parseAndValidate(content);

      // Check that empty directives are detected (line numbers may vary due to parsing)
      const hasEmptyDirectiveIssue = result.issues.some(issue => 
        issue.includes('Empty directive') && issue.includes('allow')
      );
      const hasSitemapIssue = result.issues.some(issue => 
        issue.includes('Empty directive') && issue.includes('sitemap')
      );
      
      expect(hasEmptyDirectiveIssue).toBe(true);
      expect(hasSitemapIssue).toBe(true);
    });

    it('should warn about duplicate user agents', () => {
      const content = `
User-agent: *
Allow: /
User-agent: *
Disallow: /admin/
      `;
      const result = validator.parseAndValidate(content);

      expect(result.warnings).toContain('Duplicate User-agent declaration: *');
    });
  });

  describe('Score Calculation', () => {
    it('should calculate perfect score for valid robots.txt', async () => {
      const content = await readFile(testRobotsPath, 'utf-8');
      const result = validator.parseAndValidate(content);

      // Should have high score with proper setup
      expect(result.scores.overall).toBeGreaterThanOrEqual(80);
      expect(result.scores.maxScore).toBe(100);
    });

    it('should penalize missing hash blocking heavily', () => {
      const content = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://example.com/sitemap.xml
      `;
      const result = validator.parseAndValidate(content);

      // Should lose 30 points for missing hash blocking
      expect(result.scores.overall).toBeLessThanOrEqual(70);
    });

    it('should penalize missing sitemaps', () => {
      const content = `
User-agent: *
Allow: /
Disallow: /#
Disallow: /*#*
Disallow: /api/
Disallow: /admin/
      `;
      const result = validator.parseAndValidate(content);

      // Should lose points for missing sitemaps
      expect(result.scores.overall).toBeLessThanOrEqual(80);
    });
  });

  describe('Directive Parsing', () => {
    it('should parse directives correctly', () => {
      const directive = validator.parseDirective('User-agent: *', 1);
      expect(directive).toEqual({
        type: 'user-agent',
        value: '*',
        lineNumber: 1,
        originalLine: 'User-agent: *'
      });
    });

    it('should handle malformed directives', () => {
      const directive = validator.parseDirective('Invalid line without colon', 1);
      expect(directive).toBeNull();
    });

    it('should trim whitespace in values', () => {
      const directive = validator.parseDirective('Disallow:  /admin/  ', 1);
      expect(directive.value).toBe('/admin/');
    });
  });

  describe('Recommendations', () => {
    it('should generate high priority recommendations for hash blocking', () => {
      const result = {
        hashBlocking: { specific: false, general: false },
        requiredDisallows: [],
        sitemaps: ['https://example.com/sitemap.xml'],
        issues: [],
        warnings: []
      };
      
      const recommendations = validator.generateRecommendations(result);
      const hashRecommendations = recommendations.filter(r => 
        r.issue.includes('hash URL blocking')
      );
      
      expect(hashRecommendations.length).toBeGreaterThan(0);
      expect(hashRecommendations[0].priority).toBe('high');
    });

    it('should sort recommendations by priority', () => {
      const result = {
        hashBlocking: { specific: false, general: true },
        requiredDisallows: [
          { pattern: '/api/', present: false },
          { pattern: '/admin/', present: true }
        ],
        sitemaps: [],
        issues: [],
        warnings: []
      };
      
      const recommendations = validator.generateRecommendations(result);
      
      // High priority items should come first
      expect(recommendations[0].priority).toBe('high');
    });
  });

  describe('Integration Test', () => {
    it('should validate actual robots.txt file successfully', async () => {
      const isValid = await validator.validateRobots();
      
      // The actual robots.txt should pass validation
      expect(isValid).toBe(true);
    });
  });

  describe('Static File Configuration', () => {
    it('should have robots.txt in the root directory for Netlify deployment', async () => {
      const rootRobotsPath = path.join(process.cwd(), 'robots.txt');
      
      const rootContent = await readFile(rootRobotsPath, 'utf-8');
      
      expect(rootContent).toContain('# Robots.txt for Jay\'s Mobile Wash');
      expect(rootContent).toContain('Disallow: /#');
      expect(rootContent).toContain('Disallow: /*#*');
      expect(rootContent).toContain('User-agent: *');
    });
  });
});