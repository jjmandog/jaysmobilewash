/**
 * Community Keys API Endpoint
 * Handles CRUD operations for the community API key vault
 * 
 * Endpoints:
 * GET /api/community-keys - Get key status for all providers
 * POST /api/community-keys - Add a new API key
 * DELETE /api/community-keys - Remove an API key (admin)
 */

import { 
  addCommunityKey, 
  getCommunityKeyStatus, 
  getCommunityKeyStats,
  getMissingProviders,
  removeCommunityKey,
  areAllRequiredKeysPresent
} from '../../src/utils/communityKeyVault.js';

// CORS headers for local development and production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

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
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          message: 'Only GET, POST, and DELETE requests are supported'
        });
    }
  } catch (error) {
    console.error('Community Keys API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Handle GET requests - Get community key status
 */
async function handleGet(req, res) {
  try {
    const status = getCommunityKeyStatus();
    const stats = getCommunityKeyStats();
    const missing = getMissingProviders();
    const canEnableSmartSelect = areAllRequiredKeysPresent();

    return res.status(200).json({
      success: true,
      data: {
        providers: status,
        stats,
        missing,
        canEnableSmartSelect
      }
    });
  } catch (error) {
    console.error('Error getting community key status:', error);
    return res.status(500).json({
      error: 'Failed to get key status',
      message: error.message
    });
  }
}

/**
 * Handle POST requests - Add new API key
 */
async function handlePost(req, res) {
  try {
    const { provider, apiKey, contributor } = req.body;

    // Validate request body
    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Provider is required and must be a string'
      });
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'API key is required and must be a string'
      });
    }

    if (apiKey.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'API key cannot be empty'
      });
    }

    // Add the key to community vault
    const result = await addCommunityKey(provider, apiKey.trim(), {
      contributor: contributor || 'anonymous'
    });

    if (result.success) {
      // Get updated status
      const status = getCommunityKeyStatus();
      const stats = getCommunityKeyStats();

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          provider: result.provider,
          isValid: result.isValid,
          stats,
          canEnableSmartSelect: areAllRequiredKeysPresent()
        }
      });
    } else {
      return res.status(400).json({
        error: 'Key Validation Failed',
        message: result.error,
        provider: result.provider
      });
    }
  } catch (error) {
    console.error('Error adding community key:', error);
    return res.status(500).json({
      error: 'Failed to add key',
      message: error.message
    });
  }
}

/**
 * Handle DELETE requests - Remove API key (admin function)
 */
async function handleDelete(req, res) {
  try {
    const { provider } = req.body;

    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Provider is required and must be a string'
      });
    }

    const removed = removeCommunityKey(provider);
    
    if (removed) {
      const status = getCommunityKeyStatus();
      const stats = getCommunityKeyStats();

      return res.status(200).json({
        success: true,
        message: `${provider} API key removed successfully`,
        data: {
          provider,
          stats,
          canEnableSmartSelect: areAllRequiredKeysPresent()
        }
      });
    } else {
      return res.status(404).json({
        error: 'Not Found',
        message: `No API key found for provider: ${provider}`
      });
    }
  } catch (error) {
    console.error('Error removing community key:', error);
    return res.status(500).json({
      error: 'Failed to remove key',
      message: error.message
    });
  }
}

export default handler;