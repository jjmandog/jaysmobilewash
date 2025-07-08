/**
 * Chatbot Settings Sync Utility
 * Bridges frontend localStorage with backend API for seamless settings management
 */

class ChatbotSettingsSync {
  constructor() {
    this.apiBase = '/api/chatbot-settings';
    this.userId = this.generateUserId();
    this.syncInterval = 30000; // 30 seconds
    this.lastSync = null;
    this.pendingChanges = false;
    
    this.initSync();
  }

  generateUserId() {
    // Generate a unique user ID based on session/browser fingerprint
    let userId = localStorage.getItem('chatbot-user-id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chatbot-user-id', userId);
    }
    return userId;
  }

  async initSync() {
    try {
      // Load user settings from backend on init
      await this.loadFromBackend();
      
      // Set up periodic sync
      setInterval(() => this.periodicSync(), this.syncInterval);
      
      // Listen for localStorage changes
      this.setupLocalStorageListeners();
      
      console.log('🔄 Chatbot settings sync initialized');
    } catch (error) {
      console.warn('Settings sync initialization failed:', error);
    }
  }

  setupLocalStorageListeners() {
    // Override localStorage methods to detect changes
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = (key, value) => {
      originalSetItem.call(localStorage, key, value);
      if (this.isChatbotKey(key)) {
        this.pendingChanges = true;
        this.debouncedSync();
      }
    };
    
    localStorage.removeItem = (key) => {
      originalRemoveItem.call(localStorage, key);
      if (this.isChatbotKey(key)) {
        this.pendingChanges = true;
        this.debouncedSync();
      }
    };
  }

  isChatbotKey(key) {
    return key.startsWith('chatbot-');
  }

  debouncedSync = this.debounce(() => {
    this.syncToBackend();
  }, 2000);

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async loadFromBackend() {
    try {
      const response = await fetch(`${this.apiBase}?action=user&userId=${this.userId}`);
      const data = await response.json();
      
      if (data.success) {
        const { roleAssignments, selectedModel, preferences } = data.data;
        
        // Update localStorage with backend data
        if (roleAssignments) {
          localStorage.setItem('chatbot-role-assignments', JSON.stringify(roleAssignments));
        }
        
        if (selectedModel) {
          localStorage.setItem('chatbot-selected-model', selectedModel);
        }
        
        if (preferences) {
          localStorage.setItem('chatbot-user-preferences', JSON.stringify(preferences));
        }
        
        this.lastSync = Date.now();
        console.log('✅ Settings loaded from backend');
        return true;
      }
    } catch (error) {
      console.warn('Failed to load settings from backend:', error);
      return false;
    }
  }

  async syncToBackend() {
    if (!this.pendingChanges) return;

    try {
      const settings = this.gatherLocalSettings();
      
      const response = await fetch(`${this.apiBase}?action=save-user-settings&userId=${this.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.pendingChanges = false;
        this.lastSync = Date.now();
        console.log('✅ Settings synced to backend');
        
        // Track the sync event
        this.trackAPIUsage('settings-sync', '/api/chatbot-settings', true);
      } else {
        console.warn('Failed to sync settings to backend:', data.error);
      }
    } catch (error) {
      console.warn('Error syncing settings to backend:', error);
    }
  }

  gatherLocalSettings() {
    const settings = {};
    
    // Gather role assignments
    const roleAssignments = localStorage.getItem('chatbot-role-assignments');
    if (roleAssignments) {
      try {
        settings.roleAssignments = JSON.parse(roleAssignments);
      } catch (e) {
        console.warn('Invalid role assignments in localStorage');
      }
    }
    
    // Gather selected model
    const selectedModel = localStorage.getItem('chatbot-selected-model');
    if (selectedModel) {
      settings.selectedModel = selectedModel;
    }
    
    // Gather user preferences
    const preferences = localStorage.getItem('chatbot-user-preferences');
    if (preferences) {
      try {
        settings.preferences = JSON.parse(preferences);
      } catch (e) {
        console.warn('Invalid preferences in localStorage');
      }
    }
    
    // Gather conversation history for analytics
    const history = localStorage.getItem('chatbot-history');
    if (history) {
      try {
        const messages = JSON.parse(history);
        settings.preferences = {
          ...settings.preferences,
          messageCount: messages.length,
          lastActivity: Date.now()
        };
      } catch (e) {
        console.warn('Invalid history in localStorage');
      }
    }
    
    return settings;
  }

  async periodicSync() {
    // Only sync if there are pending changes or it's been a while
    const timeSinceLastSync = Date.now() - (this.lastSync || 0);
    const shouldSync = this.pendingChanges || timeSinceLastSync > 300000; // 5 minutes
    
    if (shouldSync) {
      await this.syncToBackend();
    }
  }

  async trackAPIUsage(apiId, endpoint, success = true) {
    try {
      await fetch(`${this.apiBase}?action=track-api-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId, endpoint, success })
      });
    } catch (error) {
      // Silently fail for analytics
      console.debug('Failed to track API usage:', error);
    }
  }

  // Public methods for manual sync
  async forceSyncToBackend() {
    this.pendingChanges = true;
    return await this.syncToBackend();
  }

  async forceSyncFromBackend() {
    return await this.loadFromBackend();
  }

  // Method to get backend settings for admin override
  async getBackendSettings() {
    try {
      const response = await fetch(`${this.apiBase}?action=user&userId=${this.userId}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.warn('Failed to get backend settings:', error);
      return null;
    }
  }

  // Method to reset to defaults
  async resetToDefaults() {
    try {
      const response = await fetch(`${this.apiBase}?action=defaults`);
      const data = await response.json();
      
      if (data.success) {
        const { defaultRoleAssignments } = data.data;
        
        // Update localStorage
        localStorage.setItem('chatbot-role-assignments', JSON.stringify(defaultRoleAssignments));
        localStorage.setItem('chatbot-selected-model', 'auto');
        localStorage.removeItem('chatbot-user-preferences');
        
        // Sync to backend
        await this.forceSyncToBackend();
        
        console.log('✅ Settings reset to defaults');
        return true;
      }
    } catch (error) {
      console.warn('Failed to reset to defaults:', error);
      return false;
    }
  }

  // Method to export user data
  exportUserData() {
    const settings = this.gatherLocalSettings();
    const exportData = {
      userId: this.userId,
      timestamp: new Date().toISOString(),
      settings,
      localStorage: this.getChatbotLocalStorageData()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-user-data-${this.userId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getChatbotLocalStorageData() {
    const chatbotData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (this.isChatbotKey(key)) {
        chatbotData[key] = localStorage.getItem(key);
      }
    }
    return chatbotData;
  }

  // Status methods
  getSyncStatus() {
    return {
      userId: this.userId,
      lastSync: this.lastSync,
      pendingChanges: this.pendingChanges,
      timeSinceLastSync: this.lastSync ? Date.now() - this.lastSync : null
    };
  }

  isOnline() {
    return navigator.onLine;
  }
}

// Auto-initialize sync when script loads
if (typeof window !== 'undefined') {
  window.chatbotSettingsSync = new ChatbotSettingsSync();
  
  // Add debug methods to window for admin access
  window.chatbotDebug = {
    getSync: () => window.chatbotSettingsSync,
    exportData: () => window.chatbotSettingsSync.exportUserData(),
    resetSettings: () => window.chatbotSettingsSync.resetToDefaults(),
    forceSyncTo: () => window.chatbotSettingsSync.forceSyncToBackend(),
    forceSyncFrom: () => window.chatbotSettingsSync.forceSyncFromBackend(),
    getStatus: () => window.chatbotSettingsSync.getSyncStatus()
  };
  
  console.log('🔧 Chatbot debug tools available via window.chatbotDebug');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatbotSettingsSync;
}
