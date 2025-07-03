/**
 * Integration tests for the Services API endpoint
 * Tests all CRUD operations, validation, error handling, and CORS functionality
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabaseForTests, closeDatabase } from '../database/connection.js';

// Import the handler function
import handler from '../api/services.js';

describe('Services API Endpoint - Integration Tests', () => {
  // Reset database state before each test
  beforeEach(() => {
    resetDatabaseForTests();
  });

  // Clean up after all tests
  afterAll(() => {
    closeDatabase();
  });
  // Mock request and response objects
  function createMockReq(method = 'GET', body) {
    return {
      method,
      body
    };
  }

  function createMockRes() {
    const res = {
      statusCode: 200,
      headers: {},
      data: null
    };

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.json = (data) => {
      res.data = data;
      return res;
    };

    res.setHeader = (key, value) => {
      res.headers[key] = value;
      return res;
    };

    return res;
  }

  describe('CORS Handling', () => {
    it('should handle OPTIONS preflight requests', async () => {
      const req = createMockReq('OPTIONS', {});
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(res.headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(res.headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization');
    });

    it('should set CORS headers on all responses', async () => {
      const req = createMockReq('GET', {});
      const res = createMockRes();

      await handler(req, res);

      expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(res.headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(res.headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization');
    });
  });

  describe('GET /api/services - List all services', () => {
    it('should return all services successfully', async () => {
      const req = createMockReq('GET', {});
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('success', true);
      expect(res.data).toHaveProperty('data');
      expect(res.data).toHaveProperty('count');
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.count).toBe(res.data.data.length);
    });

    it('should return services with correct structure', async () => {
      const req = createMockReq('GET', {});
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      if (res.data.data.length > 0) {
        const service = res.data.data[0];
        expect(service).toHaveProperty('id');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('description');
        expect(service).toHaveProperty('price');
        expect(typeof service.id).toBe('number');
        expect(typeof service.name).toBe('string');
        expect(typeof service.description).toBe('string');
        expect(typeof service.price).toBe('number');
      }
    });
  });

  describe('POST /api/services - Create new service', () => {
    it('should create a new service successfully', async () => {
      const newService = {
        name: 'Test Service',
        description: 'Test service description',
        price: 50.00
      };

      const req = createMockReq('POST', newService);
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.data).toHaveProperty('success', true);
      expect(res.data).toHaveProperty('message', 'Service created successfully');
      expect(res.data).toHaveProperty('data');
      expect(res.data.data).toHaveProperty('id');
      expect(res.data.data.name).toBe(newService.name);
      expect(res.data.data.description).toBe(newService.description);
      expect(res.data.data.price).toBe(newService.price);
    });

    it('should validate required fields', async () => {
      const req = createMockReq('POST', {});
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('error', 'Validation Error');
      expect(res.data).toHaveProperty('details');
      expect(Array.isArray(res.data.details)).toBe(true);
    });

    it('should validate name field', async () => {
      const req = createMockReq('POST', {
        name: '',
        description: 'Valid description',
        price: 25.00
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.details).toContain('name cannot be empty');
    });

    it('should validate price field', async () => {
      const req = createMockReq('POST', {
        name: 'Valid Name',
        description: 'Valid description',
        price: 'invalid'
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.details.some(detail => detail.includes('price must be a valid number'))).toBe(true);
    });

    it('should validate negative price', async () => {
      const req = createMockReq('POST', {
        name: 'Valid Name',
        description: 'Valid description',
        price: -10.00
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.details).toContain('price must be non-negative');
    });

    it('should validate name length', async () => {
      const req = createMockReq('POST', {
        name: 'a'.repeat(101),
        description: 'Valid description',
        price: 25.00
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.details).toContain('name must be 100 characters or less');
    });

    it('should validate description length', async () => {
      const req = createMockReq('POST', {
        name: 'Valid Name',
        description: 'a'.repeat(501),
        price: 25.00
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.details).toContain('description must be 500 characters or less');
    });

    it('should validate maximum price', async () => {
      const req = createMockReq('POST', {
        name: 'Valid Name',
        description: 'Valid description',
        price: 10000.00
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data.details).toContain('price must be less than $10,000');
    });

    it('should prevent duplicate service names', async () => {
      // First, create a service
      const service1 = {
        name: 'Unique Service',
        description: 'First description',
        price: 30.00
      };

      const req1 = createMockReq('POST', service1);
      const res1 = createMockRes();

      await handler(req1, res1);
      expect(res1.statusCode).toBe(201);

      // Then try to create another with the same name
      const service2 = {
        name: 'Unique Service',
        description: 'Second description',
        price: 40.00
      };

      const req2 = createMockReq('POST', service2);
      const res2 = createMockRes();

      await handler(req2, res2);

      expect(res2.statusCode).toBe(409);
      expect(res2.data).toHaveProperty('error', 'Conflict');
      expect(res2.data.message).toContain('service with this name already exists');
    });

    it('should handle invalid JSON body', async () => {
      const req = createMockReq('POST', null);
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('error', 'Bad Request');
    });
  });

  describe('PUT /api/services - Update service', () => {
    it('should update an existing service successfully', async () => {
      // First create a service
      const newService = {
        name: 'Service to Update',
        description: 'Original description',
        price: 45.00
      };

      const createReq = createMockReq('POST', newService);
      const createRes = createMockRes();
      await handler(createReq, createRes);

      const createdService = createRes.data.data;

      // Then update it
      const updateData = {
        id: createdService.id,
        name: 'Updated Service Name',
        price: 55.00
      };

      const updateReq = createMockReq('PUT', updateData);
      const updateRes = createMockRes();

      await handler(updateReq, updateRes);

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.data).toHaveProperty('success', true);
      expect(updateRes.data).toHaveProperty('message', 'Service updated successfully');
      expect(updateRes.data.data.name).toBe(updateData.name);
      expect(updateRes.data.data.price).toBe(updateData.price);
      expect(updateRes.data.data.description).toBe(newService.description); // Should remain unchanged
    });

    it('should require service ID for updates', async () => {
      const req = createMockReq('PUT', {
        name: 'Updated Name'
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('error', 'Bad Request');
      expect(res.data.message).toContain('Service ID is required');
    });

    it('should return 404 for non-existent service', async () => {
      const req = createMockReq('PUT', {
        id: 99999,
        name: 'Updated Name'
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data).toHaveProperty('error', 'Not Found');
    });

    it('should validate updated fields', async () => {
      // First create a service
      const newService = {
        name: 'Service for Validation Test',
        description: 'Original description',
        price: 45.00
      };

      const createReq = createMockReq('POST', newService);
      const createRes = createMockRes();
      await handler(createReq, createRes);

      const createdService = createRes.data.data;

      // Try to update with invalid data
      const updateReq = createMockReq('PUT', {
        id: createdService.id,
        price: 'invalid'
      });
      const updateRes = createMockRes();

      await handler(updateReq, updateRes);

      expect(updateRes.statusCode).toBe(400);
      expect(updateRes.data).toHaveProperty('error', 'Validation Error');
    });

    it('should prevent duplicate names during update', async () => {
      // Create two services
      const service1 = {
        name: 'First Service',
        description: 'First description',
        price: 30.00
      };

      const service2 = {
        name: 'Second Service',
        description: 'Second description',
        price: 40.00
      };

      const req1 = createMockReq('POST', service1);
      const res1 = createMockRes();
      await handler(req1, res1);

      const req2 = createMockReq('POST', service2);
      const res2 = createMockRes();
      await handler(req2, res2);

      // Try to update second service to have the same name as first
      const updateReq = createMockReq('PUT', {
        id: res2.data.data.id,
        name: 'First Service'
      });
      const updateRes = createMockRes();

      await handler(updateReq, updateRes);

      expect(updateRes.statusCode).toBe(409);
      expect(updateRes.data).toHaveProperty('error', 'Conflict');
    });
  });

  describe('DELETE /api/services - Delete service', () => {
    it('should delete an existing service successfully', async () => {
      // First create a service
      const newService = {
        name: 'Service to Delete',
        description: 'Will be deleted',
        price: 35.00
      };

      const createReq = createMockReq('POST', newService);
      const createRes = createMockRes();
      await handler(createReq, createRes);

      const createdService = createRes.data.data;

      // Then delete it
      const deleteReq = createMockReq('DELETE', { id: createdService.id });
      const deleteRes = createMockRes();

      await handler(deleteReq, deleteRes);

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.data).toHaveProperty('success', true);
      expect(deleteRes.data).toHaveProperty('message', 'Service deleted successfully');
      expect(deleteRes.data.data.id).toBe(createdService.id);
    });

    it('should require service ID for deletion', async () => {
      const req = createMockReq('DELETE', {});
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('error', 'Bad Request');
      expect(res.data.message).toContain('Service ID is required');
    });

    it('should return 404 for non-existent service', async () => {
      const req = createMockReq('DELETE', { id: 99999 });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.data).toHaveProperty('error', 'Not Found');
    });
  });

  describe('HTTP Method Validation', () => {
    it('should return 405 for unsupported methods', async () => {
      const req = createMockReq('PATCH', {});
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(405);
      expect(res.data).toHaveProperty('error', 'Method not allowed');
      expect(res.data.message).toContain('Only GET, POST, PUT, and DELETE');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body gracefully', async () => {
      const req = createMockReq('POST', 'invalid json');
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('error', 'Bad Request');
    });

    it('should handle empty request body for POST', async () => {
      const req = createMockReq('POST', undefined);
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('error', 'Bad Request');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain service count consistency across operations', async () => {
      // Get initial count
      const getReq1 = createMockReq('GET', {});
      const getRes1 = createMockRes();
      await handler(getReq1, getRes1);
      const initialCount = getRes1.data.count;

      // Add a service
      const createReq = createMockReq('POST', {
        name: 'Consistency Test Service',
        description: 'Test description',
        price: 25.00
      });
      const createRes = createMockRes();
      await handler(createReq, createRes);

      // Check count increased
      const getReq2 = createMockReq('GET', {});
      const getRes2 = createMockRes();
      await handler(getReq2, getRes2);
      expect(getRes2.data.count).toBe(initialCount + 1);

      // Delete the service
      const deleteReq = createMockReq('DELETE', { id: createRes.data.data.id });
      const deleteRes = createMockRes();
      await handler(deleteReq, deleteRes);

      // Check count returned to original
      const getReq3 = createMockReq('GET', {});
      const getRes3 = createMockRes();
      await handler(getReq3, getRes3);
      expect(getRes3.data.count).toBe(initialCount);
    });
  });
});