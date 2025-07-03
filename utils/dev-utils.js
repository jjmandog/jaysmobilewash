/**
 * Development Utilities
 * Collection of utility functions for development and debugging
 * Added as part of placeholder PR for ongoing development work
 */

/**
 * Simple logging utility with timestamp
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warn, error)
 */
export function devLog(message, level = 'info') {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console[level](`${prefix} ${message}`);
  }
}

/**
 * Check if running in development environment
 * @returns {boolean} True if in development mode
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Simple performance timer for development
 * @param {string} label - Label for the timer
 * @returns {function} Function to stop the timer
 */
export function devTimer(label = 'Timer') {
  if (!isDevelopment()) return () => {};
  
  const startTime = performance.now();
  devLog(`${label} started`, 'info');
  
  return () => {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    devLog(`${label} completed in ${duration}ms`, 'info');
  };
}

/**
 * Development-only feature flag checker
 * @param {string} feature - Feature name to check
 * @returns {boolean} True if feature is enabled
 */
export function isFeatureEnabled(feature) {
  if (!isDevelopment()) return false;
  
  // For now, just return true for development
  // In future, this could check environment variables or config
  return true;
}