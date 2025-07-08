/**
 * Chatbot Settings API
 * Provides backend access to chatbot configuration and user settings
 * 
 * This file manages the actual individual AI endpoints configured:
 * - Auto: Smart endpoint selection
 * - DeepSeek: Free reasoning model
 * - QWQ 32B: Advanced reasoning
 * - GLM-Z1 32B: Complex analysis
 * - Kimi models: Visual and development tasks
 * - Moonlight 16B: General instruct
 * - Nemotron Super 49B: NVIDIA model
 * - Llama 4 variants: Maverick & Scout
 * - Qwerky 72B: Creative tasks
 * - Reka Flash 3: Fast responses
 * - Dolphin Mistral 24B: Cognitive computing
 * - Llama 3.2 Vision: Image analysis
 * - Qwen 3 235B: Advanced reasoning
 * - None: Disable AI responses
 */

// In-memory storage for demo (replace with database in production)
let globalSettings = {
  defaultRoleAssignments: {
    auto: 'auto',
    reasoning: 'qwq_32b', 
    tools: 'deepseek',
    quotes: 'llama4_maverick',
    photo_uploads: 'llama32_vision',
    summaries: 'moonlight_16b',
    search: 'reka_flash_3',
    chat: 'kimi_dev_72b',
    fallback: 'dolphin_mistral_24b'
  },
  enabledAPIs: [
    'auto',
    'deepseek', 
    'qwq_32b',
    'glm_z1_32b',
    'kimi_vl_a3b', 
    'kimi_dev_72b',
    'moonlight_16b',
    'nemotron_super_49b',
    'llama4_maverick',
    'llama4_scout',
    'qwerky_72b',
    'reka_flash_3',
    'dolphin_mistral_24b',
    'llama32_vision',
    'qwen3_235b',
    'none'
  ],
  userSettings: {}, // Store individual user settings by session/IP
  analytics: {
    totalUsers: 0,
    settingsChanges: 0,
    apiUsage: {},
    lastUpdated: new Date().toISOString()
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;
  const { action, userId } = query;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, action, userId);
      case 'POST':
        return handlePost(req, res, action, userId, body);
      case 'PUT':
        return handlePut(req, res, action, userId, body);
      case 'DELETE':
        return handleDelete(req, res, action, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chatbot Settings API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req, res, action, userId) {
  switch (action) {
    case 'global':
      // Get global settings (admin only)
      return res.status(200).json({
        success: true,
        data: globalSettings
      });

    case 'user':
      // Get specific user settings
      const userSettings = globalSettings.userSettings[userId] || {};
      return res.status(200).json({
        success: true,
        data: {
          roleAssignments: userSettings.roleAssignments || globalSettings.defaultRoleAssignments,
          selectedModel: userSettings.selectedModel || 'auto',
          preferences: userSettings.preferences || {},
          lastUpdated: userSettings.lastUpdated
        }
      });

    case 'analytics':
      // Get usage analytics
      return res.status(200).json({
        success: true,
        data: globalSettings.analytics
      });

    case 'defaults':
      // Get default settings
      return res.status(200).json({
        success: true,
        data: {
          defaultRoleAssignments: globalSettings.defaultRoleAssignments,
          enabledAPIs: globalSettings.enabledAPIs
        }
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handlePost(req, res, action, userId, body) {
  switch (action) {
    case 'save-user-settings':
      // Save user settings
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const { roleAssignments, selectedModel, preferences } = body;
      
      if (!globalSettings.userSettings[userId]) {
        globalSettings.userSettings[userId] = {};
        globalSettings.analytics.totalUsers++;
      }

      globalSettings.userSettings[userId] = {
        ...globalSettings.userSettings[userId],
        roleAssignments: roleAssignments || globalSettings.userSettings[userId].roleAssignments,
        selectedModel: selectedModel || globalSettings.userSettings[userId].selectedModel,
        preferences: preferences || globalSettings.userSettings[userId].preferences,
        lastUpdated: new Date().toISOString()
      };

      globalSettings.analytics.settingsChanges++;
      globalSettings.analytics.lastUpdated = new Date().toISOString();

      return res.status(200).json({
        success: true,
        message: 'User settings saved successfully'
      });

    case 'track-api-usage':
      // Track API usage for analytics
      const { apiId, endpoint, success } = body;
      
      if (!globalSettings.analytics.apiUsage[apiId]) {
        globalSettings.analytics.apiUsage[apiId] = {
          calls: 0,
          successes: 0,
          failures: 0,
          endpoints: {}
        };
      }

      globalSettings.analytics.apiUsage[apiId].calls++;
      if (success) {
        globalSettings.analytics.apiUsage[apiId].successes++;
      } else {
        globalSettings.analytics.apiUsage[apiId].failures++;
      }

      if (endpoint) {
        if (!globalSettings.analytics.apiUsage[apiId].endpoints[endpoint]) {
          globalSettings.analytics.apiUsage[apiId].endpoints[endpoint] = 0;
        }
        globalSettings.analytics.apiUsage[apiId].endpoints[endpoint]++;
      }

      return res.status(200).json({ success: true });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handlePut(req, res, action, userId, body) {
  switch (action) {
    case 'update-defaults':
      // Update global default settings (admin only)
      const { defaultRoleAssignments, enabledAPIs } = body;
      
      if (defaultRoleAssignments) {
        globalSettings.defaultRoleAssignments = defaultRoleAssignments;
      }
      
      if (enabledAPIs) {
        globalSettings.enabledAPIs = enabledAPIs;
      }

      globalSettings.analytics.lastUpdated = new Date().toISOString();

      return res.status(200).json({
        success: true,
        message: 'Default settings updated successfully'
      });

    case 'bulk-update-users':
      // Bulk update user settings (admin only)
      const { userUpdates } = body;
      
      for (const [userId, settings] of Object.entries(userUpdates)) {
        if (globalSettings.userSettings[userId]) {
          globalSettings.userSettings[userId] = {
            ...globalSettings.userSettings[userId],
            ...settings,
            lastUpdated: new Date().toISOString()
          };
        }
      }

      return res.status(200).json({
        success: true,
        message: `Updated ${Object.keys(userUpdates).length} user(s) successfully`
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleDelete(req, res, action, userId) {
  switch (action) {
    case 'reset-user':
      // Reset user settings to defaults
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      delete globalSettings.userSettings[userId];
      globalSettings.analytics.totalUsers = Math.max(0, globalSettings.analytics.totalUsers - 1);

      return res.status(200).json({
        success: true,
        message: 'User settings reset successfully'
      });

    case 'clear-analytics':
      // Clear analytics data (admin only)
      globalSettings.analytics = {
        totalUsers: Object.keys(globalSettings.userSettings).length,
        settingsChanges: 0,
        apiUsage: {},
        lastUpdated: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Analytics cleared successfully'
      });

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}
