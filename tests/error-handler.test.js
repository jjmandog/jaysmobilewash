/**
 * Tests for centralized error handler
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  logError, 
  logWarning, 
  logInfo, 
  logDebug,
  configure,
  getConfig,
  setBackendReporting,
  getErrorStats,
  initializeErrorHandler,
  ERROR_LEVELS,
  MODULE_CONTEXTS,
  __testing__
} from '../src/utils/errorHandler.js';

// Mock global objects for browser environment
global.window = {
  addEventListener: vi.fn(),
  location: { href: 'http://test.com', pathname: '/test' }
};
global.document = { 
  readyState: 'complete',
  referrer: 'http://test.com'
};
global.navigator = { userAgent: 'test-agent' };
global.fetch = vi.fn();

describe('Centralized Error Handler', () => {
  let consoleSpy;
  
  beforeEach(() => {
    // Reset configuration
    configure({
      prefix: '[JAYS_CHAT_ERROR]',
      enableBackendReporting: false,
      enableConsoleOutput: true,
      enableStackTrace: true,
      logTimestamp: false // Disable timestamps for consistent testing
    });
    
    // Clear error queue
    __testing__.errorQueue.length = 0;
    
    // Spy on console methods
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {})
    };
  });
  
  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    vi.clearAllMocks();
  });

  describe('Basic Logging Functions', () => {
    it('should log error messages with correct format', () => {
      const testError = new Error('Test error');
      logError(MODULE_CONTEXTS.CHAT_BOT, 'Test error message', testError);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[JAYS_CHAT_ERROR]')
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]')
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ChatBot]')
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    it('should log warning messages with correct format', () => {
      logWarning(MODULE_CONTEXTS.ANALYTICS, 'Test warning message');
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[JAYS_CHAT_ERROR]')
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]')
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics]')
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      );
    });

    it('should log info messages with correct format', () => {
      logInfo(MODULE_CONTEXTS.STORAGE, 'Test info message');
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[JAYS_CHAT_ERROR]')
      );
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]')
      );
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[LocalStorage]')
      );
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });

    it('should log debug messages with correct format', () => {
      logDebug(MODULE_CONTEXTS.API, 'Test debug message');
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('[JAYS_CHAT_ERROR]')
      );
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]')
      );
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('[API]')
      );
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message')
      );
    });
  });

  describe('Error Details Handling', () => {
    it('should handle Error objects with stack traces', () => {
      const testError = new Error('Test error with stack');
      testError.stack = 'Error: Test error with stack\n    at test.js:1:1';
      
      logError(MODULE_CONTEXTS.CHAT_ROUTER, 'Error with stack', testError);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error with stack')
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Stack:')
      );
    });

    it('should handle object error details', () => {
      const errorDetails = { code: 500, message: 'Server error' };
      
      logError(MODULE_CONTEXTS.API, 'API error', errorDetails);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('{"code":500,"message":"Server error"}')
      );
    });

    it('should handle string error details', () => {
      logError(MODULE_CONTEXTS.GENERAL, 'Simple error', 'String error detail');
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('String error detail')
      );
    });
  });

  describe('Configuration', () => {
    it('should allow configuration updates', () => {
      const newConfig = {
        prefix: '[CUSTOM_PREFIX]',
        enableConsoleOutput: false,
        enableStackTrace: false
      };
      
      configure(newConfig);
      const currentConfig = getConfig();
      
      expect(currentConfig.prefix).toBe('[CUSTOM_PREFIX]');
      expect(currentConfig.enableConsoleOutput).toBe(false);
      expect(currentConfig.enableStackTrace).toBe(false);
    });

    it('should disable console output when configured', () => {
      configure({ enableConsoleOutput: false });
      
      logError(MODULE_CONTEXTS.GENERAL, 'Test message');
      
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should disable stack traces when configured', () => {
      configure({ enableStackTrace: false });
      
      const testError = new Error('Test error');
      testError.stack = 'Error stack trace';
      
      logError(MODULE_CONTEXTS.GENERAL, 'Test message', testError);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.not.stringContaining('Stack:')
      );
    });
  });

  describe('Backend Reporting', () => {
    it('should queue errors for backend reporting when enabled', () => {
      setBackendReporting(true, '/api/test-errors');
      
      logError(MODULE_CONTEXTS.CHAT_BOT, 'Test backend error');
      
      const stats = getErrorStats();
      expect(stats.queueLength).toBe(1);
      expect(stats.config.enableBackendReporting).toBe(true);
      expect(stats.config.backendEndpoint).toBe('/api/test-errors');
    });

    it('should not queue errors when backend reporting is disabled', () => {
      setBackendReporting(false);
      
      logError(MODULE_CONTEXTS.CHAT_BOT, 'Test error');
      
      const stats = getErrorStats();
      expect(stats.queueLength).toBe(0);
      expect(stats.config.enableBackendReporting).toBe(false);
    });
  });

  describe('Message Formatting', () => {
    it('should format messages correctly without timestamps', () => {
      const formatted = __testing__.formatErrorMessage(
        ERROR_LEVELS.ERROR,
        MODULE_CONTEXTS.CHAT_BOT,
        'Test message',
        null
      );
      
      expect(formatted).toBe('[JAYS_CHAT_ERROR]  [ERROR] [ChatBot] Test message');
    });

    it('should format messages correctly with timestamps', () => {
      configure({ logTimestamp: true });
      
      const formatted = __testing__.formatErrorMessage(
        ERROR_LEVELS.WARN,
        MODULE_CONTEXTS.API,
        'Test message',
        null
      );
      
      expect(formatted).toMatch(/\[JAYS_CHAT_ERROR\] \[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[WARN\] \[API\] Test message/);
    });

    it('should handle unknown modules gracefully', () => {
      const formatted = __testing__.formatErrorMessage(
        ERROR_LEVELS.INFO,
        null,
        'Test message',
        null
      );
      
      expect(formatted).toContain('[Unknown]');
    });
  });

  describe('Error Levels', () => {
    it('should have correct error level constants', () => {
      expect(ERROR_LEVELS.ERROR).toBe('ERROR');
      expect(ERROR_LEVELS.WARN).toBe('WARN');
      expect(ERROR_LEVELS.INFO).toBe('INFO');
      expect(ERROR_LEVELS.DEBUG).toBe('DEBUG');
    });
  });

  describe('Module Contexts', () => {
    it('should have all required module contexts', () => {
      const requiredContexts = [
        'CHAT_BOT', 'CHAT_ROUTER', 'AI_UTILS', 'QUOTE_ENGINE',
        'SETTINGS_PANEL', 'AUDIO_PLAYER', 'ROUTE_HANDLER',
        'ANALYTICS', 'STORAGE', 'API', 'BACKGROUND_ANIMATOR', 'GENERAL'
      ];
      
      requiredContexts.forEach(context => {
        expect(MODULE_CONTEXTS).toHaveProperty(context);
        expect(typeof MODULE_CONTEXTS[context]).toBe('string');
      });
    });
  });

  describe('Error Statistics', () => {
    it('should provide accurate error statistics', () => {
      const stats = getErrorStats();
      
      expect(stats).toHaveProperty('queueLength');
      expect(stats).toHaveProperty('isProcessing');
      expect(stats).toHaveProperty('config');
      expect(typeof stats.queueLength).toBe('number');
      expect(typeof stats.isProcessing).toBe('boolean');
      expect(typeof stats.config).toBe('object');
    });
  });

  describe('Initialization', () => {
    it('should initialize without errors', () => {
      expect(() => {
        initializeErrorHandler();
      }).not.toThrow();
    });
  });
});