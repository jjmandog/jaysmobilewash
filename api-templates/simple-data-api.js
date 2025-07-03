/**
 * Simple Data API Template
 * Use this template for basic data operations (Get All, Get By ID, Create)
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
  // Add other functions as needed
} from '../database/TEMPLATE.js';  // Replace with your database file

import { 
  createMethodRouter,
  sendSuccess,
  sendError,
  validateRequiredFields,
  validateFieldTypes,
  validateStringLength,
  validateNumericRanges,
  getIntParam
} from '../utils/api-helpers.js';

/**
 * Configuration for your data validation
 * Update these arrays/objects to match your data structure
 */
const VALIDATION_CONFIG = {
  requiredFields: ['name', 'email'],  // Replace with your required fields
  fieldTypes: {                       // Replace with your field types
    name: 'string',
    email: 'email',
    phone: 'phone',
    // Add more fields as needed
  },
  stringLimits: {                     // Replace with your string length limits
    name: 100,
    email: 255,
    // Add more fields as needed
  },
  numericRanges: {                    // Replace with your numeric ranges
    // age: { min: 0, max: 120 },
    // Add numeric fields as needed
  }
};

/**
 * Handle GET requests
 * GET /api/TEMPLATE - Get all items
 * GET /api/TEMPLATE?id=123 - Get item by ID
 */
async function handleGet(req, res) {
  const id = getIntParam(req, 'id');
  
  if (id) {
    // Get single item by ID
    const item = getTEMPLATEById(id);
    if (!item) {
      return sendError(res, 404, 'Not Found', `TEMPLATE with ID ${id} not found`);
    }
    return sendSuccess(res, item);
  } else {
    // Get all items
    const items = getAllTEMPLATES();
    return sendSuccess(res, items);
  }
}

/**
 * Handle POST requests
 * POST /api/TEMPLATE - Create new item
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
  
  // Validate numeric ranges
  const rangeErrors = validateNumericRanges(data, VALIDATION_CONFIG.numericRanges);
  if (rangeErrors.length > 0) {
    return sendError(res, 400, 'Validation Error', 'Numeric range validation failed', rangeErrors);
  }
  
  try {
    const newItem = createTEMPLATE(data);
    return sendSuccess(res, newItem, 'TEMPLATE created successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      return sendError(res, 409, 'Conflict', error.message);
    }
    throw error;
  }
}

/**
 * Create the API handler with all HTTP methods
 */
const handler = createMethodRouter({
  GET: handleGet,
  POST: handlePost,
  // Add more methods as needed:
  // PUT: handlePut,
  // DELETE: handleDelete,
});

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
 *    Body: { name: "John", email: "john@example.com" }
 *    Response: { success: true, data: {...}, message: "TEMPLATE created successfully" }
 * 
 * FRONTEND USAGE:
 * 
 * // Get all items
 * const response = await fetch('/api/TEMPLATE');
 * const data = await response.json();
 * 
 * // Get item by ID
 * const response = await fetch('/api/TEMPLATE?id=123');
 * const data = await response.json();
 * 
 * // Create new item
 * const response = await fetch('/api/TEMPLATE', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: "John", email: "john@example.com" })
 * });
 * const data = await response.json();
 */