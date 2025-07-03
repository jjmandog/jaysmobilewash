/**
 * Test for Customers API
 * This shows how to test your new APIs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resetDatabaseForTests, closeDatabase } from '../database/connection.js';
import customersHandler from '../api/customers.js';

// Mock request/response objects for testing
function createMockRequest(method, body = null, query = {}) {
  return {
    method,
    body,
    query
  };
}

function createMockResponse() {
  const response = {
    statusCode: 200,
    headers: {},
    body: null,
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    
    json(data) {
      this.body = data;
      return this;
    }
  };
  
  return response;
}

describe('Customers API', () => {
  beforeEach(() => {
    resetDatabaseForTests();
  });
  
  describe('POST /api/customers', () => {
    it('should create a new customer successfully', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
        address: '123 Main St, Los Angeles, CA',
        notes: 'Regular customer'
      };
      
      const req = createMockRequest('POST', customerData);
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Customer created successfully');
      expect(res.body.data.name).toBe('John Doe');
      expect(res.body.data.email).toBe('john@example.com');
      expect(res.body.data.id).toBeDefined();
    });
    
    it('should reject customer with missing required fields', async () => {
      const customerData = {
        name: 'John Doe',
        // Missing email and phone
      };
      
      const req = createMockRequest('POST', customerData);
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details).toContain('email is required');
      expect(res.body.details).toContain('phone is required');
    });
    
    it('should reject customer with invalid email', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '555-123-4567'
      };
      
      const req = createMockRequest('POST', customerData);
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details).toContain('email must be a valid email address');
    });
    
    it('should reject duplicate email', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      };
      
      // Create first customer
      const req1 = createMockRequest('POST', customerData);
      const res1 = createMockResponse();
      await customersHandler(req1, res1);
      
      // Try to create second customer with same email
      const req2 = createMockRequest('POST', customerData);
      const res2 = createMockResponse();
      await customersHandler(req2, res2);
      
      expect(res2.statusCode).toBe(409);
      expect(res2.body.success).toBe(false);
      expect(res2.body.error).toBe('Conflict');
      expect(res2.body.message).toContain('already exists');
    });
  });
  
  describe('GET /api/customers', () => {
    it('should get all customers', async () => {
      // Create test customers
      const customer1 = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      };
      const customer2 = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-567-8901'
      };
      
      // Create customers
      await customersHandler(createMockRequest('POST', customer1), createMockResponse());
      await customersHandler(createMockRequest('POST', customer2), createMockResponse());
      
      // Get all customers
      const req = createMockRequest('GET');
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe('Jane Smith'); // Ordered by name
      expect(res.body.data[1].name).toBe('John Doe');
    });
    
    it('should get customer by ID', async () => {
      // Create test customer
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      };
      
      const createReq = createMockRequest('POST', customerData);
      const createRes = createMockResponse();
      await customersHandler(createReq, createRes);
      
      const customerId = createRes.body.data.id;
      
      // Get customer by ID
      const req = createMockRequest('GET', null, { id: customerId });
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(customerId);
      expect(res.body.data.name).toBe('John Doe');
    });
    
    it('should return 404 for non-existent customer', async () => {
      const req = createMockRequest('GET', null, { id: 999 });
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not Found');
    });
    
    it('should search customers', async () => {
      // Create test customers
      const customer1 = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      };
      const customer2 = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-567-8901'
      };
      
      await customersHandler(createMockRequest('POST', customer1), createMockResponse());
      await customersHandler(createMockRequest('POST', customer2), createMockResponse());
      
      // Search for "john"
      const req = createMockRequest('GET', null, { search: 'john' });
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('John Doe');
    });
  });
  
  describe('PUT /api/customers', () => {
    it('should update customer successfully', async () => {
      // Create test customer
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      };
      
      const createReq = createMockRequest('POST', customerData);
      const createRes = createMockResponse();
      await customersHandler(createReq, createRes);
      
      const customerId = createRes.body.data.id;
      
      // Update customer
      const updateData = {
        id: customerId,
        name: 'John Updated',
        phone: '555-999-0000'
      };
      
      const req = createMockRequest('PUT', updateData);
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Customer updated successfully');
      expect(res.body.data.name).toBe('John Updated');
      expect(res.body.data.phone).toBe('555-999-0000');
      expect(res.body.data.email).toBe('john@example.com'); // Should remain unchanged
    });
    
    it('should return 404 for non-existent customer update', async () => {
      const updateData = {
        id: 999,
        name: 'Non-existent'
      };
      
      const req = createMockRequest('PUT', updateData);
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not Found');
    });
  });
  
  describe('DELETE /api/customers', () => {
    it('should delete customer successfully', async () => {
      // Create test customer
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      };
      
      const createReq = createMockRequest('POST', customerData);
      const createRes = createMockResponse();
      await customersHandler(createReq, createRes);
      
      const customerId = createRes.body.data.id;
      
      // Delete customer
      const req = createMockRequest('DELETE', { id: customerId });
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Customer deleted successfully');
      expect(res.body.data.id).toBe(customerId);
    });
    
    it('should return 404 for non-existent customer deletion', async () => {
      const req = createMockRequest('DELETE', { id: 999 });
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not Found');
    });
  });
  
  describe('CORS handling', () => {
    it('should handle OPTIONS requests', async () => {
      const req = createMockRequest('OPTIONS');
      const res = createMockResponse();
      
      await customersHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(res.headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(res.headers['Access-Control-Allow-Methods']).toContain('POST');
    });
  });
});

// Clean up after tests
process.on('exit', () => {
  closeDatabase();
});