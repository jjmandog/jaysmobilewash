/**
 * Centralized Error Handler for Jay's Mobile Wash
 * Production-grade error handling with consistent logging and optional backend reporting
 */

/**
 * Error levels for consistent logging
 */
export const ERROR_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Default module contexts for error categorization
 */
export const MODULE_CONTEXTS = {
  CHAT_BOT: 'ChatBot',
  CHAT_ROUTER: 'ChatRouter', 
  AI_UTILS: 'AIUtils',
  QUOTE_ENGINE: 'QuoteEngine',
  SETTINGS_PANEL: 'SettingsPanel',
  AUDIO_PLAYER: 'AudioPlayer',
  ROUTE_HANDLER: 'RouteHandler',
  ANALYTICS: 'Analytics',
  STORAGE: 'LocalStorage',
  API: 'API',
  BACKGROUND_ANIMATOR: 'BackgroundAnimator',
  GENERAL: 'General'
};

/**
 * Configuration object for error handler
 */
const config = {
  prefix: '[JAYS_CHAT_ERROR]',
  enableBackendReporting: false, // Set to true to enable backend error reporting
  backendEndpoint: '/api/errors', // Backend endpoint for error reporting
  maxRetries: 3,
  retryDelay: 1000,
  enableConsoleOutput: true,
  enableStackTrace: true,
  logTimestamp: true
};

/**
 * Internal error queue for batch processing
 */
let errorQueue = [];
let isProcessingQueue = false;

/**
 * Format timestamp for consistent logging
 */
function formatTimestamp() {
  return new Date().toISOString();
}

/**
 * Create formatted error message with context
 * @param {string} level - Error level (ERROR, WARN, INFO, DEBUG)
 * @param {string} module - Module/context where error occurred
 * @param {string} message - Error message
 * @param {Error|Object} errorDetails - Error object or additional details
 * @returns {string} Formatted error message
 */
function formatErrorMessage(level, module, message, errorDetails = null) {
  const timestamp = config.logTimestamp ? `[${formatTimestamp()}]` : '';
  const moduleContext = module ? `[${module}]` : '[Unknown]';
  const levelPrefix = `[${level}]`;
  
  let formattedMessage = `${config.prefix} ${timestamp} ${levelPrefix} ${moduleContext} ${message}`;
  
  if (errorDetails) {
    if (errorDetails instanceof Error) {
      formattedMessage += ` - ${errorDetails.message}`;
      if (config.enableStackTrace && errorDetails.stack) {
        formattedMessage += `\nStack: ${errorDetails.stack}`;
      }
    } else if (typeof errorDetails === 'object') {
      formattedMessage += ` - ${JSON.stringify(errorDetails)}`;
    } else {
      formattedMessage += ` - ${String(errorDetails)}`;
    }
  }
  
  return formattedMessage;
}

/**
 * Send error to backend (if enabled)
 * @param {Object} errorData - Error data to send
 * 
 * BACKEND ERROR REPORTING STUB:
 * This function provides a complete implementation for sending errors to a backend service.
 * It's currently disabled by default (config.enableBackendReporting = false).
 * 
 * To enable backend error reporting:
 * 1. Set up a backend endpoint that accepts POST requests with error data
 * 2. Call setBackendReporting(true, '/your-error-endpoint') 
 * 3. The error handler will automatically batch and send errors to your backend
 * 
 * Error data structure sent to backend:
 * {
 *   level: 'ERROR|WARN|INFO|DEBUG',
 *   module: 'ModuleName',
 *   message: 'Error message',
 *   errorDetails: { message, stack, name } | Object,
 *   additionalData: Object,
 *   formattedMessage: 'Full formatted message',
 *   timestamp: 'ISO 8601 timestamp',
 *   userAgent: 'Browser user agent',
 *   url: 'Current page URL',
 *   referrer: 'Previous page URL'
 * }
 */
