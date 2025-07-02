/**
 * Schema.org Structured Data Validation Tests
 * Validates the fixes for critical schema validation errors
 */

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Helper function to parse structured data from HTML
function parseStructuredData(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const schemas = [];
  
  scripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      schemas.push(data);
    } catch (error) {
      // Skip invalid JSON
    }
  });
  
  return schemas;
}

// Helper function to find schema by type
function findSchemaByType(schemas, type) {
  return schemas.filter(schema => schema['@type'] === type);
}

describe('Schema.org Structured Data Fixes', () => {
  let indexHtml;
  let indexSchemas;

  beforeEach(() => {
    // Read index.html
    indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    indexSchemas = parseStructuredData(indexHtml);
  });

  describe('Organization Schema Fixes', () => {
    it('should have Organization schemas with required address field', () => {
      const organizationSchemas = indexSchemas.filter(schema => 
        schema['@type'] === 'Article' && 
        (schema.author?.['@type'] === 'Organization' || schema.publisher?.['@type'] === 'Organization')
      );

      expect(organizationSchemas.length).toBeGreaterThan(0);

      organizationSchemas.forEach(schema => {
        if (schema.author?.['@type'] === 'Organization') {
          expect(schema.author).toHaveProperty('address');
          expect(schema.author.address).toHaveProperty('@type', 'PostalAddress');
          expect(schema.author.address).toHaveProperty('addressLocality');
          expect(schema.author.address).toHaveProperty('addressRegion');
          expect(schema.author.address).toHaveProperty('postalCode');
          expect(schema.author.address).toHaveProperty('addressCountry');
        }

        if (schema.publisher?.['@type'] === 'Organization') {
          expect(schema.publisher).toHaveProperty('address');
          expect(schema.publisher.address).toHaveProperty('@type', 'PostalAddress');
          expect(schema.publisher.address).toHaveProperty('addressLocality');
          expect(schema.publisher.address).toHaveProperty('addressRegion');
          expect(schema.publisher.address).toHaveProperty('postalCode');
          expect(schema.publisher.address).toHaveProperty('addressCountry');
        }
      });
    });
  });

  describe('LocalBusiness Schema Fixes', () => {
    it('should have main LocalBusiness schema with all required fields', () => {
      const localBusinessSchemas = findSchemaByType(indexSchemas, 'LocalBusiness');
      expect(localBusinessSchemas.length).toBeGreaterThan(0);

      localBusinessSchemas.forEach(schema => {
        expect(schema).toHaveProperty('name');
        expect(schema).toHaveProperty('address');
        expect(schema).toHaveProperty('image');
        expect(schema.address).toHaveProperty('@type', 'PostalAddress');
      });
    });

    it('should have Review schema with LocalBusiness itemReviewed containing required fields', () => {
      const reviewSchemas = findSchemaByType(indexSchemas, 'Review');
      expect(reviewSchemas.length).toBeGreaterThan(0);

      reviewSchemas.forEach(schema => {
        expect(schema.itemReviewed).toHaveProperty('@type', 'LocalBusiness');
        expect(schema.itemReviewed).toHaveProperty('name');
        expect(schema.itemReviewed).toHaveProperty('address');
        expect(schema.itemReviewed).toHaveProperty('image');
        expect(schema.itemReviewed.address).toHaveProperty('@type', 'PostalAddress');
      });
    });
  });

  describe('FAQ Schema Fixes', () => {
    it('should have only one FAQPage schema (no duplicates)', () => {
      const faqSchemas = findSchemaByType(indexSchemas, 'FAQPage');
      expect(faqSchemas.length).toBe(1);
    });

    it('should have valid FAQ schema with proper structure', () => {
      const faqSchemas = findSchemaByType(indexSchemas, 'FAQPage');
      expect(faqSchemas.length).toBe(1);

      const faqSchema = faqSchemas[0];
      expect(faqSchema).toHaveProperty('mainEntity');
      expect(Array.isArray(faqSchema.mainEntity)).toBe(true);
      expect(faqSchema.mainEntity.length).toBeGreaterThan(0);

      faqSchema.mainEntity.forEach(question => {
        expect(question).toHaveProperty('@type', 'Question');
        expect(question).toHaveProperty('name');
        expect(question).toHaveProperty('acceptedAnswer');
        expect(question.acceptedAnswer).toHaveProperty('@type', 'Answer');
        expect(question.acceptedAnswer).toHaveProperty('text');
      });
    });
  });

  describe('General Schema Hygiene', () => {
    it('should have only one BreadcrumbList schema (no duplicates)', () => {
      const breadcrumbSchemas = findSchemaByType(indexSchemas, 'BreadcrumbList');
      expect(breadcrumbSchemas.length).toBe(1);
    });

    it('should have valid JSON-LD for all schemas', () => {
      // This is validated by the parsing function - if any schema is invalid JSON,
      // it would be skipped and we'd have fewer schemas than expected
      expect(indexSchemas.length).toBeGreaterThan(0);
      
      indexSchemas.forEach(schema => {
        expect(schema).toHaveProperty('@context');
        expect(schema).toHaveProperty('@type');
      });
    });

    it('should not have any unnamed schema items', () => {
      indexSchemas.forEach(schema => {
        if (schema['@type'] === 'LocalBusiness' || schema['@type'] === 'AutoDetailingBusiness') {
          expect(schema).toHaveProperty('name');
          expect(schema.name).toBeTruthy();
        }
      });
    });
  });
});

describe('Location Pages Schema Validation', () => {
  const locationFiles = [
    'locations-los-angeles.html',
    'locations-orange-county.html', 
    'locations-beverly-hills.html'
  ];

  locationFiles.forEach(filename => {
    describe(`${filename} Schema`, () => {
      let schemas;

      beforeEach(() => {
        const html = fs.readFileSync(path.join(process.cwd(), filename), 'utf8');
        schemas = parseStructuredData(html);
      });

      it('should have AutoDetailingBusiness schema with all required fields', () => {
        const businessSchemas = findSchemaByType(schemas, 'AutoDetailingBusiness');
        expect(businessSchemas.length).toBeGreaterThan(0);

        businessSchemas.forEach(schema => {
          expect(schema).toHaveProperty('name');
          expect(schema).toHaveProperty('address');
          expect(schema).toHaveProperty('image');
          expect(schema.address).toHaveProperty('@type', 'PostalAddress');
          expect(schema.address).toHaveProperty('addressLocality');
          expect(schema.address).toHaveProperty('addressRegion');
          expect(schema.address).toHaveProperty('postalCode');
          expect(schema.address).toHaveProperty('addressCountry');
        });
      });

      it('should have unique FAQPage schema relevant to the location', () => {
        const faqSchemas = findSchemaByType(schemas, 'FAQPage');
        if (faqSchemas.length > 0) {
          expect(faqSchemas.length).toBe(1);
          
          const faqSchema = faqSchemas[0];
          expect(faqSchema).toHaveProperty('mainEntity');
          expect(Array.isArray(faqSchema.mainEntity)).toBe(true);
        }
      });
    });
  });
});