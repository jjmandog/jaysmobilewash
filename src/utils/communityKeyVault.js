/**
 * Community API Key Vault
 * Manages shared API keys for all supported AI providers
 * Provides secure storage, validation, and retrieval of community-contributed keys
 */

// In-memory storage for community keys (in production, this would be Supabase/database)
let communityKeys = new Map();

// Provider configurations for validation
const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    keyPattern: /^sk-[a-zA-Z0-9]{48,}$/,
    testEndpoint: 'https://api.openai.com/v1/models',
    required: true
  },
  anthropic: {
    name: 'Anthropic',
    keyPattern: /^sk-ant-api03-[a-zA-Z0-9_-]{95,}$/,
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    required: true
  },
  google: {
    name: 'Google Gemini',
    keyPattern: /^[a-zA-Z0-9_-]{39}$/,
    testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    required: true
  },
  cohere: {
    name: 'Cohere',
    keyPattern: /^[a-zA-Z0-9_-]{40,}$/,
    testEndpoint: 'https://api.cohere.ai/v1/models',
    required: false
  },
  replicate: {
    name: 'Replicate',
    keyPattern: /^r8_[a-zA-Z0-9]{40}$/,
    testEndpoint: 'https://api.replicate.com/v1/models',
    required: false
  },
  perplexity: {
    name: 'Perplexity',
    keyPattern: /^pplx-[a-zA-Z0-9_-]{40,}$/,
    testEndpoint: 'https://api.perplexity.ai/chat/completions',
    required: false
  },
  mistral: {
    name: 'Mistral',
    keyPattern: /^[a-zA-Z0-9_-]{32,}$/,
    testEndpoint: 'https://api.mistral.ai/v1/models',
    required: false
  },
  together: {
    name: 'Together AI',
    keyPattern: /^[a-zA-Z0-9_-]{40,}$/,
    testEndpoint: 'https://api.together.xyz/inference',
    required: false
  },
  deepseek: {
    name: 'DeepSeek',
    keyPattern: /^(sk-[a-zA-Z0-9_-]{40,}|hf_[a-zA-Z0-9_-]{30,})$/,
    testEndpoint: 'https://api.deepseek.com/v1/models',
    required: false
  }
};

/**
 * Initialize community key vault with some demo keys for testing
 */
export function initializeCommunityVault() {
  // Add some demo/placeholder keys for testing
  communityKeys.set('openai', {
    key: 'demo-openai-key-placeholder',
    addedAt: new Date().toISOString(),
    isValid: false, // Mark as invalid since it's a demo key
    lastValidated: null
  });
  
  console.log('Community Key Vault initialized with demo keys');
}

/**
 * Add a new API key to the community vault
 * @param {string} provider - Provider ID (openai, anthropic, etc.)
 * @param {string} apiKey - The API key to add
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of adding the key
 */
export async function addCommunityKey(provider, apiKey, options = {}) {
  try {
    // Validate provider
    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Validate key format
    if (!config.keyPattern.test(apiKey)) {
      throw new Error(`Invalid API key format for ${config.name}`);
    }

    // Redact key for logging (show only first 8 and last 4 characters)
    const redactedKey = apiKey.length > 12 
      ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
      : 'key-redacted';

    // Test key validity (in production, this would make actual API calls)
    const isValid = await validateAPIKey(provider, apiKey);

    // Store in community vault
    communityKeys.set(provider, {
      key: apiKey,
      addedAt: new Date().toISOString(),
      isValid,
      lastValidated: new Date().toISOString(),
      contributor: options.contributor || 'anonymous'
    });

    console.log(`Added ${config.name} key to community vault: ${redactedKey} (valid: ${isValid})`);

    return {
      success: true,
      provider,
      isValid,
      message: `${config.name} API key added successfully`
    };

  } catch (error) {
    console.error(`Failed to add ${provider} key:`, error.message);
    return {
      success: false,
      provider,
      error: error.message
    };
  }
}

/**
 * Get a community API key for a provider
 * @param {string} provider - Provider ID
 * @returns {string|null} - The API key or null if not available
 */
export function getCommunityKey(provider) {
  const keyData = communityKeys.get(provider);
  return keyData && keyData.isValid ? keyData.key : null;
}

/**
 * Check which providers have valid community keys
 * @returns {Object} - Status of all providers
 */
export function getCommunityKeyStatus() {
  const status = {};
  
  Object.keys(PROVIDER_CONFIGS).forEach(provider => {
    const config = PROVIDER_CONFIGS[provider];
    const keyData = communityKeys.get(provider);
    
    status[provider] = {
      name: config.name,
      hasKey: !!keyData,
      isValid: keyData ? keyData.isValid : false,
      required: config.required,
      lastValidated: keyData ? keyData.lastValidated : null
    };
  });
  
  return status;
}

/**
 * Check if all required providers have valid keys
 * @returns {boolean} - True if all required keys are present
 */
export function areAllRequiredKeysPresent() {
  const requiredProviders = Object.entries(PROVIDER_CONFIGS)
    .filter(([_, config]) => config.required)
    .map(([provider, _]) => provider);
  
  return requiredProviders.every(provider => {
    const keyData = communityKeys.get(provider);
    return keyData && keyData.isValid;
  });
}

/**
 * Get community key completeness statistics
 * @returns {Object} - Statistics about key availability
 */
export function getCommunityKeyStats() {
  const status = getCommunityKeyStatus();
  const total = Object.keys(status).length;
  const withKeys = Object.values(status).filter(s => s.hasKey).length;
  const valid = Object.values(status).filter(s => s.isValid).length;
  const required = Object.values(status).filter(s => s.required).length;
  const requiredValid = Object.values(status).filter(s => s.required && s.isValid).length;
  
  return {
    total,
    withKeys,
    valid,
    required,
    requiredValid,
    completionRate: total > 0 ? (valid / total) * 100 : 0,
    requiredCompletionRate: required > 0 ? (requiredValid / required) * 100 : 0,
    canEnableSmartSelect: areAllRequiredKeysPresent()
  };
}

/**
 * Validate an API key by testing it against the provider's API
 * @param {string} provider - Provider ID
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>} - True if key is valid
 */
async function validateAPIKey(provider, apiKey) {
  // In a real implementation, this would make actual API calls to test the keys
  // For this demo, we'll simulate validation based on key format
  const config = PROVIDER_CONFIGS[provider];
  
  if (!config) {
    return false;
  }
  
  // Simulate API validation with a delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For demo purposes, consider keys valid if they match the pattern
  // In production, this would make actual API calls to verify
  return config.keyPattern.test(apiKey);
}

/**
 * Remove a community key (admin function)
 * @param {string} provider - Provider ID
 * @returns {boolean} - True if removed successfully
 */
export function removeCommunityKey(provider) {
  const existed = communityKeys.has(provider);
  communityKeys.delete(provider);
  console.log(`Removed ${provider} key from community vault`);
  return existed;
}

/**
 * Get list of providers missing valid keys
 * @returns {Array} - Array of provider objects missing keys
 */
export function getMissingProviders() {
  const status = getCommunityKeyStatus();
  return Object.entries(status)
    .filter(([_, providerStatus]) => !providerStatus.isValid)
    .map(([provider, providerStatus]) => ({
      id: provider,
      name: providerStatus.name,
      required: providerStatus.required
    }));
}

// Initialize vault on module load
initializeCommunityVault();