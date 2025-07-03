/**
 * Example: Customers API
 * This is a concrete example of how to use the templates
 * Shows how to create a real API for customer management
 */

import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerByEmail
} from '../database/customers.js';

import { 
  createMethodRouter,
  sendSuccess,
  sendError,
  validateRequiredFields,
  validateFieldTypes,
  validateStringLength,
  getIntParam,
  getStringParam
} from '../utils/api-helpers.js';

/**
 * Validation configuration for customers
 */
const VALIDATION_CONFIG = {
  requiredFields: ['name', 'email', 'phone'],
  fieldTypes: {
    name: 'string',
    email: 'email',
    phone: 'phone',
    address: 'string',
    notes: 'string'
  },
  stringLimits: {
    name: 100,
    email: 255,
    phone: 15,
    address: 255,
    notes: 500
  }
};

/**
 * Handle GET requests
 * GET /api/customers - Get all customers
 * GET /api/customers?id=123 - Get customer by ID
 * GET /api/customers?search=john - Search customers
 * GET /api/customers?email=john@example.com - Get customer by email
 */
async function handleGet(req, res) {
  try {
    const id = getIntParam(req, 'id');
    const search = getStringParam(req, 'search');
    const email = getStringParam(req, 'email');
    
    if (id) {
      // Get customer by ID
      const customer = getCustomerById(id);
      if (!customer) {
        return sendError(res, 404, 'Not Found', `Customer with ID ${id} not found`);
      }
      return sendSuccess(res, customer);
    } else if (search) {
      // Search customers
      const customers = searchCustomers(search);
      return sendSuccess(res, customers);
    } else if (email) {
      // Get customer by email
      const customer = getCustomerByEmail(email);
      if (!customer) {
        return sendError(res, 404, 'Not Found', `Customer with email ${email} not found`);
      }
      return sendSuccess(res, customer);
    } else {
      // Get all customers
      const customers = getAllCustomers();
      return sendSuccess(res, customers);
    }
  } catch (error) {
    console.error('Error in GET /api/customers:', error);
    throw error;
  }
}

/**
 * Handle POST requests
 * POST /api/customers - Create new customer
 */
async function handlePost(req, res) {
  const data = req.body;
  
  // Validate request body
  if (!data || typeof data !== 'object') {
    return sendError(res, 400, 'Bad Request', 'Request body must be a valid JSON object');
  }
  
  // Validate required fields
  const requiredErrors = validateRequiredFields(data, VALIDATION_CONFIG.requiredFields);
  if (requiredErrors.length > 0) {
    return sendError(res, 400, 'Validation Error', 'Missing required fields', requiredErrors);
  }
  
  // Validate field types
  const typeErrors = validateFieldTypes(data, VALIDATION_CONFIG.fieldTypes);
  if (typeErrors.length > 0) {
    return sendError(res, 400, 'Validation Error', 'Invalid field types', typeErrors);
  }
  
  // Validate string lengths
  const lengthErrors = validateStringLength(data, VALIDATION_CONFIG.stringLimits);
  if (lengthErrors.length > 0) {
    return sendError(res, 400, 'Validation Error', 'Field length validation failed', lengthErrors);
  }
  
  try {
    const newCustomer = createCustomer(data);
    return sendSuccess(res, newCustomer, 'Customer created successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      return sendError(res, 409, 'Conflict', error.message);
    }
    throw error;
  }
}

/**
 * Handle PUT requests
 * PUT /api/customers - Update existing customer
 */
async function handlePut(req, res) {
  const data = req.body;
  
  // Validate request body
  if (!data || typeof data !== 'object') {
    return sendError(res, 400, 'Bad Request', 'Request body must be a valid JSON object');
  }
  
  // ID is required for updates
  if (!data.id) {
    return sendError(res, 400, 'Bad Request', 'ID is required for updates');
  }
  
  // Check if customer exists
  const existingCustomer = getCustomerById(data.id);
  if (!existingCustomer) {
    return sendError(res, 404, 'Not Found', `Customer with ID ${data.id} not found`);
  }
  
  // Validate field types (only for provided fields)
  const typeErrors = validateFieldTypes(data, VALIDATION_CONFIG.fieldTypes);
  if (typeErrors.length > 0) {
    return sendError(res, 400, 'Validation Error', 'Invalid field types', typeErrors);
  }
  
  // Validate string lengths
  const lengthErrors = validateStringLength(data, VALIDATION_CONFIG.stringLimits);
  if (lengthErrors.length > 0) {
    return sendError(res, 400, 'Validation Error', 'Field length validation failed', lengthErrors);
  }
  
  try {
    const updatedCustomer = updateCustomer(data.id, data);
    return sendSuccess(res, updatedCustomer, 'Customer updated successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      return sendError(res, 409, 'Conflict', error.message);
    }
    throw error;
  }
}

/**
 * Handle DELETE requests
 * DELETE /api/customers - Delete customer
 */
async function handleDelete(req, res) {
  const data = req.body;
  
  if (!data || !data.id) {
    return sendError(res, 400, 'Bad Request', 'ID is required for deletion');
  }
  
  try {
    const deletedCustomer = deleteCustomer(data.id);
    if (!deletedCustomer) {
      return sendError(res, 404, 'Not Found', `Customer with ID ${data.id} not found`);
    }
    
    return sendSuccess(res, deletedCustomer, 'Customer deleted successfully');
  } catch (error) {
    throw error;
  }
}

/**
 * Create the API handler
 */
const handler = createMethodRouter({
  GET: handleGet,
  POST: handlePost,
  PUT: handlePut,
  DELETE: handleDelete
});

export default handler;

/**
 * USAGE EXAMPLES:
 * 
 * Frontend JavaScript class:
 * 
 * class CustomerAPI {
 *   constructor() {
 *     this.baseURL = '/api/customers';
 *   }
 * 
 *   async getAll() {
 *     const response = await fetch(this.baseURL);
 *     return response.json();
 *   }
 * 
 *   async getById(id) {
 *     const response = await fetch(`${this.baseURL}?id=${id}`);
 *     return response.json();
 *   }
 * 
 *   async search(query) {
 *     const response = await fetch(`${this.baseURL}?search=${encodeURIComponent(query)}`);
 *     return response.json();
 *   }
 * 
 *   async getByEmail(email) {
 *     const response = await fetch(`${this.baseURL}?email=${encodeURIComponent(email)}`);
 *     return response.json();
 *   }
 * 
 *   async create(customerData) {
 *     const response = await fetch(this.baseURL, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(customerData)
 *     });
 *     return response.json();
 *   }
 * 
 *   async update(customerData) {
 *     const response = await fetch(this.baseURL, {
 *       method: 'PUT',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(customerData)
 *     });
 *     return response.json();
 *   }
 * 
 *   async delete(id) {
 *     const response = await fetch(this.baseURL, {
 *       method: 'DELETE',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ id })
 *     });
 *     return response.json();
 *   }
 * }
 * 
 * // Usage
 * const customerAPI = new CustomerAPI();
 * 
 * // Get all customers
 * const customers = await customerAPI.getAll();
 * 
 * // Create new customer
 * const newCustomer = await customerAPI.create({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '555-1234',
 *   address: '123 Main St, Los Angeles, CA'
 * });
 * 
 * // Update customer
 * const updatedCustomer = await customerAPI.update({
 *   id: 1,
 *   name: 'Jane Doe',
 *   phone: '555-5678'
 * });
 * 
 * // Search customers
 * const searchResults = await customerAPI.search('john');
 * 
 * // Delete customer
 * const deletedCustomer = await customerAPI.delete(1);
 */