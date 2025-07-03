/**
 * Action API Template
 * Use this template for APIs that perform specific actions (not just data storage)
 * Examples: Send SMS, Generate Reports, Process Payments, Send Emails
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to api/your-action-name.js
 * 2. Replace "ACTION" with your actual action name (e.g., "send-sms", "generate-report")
 * 3. Update the action logic in the handle functions
 * 4. Customize validation rules
 * 5. Test your API
 */

import { 
  createMethodRouter,
  sendSuccess,
  sendError,
  validateRequiredFields,
  validateFieldTypes,
  validateStringLength
} from '../utils/api-helpers.js';

/**
 * Configuration for your action validation
 * Update these to match your action parameters
 */
const VALIDATION_CONFIG = {
  requiredFields: ['message', 'recipient'],  // Replace with your required fields
  fieldTypes: {                              // Replace with your field types
    message: 'string',
    recipient: 'phone',  // or 'email' depending on your action
    // Add more fields as needed
  },
  stringLimits: {                           // Replace with your string length limits
    message: 160,  // SMS character limit example
    recipient: 15,
    // Add more fields as needed
  }
};

/**
 * Handle GET requests
 * GET /api/ACTION - Get action status or information
 */
async function handleGet(req, res) {
  try {
    // Example: Get action status, history, or configuration
    const status = {
      available: true,
      lastExecuted: new Date().toISOString(),
      // Add more status information
    };
    
    return sendSuccess(res, status, 'ACTION status retrieved successfully');
  } catch (error) {
    console.error('Error getting ACTION status:', error);
    throw error;
  }
}

/**
 * Handle POST requests
 * POST /api/ACTION - Execute the action
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
    // Execute your action here
    const result = await executeAction(data);
    
    return sendSuccess(res, result, 'ACTION executed successfully');
  } catch (error) {
    console.error('Error executing ACTION:', error);
    
    // Handle specific error types
    if (error.message.includes('rate limit')) {
      return sendError(res, 429, 'Rate Limit Exceeded', 'Too many requests. Please try again later.');
    }
    
    if (error.message.includes('invalid')) {
      return sendError(res, 400, 'Invalid Request', error.message);
    }
    
    throw error;
  }
}

/**
 * Your main action logic goes here
 * Replace this with your actual action implementation
 */
async function executeAction(data) {
  // Example implementation for sending SMS
  // Replace this entire function with your action logic
  
  const { message, recipient } = data;
  
  // Example: Send SMS logic
  console.log(`Sending SMS to ${recipient}: ${message}`);
  
  // Simulate API call or database operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return result
  return {
    id: Date.now().toString(),
    status: 'sent',
    message: message,
    recipient: recipient,
    timestamp: new Date().toISOString(),
    // Add more result data as needed
  };
}

/**
 * Create the API handler
 */
const handler = createMethodRouter({
  GET: handleGet,
  POST: handlePost,
  // Add more methods if needed
});

export default handler;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Get action status:
 *    GET /api/ACTION
 *    Response: { success: true, data: { available: true, ... } }
 * 
 * 2. Execute action:
 *    POST /api/ACTION
 *    Body: { message: "Hello!", recipient: "+1234567890" }
 *    Response: { success: true, data: { id: "123", status: "sent", ... } }
 * 
 * FRONTEND USAGE:
 * 
 * class ACTIONApi {
 *   constructor() {
 *     this.baseURL = '/api/ACTION';
 *   }
 * 
 *   async getStatus() {
 *     const response = await fetch(this.baseURL);
 *     return response.json();
 *   }
 * 
 *   async execute(data) {
 *     const response = await fetch(this.baseURL, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data)
 *     });
 *     return response.json();
 *   }
 * }
 * 
 * // Usage
 * const api = new ACTIONApi();
 * const status = await api.getStatus();
 * const result = await api.execute({ 
 *   message: "Your appointment is confirmed!", 
 *   recipient: "+1234567890" 
 * });
 * 
 * COMMON ACTION TYPES:
 * 
 * 1. Send SMS:
 *    - Required: message, phone
 *    - Integration: Twilio, TextMagic, etc.
 * 
 * 2. Send Email:
 *    - Required: subject, message, email
 *    - Integration: SendGrid, Mailgun, etc.
 * 
 * 3. Generate Report:
 *    - Required: reportType, dateRange
 *    - Returns: report data or file download
 * 
 * 4. Process Payment:
 *    - Required: amount, paymentMethod
 *    - Integration: Stripe, PayPal, etc.
 * 
 * 5. Book Appointment:
 *    - Required: serviceId, customerId, dateTime
 *    - Returns: appointment confirmation
 */