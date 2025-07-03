/**
 * Full CRUD API Template
 * Use this template for complete Create, Read, Update, Delete operations
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to api/your-api-name.js
 * 2. Replace "TEMPLATE" with your actual data name (e.g., "customers", "appointments")
 * 3. Update the database import path
 * 4. Customize validation rules
 * 5. Test your API
 */

import {
  getAllTEMPLATES,      // Replace with your function name
  getTEMPLATEById,      // Replace with your function name  
  createTEMPLATE,       // Replace with your function name
  updateTEMPLATE,       // Replace with your function name
  deleteTEMPLATE,       // Replace with your function name
  getTEMPLATEsCount,    // Replace with your function name (optional)
} from '../database/TEMPLATE.js';  // Replace with your database file

import { 
  createCRUDHandlers,
  createMethodRouter
} from '../utils/api-helpers.js';

/**
 * Validation configuration for your data
 * Update these to match your data structure
 */
const VALIDATION_CONFIG = {
  requiredFields: ['name'],  // Replace with your required fields
  fieldTypes: {              // Replace with your field types
    name: 'string',
    email: 'email',
    phone: 'phone',
    price: 'number',
    // Add more fields as needed
  },
  stringLimits: {            // Replace with your string length limits
    name: 100,
    description: 500,
    email: 255,
    // Add more fields as needed
  },
  numericRanges: {           // Replace with your numeric ranges
    price: { min: 0, max: 9999.99 },
    // Add more numeric fields as needed
  }
};

/**
 * Custom validation function (optional)
 * Add your own business logic validation here
 */
function validateTEMPLATE(data, isUpdate = false) {
  const errors = [];
  
  // Example: Check for duplicate names
  // if (!isUpdate && data.name && templateNameExists(data.name)) {
  //   errors.push('A TEMPLATE with this name already exists');
  // }
  
  // Add more custom validation logic here
  
  return errors;
}

/**
 * Create CRUD handlers using the utility function
 */
const handlers = createCRUDHandlers('TEMPLATE', {
  getAllFunction: getAllTEMPLATES,
  getByIdFunction: getTEMPLATEById,
  createFunction: createTEMPLATE,
  updateFunction: updateTEMPLATE,
  deleteFunction: deleteTEMPLATE,
  validateFunction: validateTEMPLATE,
  ...VALIDATION_CONFIG
});

/**
 * Create the API handler with all HTTP methods
 */
const handler = createMethodRouter(handlers);

export default handler;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Get all items:
 *    GET /api/TEMPLATE
 *    Response: { success: true, data: [...] }
 * 
 * 2. Get item by ID:
 *    GET /api/TEMPLATE?id=123
 *    Response: { success: true, data: {...} }
 * 
 * 3. Create new item:
 *    POST /api/TEMPLATE
 *    Body: { name: "New Item", price: 99.99 }
 *    Response: { success: true, data: {...}, message: "TEMPLATE created successfully" }
 * 
 * 4. Update item:
 *    PUT /api/TEMPLATE  
 *    Body: { id: 123, name: "Updated Name", price: 149.99 }
 *    Response: { success: true, data: {...}, message: "TEMPLATE updated successfully" }
 * 
 * 5. Delete item:
 *    DELETE /api/TEMPLATE
 *    Body: { id: 123 }
 *    Response: { success: true, data: {...}, message: "TEMPLATE deleted successfully" }
 * 
 * FRONTEND USAGE:
 * 
 * class TEMPLATEApi {
 *   constructor() {
 *     this.baseURL = '/api/TEMPLATE';
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
 *   async create(data) {
 *     const response = await fetch(this.baseURL, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data)
 *     });
 *     return response.json();
 *   }
 * 
 *   async update(data) {
 *     const response = await fetch(this.baseURL, {
 *       method: 'PUT',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data)
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
 * const api = new TEMPLATEApi();
 * const items = await api.getAll();
 * const newItem = await api.create({ name: "Test", price: 99.99 });
 */