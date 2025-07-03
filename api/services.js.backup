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

// CORS headers for local development and production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// TODO: Replace with database storage for production
// In-memory storage for services - this should be replaced with a proper database
let services = [
  {
    id: 1,
    name: 'Basic Wash',
    description: 'Exterior wash and dry with premium soap and microfiber towels',
    price: 25.00
  },
  {
    id: 2,
    name: 'Full Detailing',
    description: 'Complete interior and exterior detailing with wax and tire shine',
    price: 85.00
  },
  {
    id: 3,
    name: 'Ceramic Coating',
    description: 'Professional ceramic coating application for long-lasting protection',
    price: 299.00
  }
];

let nextId = 4; // Counter for new service IDs

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
 * Find service by ID
 */
function findServiceById(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return null;
  }
  return services.find(service => service.id === numericId);
}

/**
 * Handle GET requests - List all services
 */
async function handleGet(req, res) {
  try {
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

    // Check for duplicate service name
    const existingService = services.find(s => 
      s.name.toLowerCase() === serviceData.name.trim().toLowerCase()
    );
    if (existingService) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A service with this name already exists'
      });
    }

    // Create new service
    const newService = {
      id: nextId++,
      name: serviceData.name.trim(),
      description: serviceData.description.trim(),
      price: Number(serviceData.price.toFixed(2))
    };

    services.push(newService);

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });

  } catch (error) {
    console.error('Error creating service:', error);
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
    if (serviceData.name) {
      const duplicateService = services.find(s => 
        s.id !== existingService.id && 
        s.name.toLowerCase() === serviceData.name.trim().toLowerCase()
      );
      if (duplicateService) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'A service with this name already exists'
        });
      }
    }

    // Update service
    const updatedService = {
      ...existingService,
      ...(serviceData.name && { name: serviceData.name.trim() }),
      ...(serviceData.description && { description: serviceData.description.trim() }),
      ...(serviceData.price !== undefined && { price: Number(serviceData.price.toFixed(2)) })
    };

    // Replace in array
    const index = services.findIndex(s => s.id === existingService.id);
    services[index] = updatedService;

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });

  } catch (error) {
    console.error('Error updating service:', error);
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

    // Find existing service
    const existingService = findServiceById(id);
    if (!existingService) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Service not found'
      });
    }

    // Remove service from array
    services = services.filter(s => s.id !== existingService.id);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: existingService
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