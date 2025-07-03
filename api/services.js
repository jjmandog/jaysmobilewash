/**
 * Services API Endpoint
 * Handles CRUD operations for Jay's Mobile Wash car wash services
 * 
 * Endpoints:
 * GET /api/services - Get all services
 * POST /api/services - Add a new service
 * PUT /api/services - Update an existing service
 * DELETE /api/services - Remove a service
 */

/**
 * API Metadata - For plug-and-play discovery
 */
export const metadata = {
  name: 'Services Management API',
  description: 'CRUD operations for mobile wash services',
  version: '1.0.0',
  
  categories: ['services', 'data', 'management'],
  keywords: ['services', 'crud', 'management', 'detailing', 'car wash'],
  
  enabled: true,
  endpoint: '/api/services',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  
  input: {
    type: 'object',
    properties: {
      name: { type: 'string', required: true },
      description: { type: 'string', required: false },
      price: { type: 'number', required: true },
      duration: { type: 'number', required: false }
    }
  },
  
  output: {
    type: 'object',
    properties: {
      services: { type: 'array' },
      service: { type: 'object' },
      message: { type: 'string' }
    }
  },
  
  examples: [
    {
      name: 'Get all services',
      input: {},
      description: 'Retrieve all available services'
    },
    {
      name: 'Add new service',
      input: { name: 'Premium Detail', price: 150, description: 'Full premium detailing service' },
      description: 'Add a new service to the catalog'
    }
  ],
  
  shouldHandle: (input, context) => {
    const text = typeof input === 'string' ? input : input.message || '';
    const serviceKeywords = ['service', 'manage', 'crud', 'add', 'update', 'delete'];
    return serviceKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }
};

import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  serviceNameExists,
  getServicesCount
} from '../database/services.js';

// CORS headers for local development and production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Validate service data
 */
function validateService(serviceData, isUpdate = false) {
  const errors = [];

  // For updates, only validate provided fields
  if (!isUpdate || serviceData.hasOwnProperty('name')) {
    if (serviceData.name === undefined || serviceData.name === null || typeof serviceData.name !== 'string') {
      errors.push('name is required and must be a string');
    } else if (serviceData.name.trim().length === 0) {
      errors.push('name cannot be empty');
    } else if (serviceData.name.length > 100) {
      errors.push('name must be 100 characters or less');
    }
  }

  if (!isUpdate || serviceData.hasOwnProperty('description')) {
    if (serviceData.description === undefined || serviceData.description === null || typeof serviceData.description !== 'string') {
      errors.push('description is required and must be a string');
    } else if (serviceData.description.trim().length === 0) {
      errors.push('description cannot be empty');
    } else if (serviceData.description.length > 500) {
      errors.push('description must be 500 characters or less');
    }
  }

  if (!isUpdate || serviceData.hasOwnProperty('price')) {
    if (serviceData.price === undefined || serviceData.price === null) {
      errors.push('price is required');
    } else if (typeof serviceData.price !== 'number' || isNaN(serviceData.price)) {
      errors.push('price must be a valid number');
    } else if (serviceData.price < 0) {
      errors.push('price must be non-negative');
    } else if (serviceData.price > 9999.99) {
      errors.push('price must be less than $10,000');
    }
  }

  // For updates, validate ID if provided
  if (isUpdate && serviceData.hasOwnProperty('id')) {
    if (!Number.isInteger(serviceData.id) || serviceData.id <= 0) {
      errors.push('id must be a positive integer');
    }
  }

  return errors;
}

/**
 * Find service by ID (using database)
 */
function findServiceById(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return null;
  }
  return getServiceById(numericId);
}

/**
 * Handle GET requests - List all services
 */
async function handleGet(req, res) {
  try {
    const services = getAllServices();
    
    return res.status(200).json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error retrieving services:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve services'
    });
  }
}

/**
 * Handle POST requests - Add new service
 */
async function handlePost(req, res) {
  try {
    const serviceData = req.body;

    // Validate request body
    if (!serviceData || typeof serviceData !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must be a valid JSON object'
      });
    }

    // Validate service data
    const validationErrors = validateService(serviceData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid service data',
        details: validationErrors
      });
    }

    // Check for duplicate service name (database will handle this, but we can provide better error message)
    if (serviceNameExists(serviceData.name)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A service with this name already exists'
      });
    }

    // Create new service
    const newService = createService({
      name: serviceData.name.trim(),
      description: serviceData.description.trim(),
      price: Number(serviceData.price.toFixed(2))
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });

  } catch (error) {
    console.error('Error creating service:', error);
    
    // Handle database constraint errors
    if (error.message.includes('service with this name already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A service with this name already exists'
      });
    }
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create service'
    });
  }
}

/**
 * Handle PUT requests - Update existing service
 */
async function handlePut(req, res) {
  try {
    const serviceData = req.body;

    // Validate request body
    if (!serviceData || typeof serviceData !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must be a valid JSON object'
      });
    }

    // ID is required for updates
    if (!serviceData.id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Service ID is required for updates'
      });
    }

    // Find existing service
    const existingService = findServiceById(serviceData.id);
    if (!existingService) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Service not found'
      });
    }

    // Validate updated data
    const validationErrors = validateService(serviceData, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid service data',
        details: validationErrors
      });
    }

    // Check for duplicate name if name is being updated
    if (serviceData.name && serviceNameExists(serviceData.name, serviceData.id)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A service with this name already exists'
      });
    }

    // Update service
    const updateData = {};
    if (serviceData.name !== undefined) updateData.name = serviceData.name;
    if (serviceData.description !== undefined) updateData.description = serviceData.description;
    if (serviceData.price !== undefined) updateData.price = Number(serviceData.price.toFixed(2));

    const updatedService = updateService(serviceData.id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });

  } catch (error) {
    console.error('Error updating service:', error);
    
    // Handle database constraint errors
    if (error.message.includes('service with this name already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A service with this name already exists'
      });
    }
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update service'
    });
  }
}

/**
 * Handle DELETE requests - Remove service
 */
async function handleDelete(req, res) {
  try {
    const { id } = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Service ID is required'
      });
    }

    // Delete service (will return null if not found)
    const deletedService = deleteService(id);
    
    if (!deletedService) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Service not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: deletedService
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete service'
    });
  }
}

/**
 * Main handler function
 */
async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).json({});
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          message: 'Only GET, POST, PUT, and DELETE requests are supported'
        });
    }
  } catch (error) {
    console.error('Services API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}

export default handler;