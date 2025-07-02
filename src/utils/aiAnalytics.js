/**
 * AI Provider Analytics & Performance Tracking
 * Tracks API usage, response times, success rates, and smart selection metrics
 */

// In-memory storage for analytics (in production, this would be database)
let providerMetrics = new Map();
let requestHistory = [];
let smartSelectEnabled = false;

// Performance thresholds for smart selection
const PERFORMANCE_THRESHOLDS = {
  maxResponseTime: 10000, // 10 seconds
  minSuccessRate: 0.8,    // 80% success rate
  maxFailures: 3,         // Max consecutive failures
  evaluationWindow: 100   // Last N requests to evaluate
};

/**
 * Initialize analytics system
 */
export function initializeAnalytics() {
  // Initialize metrics for all providers
  const providers = ['openai', 'anthropic', 'google', 'cohere', 'replicate', 'perplexity', 'mistral', 'together', 'deepseek'];
  
  providers.forEach(provider => {
    providerMetrics.set(provider, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
      consecutiveFailures: 0,
      lastUsed: null,
      successRate: 1.0,
      performanceScore: 1.0,
      isAvailable: true
    });
  });
  
  console.log('AI Provider Analytics initialized');
}

/**
 * Record a request start
 * @param {string} provider - Provider ID
 * @param {string} role - Chat role
 * @param {string} requestId - Unique request ID
 * @returns {Object} - Request tracking object
 */
export function recordRequestStart(provider, role, requestId = null) {
  const id = requestId || generateRequestId();
  const startTime = Date.now();
  
  const request = {
    id,
    provider,
    role,
    startTime,
    endTime: null,
    responseTime: null,
    success: null,
    error: null,
    fallbackUsed: false,
    smartSelected: smartSelectEnabled
  };
  
  requestHistory.push(request);
  
  // Keep only last 1000 requests to prevent memory bloat
  if (requestHistory.length > 1000) {
    requestHistory = requestHistory.slice(-1000);
  }
  
  return request;
}

/**
 * Record a request completion
 * @param {string} requestId - Request ID
 * @param {boolean} success - Whether request was successful
 * @param {string} error - Error message if failed
 * @param {boolean} fallbackUsed - Whether fallback was used
 */
export function recordRequestEnd(requestId, success, error = null, fallbackUsed = false) {
  const request = requestHistory.find(r => r.id === requestId);
  if (!request) {
    console.warn(`Request ${requestId} not found for completion recording`);
    return;
  }
  
  const endTime = Date.now();
  const responseTime = endTime - request.startTime;
  
  // Update request record
  request.endTime = endTime;
  request.responseTime = responseTime;
  request.success = success;
  request.error = error;
  request.fallbackUsed = fallbackUsed;
  
  // Update provider metrics
  updateProviderMetrics(request.provider, success, responseTime);
  
  // Fire GA4 event
  fireAnalyticsEvent('chat_query_completed', {
    provider: request.provider,
    role: request.role,
    success,
    response_time: responseTime,
    fallback_used: fallbackUsed,
    smart_selected: request.smartSelected
  });
  
  console.log(`Request ${requestId} completed: ${success ? 'SUCCESS' : 'FAILED'} (${responseTime}ms)`);
}

/**
 * Update provider performance metrics
 * @param {string} provider - Provider ID
 * @param {boolean} success - Whether request was successful
 * @param {number} responseTime - Response time in milliseconds
 */
function updateProviderMetrics(provider, success, responseTime) {
  const metrics = providerMetrics.get(provider);
  if (!metrics) return;
  
  // Update basic counters
  metrics.totalRequests++;
  metrics.lastResponseTime = responseTime;
  metrics.lastUsed = new Date().toISOString();
  
  if (success) {
    metrics.successfulRequests++;
    metrics.consecutiveFailures = 0;
  } else {
    metrics.failedRequests++;
    metrics.consecutiveFailures++;
  }
  
  // Update derived metrics
  metrics.successRate = metrics.totalRequests > 0 
    ? metrics.successfulRequests / metrics.totalRequests 
    : 1.0;
  
  metrics.totalResponseTime += responseTime;
  metrics.averageResponseTime = metrics.totalRequests > 0
    ? metrics.totalResponseTime / metrics.totalRequests
    : 0;
  
  // Calculate performance score (0-1 scale)
  metrics.performanceScore = calculatePerformanceScore(metrics);
  
  // Update availability based on consecutive failures
  metrics.isAvailable = metrics.consecutiveFailures < PERFORMANCE_THRESHOLDS.maxFailures;
  
  providerMetrics.set(provider, metrics);
}

/**
 * Calculate performance score for a provider
 * @param {Object} metrics - Provider metrics
 * @returns {number} - Performance score (0-1)
 */
function calculatePerformanceScore(metrics) {
  if (metrics.totalRequests === 0) return 1.0;
  
  // Success rate component (50% weight)
  const successComponent = metrics.successRate * 0.5;
  
  // Response time component (30% weight)
  const normalizedResponseTime = Math.min(metrics.averageResponseTime / PERFORMANCE_THRESHOLDS.maxResponseTime, 1);
  const speedComponent = (1 - normalizedResponseTime) * 0.3;
  
  // Availability component (20% weight)
  const availabilityComponent = metrics.isAvailable ? 0.2 : 0;
  
  return Math.max(0, Math.min(1, successComponent + speedComponent + availabilityComponent));
}

