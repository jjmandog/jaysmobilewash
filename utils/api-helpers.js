/**
 * API Helper Utilities
 * Common functions to reduce boilerplate code when creating new APIs
 */

// Standard CORS headers for all APIs
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Set CORS headers on response
 */
export function setCORSHeaders(res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

/**
 * Handle CORS preflight requests
 */
export function handleCORS(req, res) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    return res.status(200).json({});
  }
  setCORSHeaders(res);
  return false; // Not a preflight request
}

/**
 * Send standardized success response
 */
export function sendSuccess(res, data, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data
  });
}

/**
 * Send standardized error response
 */
export function sendError(res, status, error, message, details = null) {
  const response = {
    success: false,
    error,
    message
  };
  
  if (details) {
    response.details = details;
  }
  
  return res.status(status).json(response);
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(data, requiredFields) {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!data || !data.hasOwnProperty(field) || data[field] === null || data[field] === undefined) {
      errors.push(`${field} is required`);
    } else if (typeof data[field] === 'string' && data[field].trim() === '') {
      errors.push(`${field} cannot be empty`);
    }
  }
  
  return errors;
}

/**
 * Validate field types
 */
export function validateFieldTypes(data, fieldTypes) {
  const errors = [];
  
  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    if (data && data.hasOwnProperty(field) && data[field] !== null && data[field] !== undefined) {
      const actualType = typeof data[field];
      
      if (expectedType === 'number' && (actualType !== 'number' || isNaN(data[field]))) {
        errors.push(`${field} must be a valid number`);
      } else if (expectedType === 'string' && actualType !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (expectedType === 'boolean' && actualType !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      } else if (expectedType === 'email' && !isValidEmail(data[field])) {
        errors.push(`${field} must be a valid email address`);
      } else if (expectedType === 'phone' && !isValidPhone(data[field])) {
        errors.push(`${field} must be a valid phone number`);
      }
    }
  }
  
  return errors;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate string length
 */
export function validateStringLength(data, fieldLimits) {
  const errors = [];
  
  for (const [field, limit] of Object.entries(fieldLimits)) {
    if (data && data.hasOwnProperty(field) && typeof data[field] === 'string') {
      if (data[field].length > limit) {
        errors.push(`${field} must be ${limit} characters or less`);
      }
    }
  }
  
  return errors;
}

/**
 * Validate numeric ranges
 */
export function validateNumericRanges(data, fieldRanges) {
  const errors = [];
  
  for (const [field, range] of Object.entries(fieldRanges)) {
    if (data && data.hasOwnProperty(field) && typeof data[field] === 'number') {
      const { min, max } = range;
      
      if (min !== undefined && data[field] < min) {
        errors.push(`${field} must be at least ${min}`);
      }
      
      if (max !== undefined && data[field] > max) {
        errors.push(`${field} must be at most ${max}`);
      }
    }
  }
  
  return errors;
}

/**
 * Get query parameter as integer
 */
export function getIntParam(req, paramName, defaultValue = null) {
  const value = req.query[paramName];
  if (!value) return defaultValue;
  
  const intValue = parseInt(value, 10);
  return isNaN(intValue) ? defaultValue : intValue;
}

/**
 * Get query parameter as string
 */
export function getStringParam(req, paramName, defaultValue = null) {
  return req.query[paramName] || defaultValue;
}

/**
 * Create standard HTTP method router
 */
export function createMethodRouter(handlers) {
  return async (req, res) => {
    // Handle CORS
    if (handleCORS(req, res)) {
      return;
    }
    
    try {
      const handler = handlers[req.method];
      
      if (!handler) {
        return sendError(res, 405, 'Method Not Allowed', 
          `${req.method} method is not supported for this endpoint`);
      }
      
      return await handler(req, res);
    } catch (error) {
      console.error(`API Error [${req.method}]:`, error);
      return sendError(res, 500, 'Internal Server Error', 
        'An unexpected error occurred while processing your request');
    }
  };
}

/**
 * Create basic CRUD handlers for a database table
 */
export function createCRUDHandlers(tableName, {
  getAllFunction,
  getByIdFunction,
  createFunction,
  updateFunction,
  deleteFunction,
  validateFunction,
  requiredFields = [],
  fieldTypes = {},
  stringLimits = {},
  numericRanges = {}
}) {
  
  const handleGet = async (req, res) => {
    const id = getIntParam(req, 'id');
    
    if (id) {
      // Get single item
      const item = getByIdFunction(id);
      if (!item) {
        return sendError(res, 404, 'Not Found', `${tableName} with ID ${id} not found`);
      }
      return sendSuccess(res, item);
    } else {
      // Get all items
      const items = getAllFunction();
      return sendSuccess(res, items);
    }
  };
  
  const handlePost = async (req, res) => {
    const data = req.body;
    
    // Validate request body
    if (!data || typeof data !== 'object') {
      return sendError(res, 400, 'Bad Request', 'Request body must be a valid JSON object');
    }
    
    // Validate required fields
    const requiredErrors = validateRequiredFields(data, requiredFields);
    if (requiredErrors.length > 0) {
      return sendError(res, 400, 'Validation Error', 'Missing required fields', requiredErrors);
    }
    
    // Validate field types
    const typeErrors = validateFieldTypes(data, fieldTypes);
    if (typeErrors.length > 0) {
      return sendError(res, 400, 'Validation Error', 'Invalid field types', typeErrors);
    }
    
    // Validate string lengths
    const lengthErrors = validateStringLength(data, stringLimits);
    if (lengthErrors.length > 0) {
      return sendError(res, 400, 'Validation Error', 'Field length validation failed', lengthErrors);
    }
    
    // Validate numeric ranges
    const rangeErrors = validateNumericRanges(data, numericRanges);
    if (rangeErrors.length > 0) {
      return sendError(res, 400, 'Validation Error', 'Numeric range validation failed', rangeErrors);
    }
    
    // Custom validation if provided
    if (validateFunction) {
      const customErrors = validateFunction(data);
      if (customErrors.length > 0) {
        return sendError(res, 400, 'Validation Error', 'Validation failed', customErrors);
      }
    }
    
    try {
      const newItem = createFunction(data);
      return sendSuccess(res, newItem, `${tableName} created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        return sendError(res, 409, 'Conflict', error.message);
      }
      throw error;
    }
  };
  
  const handlePut = async (req, res) => {
    const data = req.body;
    
    // Validate request body
    if (!data || typeof data !== 'object') {
      return sendError(res, 400, 'Bad Request', 'Request body must be a valid JSON object');
    }
    
    // ID is required for updates
    if (!data.id) {
      return sendError(res, 400, 'Bad Request', 'ID is required for updates');
    }
    
    // Check if item exists
    const existingItem = getByIdFunction(data.id);
    if (!existingItem) {
      return sendError(res, 404, 'Not Found', `${tableName} with ID ${data.id} not found`);
    }
    
    // Validate only provided fields
    const typeErrors = validateFieldTypes(data, fieldTypes);
    if (typeErrors.length > 0) {
      return sendError(res, 400, 'Validation Error', 'Invalid field types', typeErrors);
    }
    
    const lengthErrors = validateStringLength(data, stringLimits);
    if (lengthErrors.length > 0) {
      return sendError(res, 400, 'Validation Error', 'Field length validation failed', lengthErrors);
    }
    
    const rangeErrors = validateNumericRanges(data, numericRanges);
    if (rangeErrors.length > 0) {
      return sendError(res, 400, 'Validation Error', 'Numeric range validation failed', rangeErrors);
    }
    
    // Custom validation if provided
    if (validateFunction) {
      const customErrors = validateFunction(data, true);
      if (customErrors.length > 0) {
        return sendError(res, 400, 'Validation Error', 'Validation failed', customErrors);
      }
    }
    
    try {
      const updatedItem = updateFunction(data.id, data);
      return sendSuccess(res, updatedItem, `${tableName} updated successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        return sendError(res, 409, 'Conflict', error.message);
      }
      throw error;
    }
  };
  
  const handleDelete = async (req, res) => {
    const data = req.body;
    
    if (!data || !data.id) {
      return sendError(res, 400, 'Bad Request', 'ID is required for deletion');
    }
    
    try {
      const deletedItem = deleteFunction(data.id);
      if (!deletedItem) {
        return sendError(res, 404, 'Not Found', `${tableName} with ID ${data.id} not found`);
      }
      
      return sendSuccess(res, deletedItem, `${tableName} deleted successfully`);
    } catch (error) {
      throw error;
    }
  };
  
  return {
    GET: handleGet,
    POST: handlePost,
    PUT: handlePut,
    DELETE: handleDelete
  };
}