async function sendToBackend(errorData) {
  if (!config.enableBackendReporting) {
    return;
  }
  
  try {
    const response = await fetch(config.backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...errorData,
        timestamp: formatTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend error reporting failed: ${response.status}`);
    }
  } catch (error) {
    // Fallback to console if backend reporting fails to avoid infinite loops
    console.error(`${config.prefix} [ErrorHandler] Backend reporting failed:`, error.message);
  }
}

/**
 * Process error queue for batch backend reporting
 */
async function processErrorQueue() {
  if (isProcessingQueue || errorQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  
  try {
    const errors = [...errorQueue];
    errorQueue = [];
    
    for (const errorData of errors) {
      await sendToBackend(errorData);
    }
  } catch (error) {
    console.error(`${config.prefix} [ErrorHandler] Queue processing failed:`, error.message);
  } finally {
    isProcessingQueue = false;
  }
}

/**
 * Main error logging function
 * @param {string} level - Error level
 * @param {string} module - Module context
 * @param {string} message - Error message
 * @param {Error|Object} errorDetails - Error object or additional details
 * @param {Object} additionalData - Additional context data
 */
function logErrorInternal(level, module, message, errorDetails = null, additionalData = {}) {
  const formattedMessage = formatErrorMessage(level, module, message, errorDetails);
  
  // Console output based on level
  if (config.enableConsoleOutput) {
    switch (level) {
      case ERROR_LEVELS.ERROR:
        console.error(formattedMessage);
        break;
      case ERROR_LEVELS.WARN:
        console.warn(formattedMessage);
        break;
      case ERROR_LEVELS.INFO:
        console.info(formattedMessage);
        break;
      case ERROR_LEVELS.DEBUG:
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }
  
  // Add to error queue for backend reporting
  if (config.enableBackendReporting) {
    const errorData = {
      level,
      module,
      message,
      errorDetails: errorDetails instanceof Error ? {
        message: errorDetails.message,
        stack: errorDetails.stack,
        name: errorDetails.name
      } : errorDetails,
      additionalData,
      formattedMessage
    };
    
    errorQueue.push(errorData);
    
    // Process queue with debouncing
    setTimeout(processErrorQueue, 100);
  }
}

/**
 * Public API Functions
 */

/**
 * Log error level messages
 * @param {string} module - Module context
 * @param {string} message - Error message
 * @param {Error|Object} errorDetails - Error object or additional details
 * @param {Object} additionalData - Additional context data
 */
export function logError(module, message, errorDetails = null, additionalData = {}) {
  logErrorInternal(ERROR_LEVELS.ERROR, module, message, errorDetails, additionalData);
}

/**
 * Log warning level messages
 * @param {string} module - Module context
 * @param {string} message - Warning message
 * @param {Error|Object} errorDetails - Error object or additional details
 * @param {Object} additionalData - Additional context data
 */
export function logWarning(module, message, errorDetails = null, additionalData = {}) {
  logErrorInternal(ERROR_LEVELS.WARN, module, message, errorDetails, additionalData);
}

/**
 * Log info level messages
 * @param {string} module - Module context
 * @param {string} message - Info message
 * @param {Error|Object} errorDetails - Error object or additional details
 * @param {Object} additionalData - Additional context data
 */
export function logInfo(module, message, errorDetails = null, additionalData = {}) {
  logErrorInternal(ERROR_LEVELS.INFO, module, message, errorDetails, additionalData);
}

/**
 * Log debug level messages
 * @param {string} module - Module context
 * @param {string} message - Debug message
 * @param {Error|Object} errorDetails - Error object or additional details
 * @param {Object} additionalData - Additional context data
 */
export function logDebug(module, message, errorDetails = null, additionalData = {}) {
  logErrorInternal(ERROR_LEVELS.DEBUG, module, message, errorDetails, additionalData);
}

/**
 * Configure error handler
 * @param {Object} newConfig - Configuration options
 */
export function configure(newConfig = {}) {
  Object.assign(config, newConfig);
}

/**
 * Get current configuration
 * @returns {Object} Current configuration
 */
export function getConfig() {
  return { ...config };
}

/**
 * Enable/disable backend error reporting
 * @param {boolean} enabled - Whether to enable backend reporting
 * @param {string} endpoint - Backend endpoint (optional)
 */
export function setBackendReporting(enabled, endpoint = null) {
  config.enableBackendReporting = enabled;
  if (endpoint) {
    config.backendEndpoint = endpoint;
  }
}

/**
 * Get error statistics
 * @returns {Object} Error statistics
 */
export function getErrorStats() {
  return {
    queueLength: errorQueue.length,
    isProcessing: isProcessingQueue,
    config: { ...config }
  };
}

/**
 * Global error handlers setup
 */
function setupGlobalErrorHandlers() {
  // Uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    logError(
      MODULE_CONTEXTS.GENERAL,
      'Uncaught JavaScript error',
      event.error || new Error(event.message),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: event.error?.stack || 'No stack trace available'
      }
    );
  });
  
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      MODULE_CONTEXTS.GENERAL,
      'Unhandled promise rejection',
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        promise: event.promise,
        reason: event.reason
      }
    );
    
    // Prevent default browser error logging
    event.preventDefault();
  });
  
  // Resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      logError(
        MODULE_CONTEXTS.GENERAL,
        'Resource loading error',
        new Error(`Failed to load: ${event.target.src || event.target.href || 'Unknown resource'}`),
        {
          tagName: event.target.tagName,
          src: event.target.src,
          href: event.target.href
        }
      );
    }
  }, true);
}

/**
 * Initialize error handler
 */
export function initializeErrorHandler() {
  setupGlobalErrorHandlers();
  logInfo(MODULE_CONTEXTS.GENERAL, 'Error handler initialized successfully');
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  // Expose error handler to global window object for vanilla JS files
  window.errorHandler = {
    logError,
    logWarning,
    logInfo,
    logDebug,
    configure,
    getConfig,
    setBackendReporting,
    getErrorStats,
    MODULE_CONTEXTS,
    ERROR_LEVELS
  };
  
  // Initialize on DOM ready or immediately if DOM is already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeErrorHandler);
  } else {
    initializeErrorHandler();
  }
}

// Export for testing
export const __testing__ = {
  formatErrorMessage,
  sendToBackend,
  processErrorQueue,
  config,
  errorQueue
};