/**
 * Get the best performing provider for smart selection
 * @param {Array} availableProviders - List of available provider IDs
 * @param {string} role - Chat role (for role-specific optimization)
 * @returns {string|null} - Best provider ID or null if none suitable
 */
export function selectBestProvider(availableProviders, role = 'chat') {
  if (!availableProviders || availableProviders.length === 0) {
    return null;
  }
  
  if (availableProviders.length === 1) {
    return availableProviders[0];
  }
  
  // Get metrics for available providers
  const candidates = availableProviders
    .map(provider => ({
      provider,
      metrics: providerMetrics.get(provider)
    }))
    .filter(({ metrics }) => metrics && metrics.isAvailable)
    .sort((a, b) => {
      // Primary sort: performance score (descending)
      if (Math.abs(a.metrics.performanceScore - b.metrics.performanceScore) > 0.1) {
        return b.metrics.performanceScore - a.metrics.performanceScore;
      }
      
      // Secondary sort: success rate (descending)
      if (Math.abs(a.metrics.successRate - b.metrics.successRate) > 0.05) {
        return b.metrics.successRate - a.metrics.successRate;
      }
      
      // Tertiary sort: average response time (ascending)
      return a.metrics.averageResponseTime - b.metrics.averageResponseTime;
    });
  
  if (candidates.length === 0) {
    console.warn('No available providers found for smart selection');
    return availableProviders[0]; // Fallback to first available
  }
  
  const selected = candidates[0].provider;
  console.log(`Smart selection chose ${selected} (score: ${candidates[0].metrics.performanceScore.toFixed(3)})`);
  
  return selected;
}

/**
 * Get analytics data for all providers
 * @returns {Object} - Complete analytics data
 */
export function getAnalyticsData() {
  const providers = {};
  
  providerMetrics.forEach((metrics, provider) => {
    providers[provider] = {
      ...metrics,
      // Add recent performance metrics
      recentSuccessRate: calculateRecentSuccessRate(provider),
      recentAverageResponseTime: calculateRecentAverageResponseTime(provider)
    };
  });
  
  return {
    providers,
    summary: {
      totalRequests: requestHistory.length,
      smartSelectEnabled,
      recentRequests: requestHistory.slice(-10),
      performanceThresholds: PERFORMANCE_THRESHOLDS
    }
  };
}

/**
 * Calculate recent success rate for a provider
 * @param {string} provider - Provider ID
 * @returns {number} - Recent success rate
 */
function calculateRecentSuccessRate(provider) {
  const recentRequests = requestHistory
    .filter(r => r.provider === provider && r.success !== null)
    .slice(-PERFORMANCE_THRESHOLDS.evaluationWindow);
  
  if (recentRequests.length === 0) return 1.0;
  
  const successful = recentRequests.filter(r => r.success).length;
  return successful / recentRequests.length;
}

/**
 * Calculate recent average response time for a provider
 * @param {string} provider - Provider ID
 * @returns {number} - Recent average response time in ms
 */
function calculateRecentAverageResponseTime(provider) {
  const recentRequests = requestHistory
    .filter(r => r.provider === provider && r.responseTime !== null)
    .slice(-PERFORMANCE_THRESHOLDS.evaluationWindow);
  
  if (recentRequests.length === 0) return 0;
  
  const totalTime = recentRequests.reduce((sum, r) => sum + r.responseTime, 0);
  return totalTime / recentRequests.length;
}

/**
 * Enable or disable smart selection
 * @param {boolean} enabled - Whether to enable smart selection
 */
export function setSmartSelectEnabled(enabled) {
  smartSelectEnabled = enabled;
  console.log(`Smart selection ${enabled ? 'enabled' : 'disabled'}`);
  
  fireAnalyticsEvent('smart_select_toggled', {
    enabled
  });
}

/**
 * Check if smart selection is enabled
 * @returns {boolean} - Whether smart selection is enabled
 */
export function isSmartSelectEnabled() {
  return smartSelectEnabled;
}

/**
 * Fire analytics event (GA4 integration)
 * @param {string} eventName - Event name
 * @param {Object} parameters - Event parameters
 */
function fireAnalyticsEvent(eventName, parameters) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', eventName, parameters);
    } else if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  } catch (error) {
    console.warn('Failed to fire analytics event:', error);
  }
}

/**
 * Generate unique request ID
 * @returns {string} - Unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get fallback statistics
 * @returns {Object} - Fallback usage statistics
 */
export function getFallbackStats() {
  const totalRequests = requestHistory.length;
  const fallbackRequests = requestHistory.filter(r => r.fallbackUsed).length;
  const fallbackRate = totalRequests > 0 ? fallbackRequests / totalRequests : 0;
  
  const fallbacksByProvider = {};
  requestHistory
    .filter(r => r.fallbackUsed)
    .forEach(r => {
      fallbacksByProvider[r.provider] = (fallbacksByProvider[r.provider] || 0) + 1;
    });
  
  return {
    totalRequests,
    fallbackRequests,
    fallbackRate,
    fallbacksByProvider
  };
}

// Initialize analytics on module load
initializeAnalytics();