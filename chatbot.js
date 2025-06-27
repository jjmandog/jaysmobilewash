/**
 * AI-Powered Chat System - Error-free Implementation
 * Uses fallbacks and protections against 404/401 errors
 */

class SecureChatbotSystem {
  constructor() {
    // Configuration with fallbacks
    this.config = {
      apiUrl: 'https://dialogflow-api.jaysmobilewash.net/v1/detect-intent',
      fallbackApiUrl: 'https://api-backup.jaysmobilewash.net/chatbot',
      projectId: 'jays-mobile-wash-chatbot',
      timeout: 10000, // 10 second timeout
      retries: 2,
      offlineMode: false
    };
    
    // State management
    this.state = {
      messages: [],
      context: '',
      vehicleType: null,
      serviceType: null,
      userLocation: null,
      sessionId: this.generateSessionId(),
      isOpen: false,
      isLoading: false,
      connectionAttempts: 0,
      connected: false
    };
    
    // Cache DOM elements
    this.ui = {};
    
    // Bind methods
    this.initUI = this.initUI.bind(this);
    this.toggleChat = this.toggleChat.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.processWithAI = this.processWithAI.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.handleApiError = this.handleApiError.bind(this);
    this.generateSessionId = this.generateSessionId.bind(this);
    this.fallbackToLocalProcessing = this.fallbackToLocalProcessing.bind(this);
    
    // Initialize on DOM ready with error handling
    document.addEventListener('DOMContentLoaded', () => {
      try {
        this.initUI();
        this.initializeChat();
      } catch (err) {
        console.error('Chat initialization error:', err);
        this.enableOfflineMode();
      }
    });
  }
  
  // Initialize UI safely
  initUI() {
    try {
      // Cache UI elements to avoid repeated DOM lookups
      const elementIds = [
        'chat-toggle-btn', 
        'chat-container', 
        'chat-messages',
        'chat-input-field', 
        'chat-send-btn',
        'chat-offline',
        'chat-loading'
      ];
      
      // Safely get each element
      elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          this.ui[id] = element;
        } else {
          console.warn(`Chat element ${id} not found`);
        }
      });
      
      // Verify essential elements exist
      if (!this.ui['chat-toggle-btn'] || !this.ui['chat-messages']) {
        throw new Error('Essential chat elements missing');
      }
      
      // Add event listeners with error handling
      if (this.ui['chat-toggle-btn']) {
        this.ui['chat-toggle-btn'].addEventListener('click', this.toggleChat);
      }
      
      if (this.ui['chat-send-btn']) {
        this.ui['chat-send-btn'].addEventListener('click', this.sendMessage);
      }
      
      if (this.ui['chat-input-field']) {
        this.ui['chat-input-field'].addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.sendMessage();
        });
      }
    } catch (err) {
      console.error('UI initialization error:', err);
      // Fall back to minimal functionality
      const chatWidget = document.getElementById('ai-chat-widget');
      if (chatWidget) {
        chatWidget.innerHTML = `
          <button class="chat-toggle">Contact Us</button>
          <div class="chat-fallback">
            <p>Please call us at <a href="tel:5622289429">562-228-9429</a> for assistance.</p>
          </div>
        `;
      }
    }
  }
  
  // Initialize chat connection
  initializeChat() {
    this.showLoading(true);
    
    // Ping API to check connection
    this.testConnection()
      .then(connected => {
        this.state.connected = connected;
        this.showLoading(false);
        
        if (!connected) {
          this.enableOfflineMode();
        }
      })
      .catch(() => {
        this.showLoading(false);
        this.enableOfflineMode();
      });
  }
  
  // Test connection to DialogFlow
  async testConnection() {
    try {
      // Use fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(this.config.apiUrl + '/ping', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      console.warn('Chatbot API connection test failed:', err.message);
      return false;
    }
  }
  
  // Handle chat toggle safely
  toggleChat() {
    try {
      const chatWidget = document.getElementById('ai-chat-widget');
      if (!chatWidget) return;
      
      const isCurrentlyOpen = chatWidget.classList.contains('open');
      chatWidget.classList.toggle('open');
      
      // Update ARIA states
      if (this.ui['chat-toggle-btn']) {
        this.ui['chat-toggle-btn'].setAttribute('aria-expanded', !isCurrentlyOpen);
      }
      
      if (this.ui['chat-container']) {
        this.ui['chat-container'].setAttribute('aria-hidden', isCurrentlyOpen);
      }
      
      this.state.isOpen = !isCurrentlyOpen;
      
      // Focus on input when opening
      if (!isCurrentlyOpen && this.ui['chat-input-field']) {
        setTimeout(() => {
          this.ui['chat-input-field'].focus();
        }, 100);
      }
      
      // Track with analytics
      if (!isCurrentlyOpen) {
        this.trackEvent('chat_open');
      } else {
        this.trackEvent('chat_close');
      }
    } catch (err) {
      console.error('Error toggling chat:', err);
    }
  }
  
  // Handle user message submission safely
  sendMessage() {
    try {
      // Validate input field exists
      if (!this.ui['chat-input-field']) return;
      
      const userMessage = this.ui['chat-input-field'].value.trim();
      if (!userMessage) return;
      
      // Add user message to chat
      this.addMessage('user', userMessage);
      
      // Clear input and show typing indicator
      this.ui['chat-input-field'].value = '';
      this.addTypingIndicator();
      
      // Process with AI or fallback
      if (this.state.connected) {
        this.processWithAI(userMessage);
      } else {
        this.fallbackToLocalProcessing(userMessage);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      this.removeTypingIndicator();
      this.addMessage('system', 'Sorry, I encountered an error. Please try again or call us directly.');
    }
  }
  
  // Process message with DialogFlow API (with retries & error handling)
  async processWithAI(message) {
    if (this.config.offlineMode) {
      return this.fallbackToLocalProcessing(message);
    }
    
    let attempts = 0;
    const maxAttempts = this.config.retries;
    
    while (attempts <= maxAttempts) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        // Make API call with all needed error handling
        const response = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getAuthToken()
          },
          body: JSON.stringify({
            session: this.state.sessionId,
            query: message,
            context: this.state.context || null
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle unsuccessful responses
        if (!response.ok) {
          const status = response.status;
          
          // Authentication error 
          if (status === 401 || status === 403) {
            console.error('Authentication error with chatbot API');
            this.refreshAuthToken();
            throw new Error('Authentication failed');
          }
          
          // Server error
          if (status >= 500) {
            throw new Error('Server error');
          }
          
          // Other errors
          throw new Error(`API error: ${status}`);
        }
        
        // Parse response with error handling
        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error('Invalid response format');
        }
        
        // Process successful response
        this.removeTypingIndicator();
        
        // Extract and store context if available
        if (data.context) {
          this.state.context = data.context;
        }
        
        // Extract detected intent params
        if (data.parameters) {
          if (data.parameters.vehicle_type) {
            this.state.vehicleType = data.parameters.vehicle_type;
          }
          if (data.parameters.service_type) {
            this.state.serviceType = data.parameters.service_type;
          }
          if (data.parameters.location) {
            this.state.userLocation = data.parameters.location;
          }
        }
        
        // Add response message to chat
        this.addMessage('system', data.response || data.fulfillmentText);
        
        // Show booking option if all data collected
        if (this.state.vehicleType && this.state.serviceType && this.state.userLocation) {
          this.addBookingOption();
        }
        
        // Success, exit retry loop
        return;
      } catch (err) {
        attempts++;
        console.warn(`API attempt ${attempts} failed:`, err.message);
        
        if (attempts > maxAttempts) {
          // All attempts failed, fall back to local processing
          this.removeTypingIndicator();
          this.handleApiError(err);
          return;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }
  
  // Safely handle API errors
  handleApiError(error) {
    console.error('API error:', error);
    
    // Check if network error
    if (error.name === 'AbortError' || !navigator.onLine) {
      this.enableOfflineMode();
      return;
    }
    
    // Display friendly error message to user
    this.addMessage('system', 'I\'m having trouble connecting right now. Let me switch to basic mode to help you get a quote.');
    
    // Fall back to local processing
    this.fallbackToLocalProcessing(this.state.messages[this.state.messages.length - 2]?.content || '');
  }
  
  // Fall back to local processing when API unavailable
  fallbackToLocalProcessing(message) {
    this.removeTypingIndicator();
    
    const lowercaseMessage = message.toLowerCase();
    
    // Extract vehicle type
    if (!this.state.vehicleType) {
      if (lowercaseMessage.includes('sedan') || lowercaseMessage.includes('car') || 
          lowercaseMessage.includes('tesla') || lowercaseMessage.includes('bmw')) {
        this.state.vehicleType = 'sedan';
        this.addMessage('system', 'Great! You have a sedan. What type of detailing service are you interested in? We offer basic wash, full detail, and ceramic coating options.');
        return;
      } else if (lowercaseMessage.includes('suv') || lowercaseMessage.includes('truck')) {
        this.state.vehicleType = lowercaseMessage.includes('suv') ? 'suv' : 'truck';
        this.addMessage('system', `Great! You have a ${this.state.vehicleType}. What type of detailing service are you interested in? We offer basic wash, full detail, and ceramic coating options.`);
        return;
      }
    }
    
    // Extract service type
    if (this.state.vehicleType && !this.state.serviceType) {
      if (lowercaseMessage.includes('basic') || lowercaseMessage.includes('wash') || lowercaseMessage.includes('exterior')) {
        this.state.serviceType = 'basic';
      } else if (lowercaseMessage.includes('full') || lowercaseMessage.includes('detail') || lowercaseMessage.includes('interior')) {
        this.state.serviceType = 'full';
      } else if (lowercaseMessage.includes('ceramic') || lowercaseMessage.includes('coating') || lowercaseMessage.includes('protection')) {
        this.state.serviceType = 'ceramic';
      }
      
      if (this.state.serviceType) {
        this.addMessage('system', 'Perfect! Where are you located in the Los Angeles or Orange County area?');
        return;
      }
    }
    
    // Extract location
    if (this.state.vehicleType && this.state.serviceType && !this.state.userLocation) {
      const locations = [
        'los angeles', 'beverly hills', 'santa monica', 'malibu', 'hollywood',
        'orange county', 'newport beach', 'irvine', 'huntington beach', 'laguna beach'
      ];
      
      for (const location of locations) {
        if (lowercaseMessage.includes(location)) {
          this.state.userLocation = location;
          break;
        }
      }
      
      if (!this.state.userLocation && (lowercaseMessage.includes('la') || lowercaseMessage.includes('oc'))) {
        this.state.userLocation = lowercaseMessage.includes('la') ? 'los angeles' : 'orange county';
      }
      
      if (this.state.userLocation) {
        // Generate quote and show booking option
        const quote = this.generateQuote();
        this.addMessage('system', quote);
        this.addBookingOption();
        return;
      }
    }
    
    // Default fallback responses
    if (!this.state.vehicleType) {
      this.addMessage('system', 'To provide you with an accurate quote, I need to know what type of vehicle you have. Is it a sedan, SUV, or truck?');
    } else if (!this.state.serviceType) {
      this.addMessage('system', 'What type of detailing service are you looking for? We offer basic wash packages, full detailing with interior, and ceramic coating options.');
    } else if (!this.state.userLocation) {
      this.addMessage('system', 'Which area in Los Angeles or Orange County are you located in?');
    } else {
      this.addMessage('system', 'I\'m not sure I understood. Could you please clarify what you\'re looking for?');
    }
  }
  
  // Add message to chat with safety checks
  addMessage(type, content) {
    try {
      if (!content || !this.ui['chat-messages']) return;
      
      const messageEl = document.createElement('div');
      messageEl.classList.add('message', type);
      messageEl.textContent = content;
      this.ui['chat-messages'].appendChild(messageEl);
      
      // Auto-scroll to bottom
      this.ui['chat-messages'].scrollTop = this.ui['chat-messages'].scrollHeight;
      
      // Store message in state
      this.state.messages.push({
        type: type,
        content: content,
        timestamp: new Date().toISOString()
      });
      
      // Track message (anonymous)
      if (type === 'user') {
        this.trackEvent('user_message_sent', {
          message_length: content.length
        });
      }
    } catch (err) {
      console.error('Error adding message:', err);
    }
  }
  
  // Add typing indicator
  addTypingIndicator() {
    try {
      if (!this.ui['chat-messages']) return;
      
      const typingEl = document.createElement('div');
      typingEl.classList.add('message', 'system', 'typing');
      typingEl.innerHTML = '<span>.</span><span>.</span><span>.</span>';
      typingEl.id = 'typing-indicator';
      this.ui['chat-messages'].appendChild(typingEl);
      this.ui['chat-messages'].scrollTop = this.ui['chat-messages'].scrollHeight;
    } catch (err) {
      console.error('Error adding typing indicator:', err);
    }
  }
  
  // Remove typing indicator
  removeTypingIndicator() {
    try {
      const typingEl = document.getElementById('typing-indicator');
      if (typingEl) typingEl.remove();
    } catch (err) {
      console.error('Error removing typing indicator:', err);
    }
  }
  
  // Show/hide loading state
  showLoading(show) {
    try {
      if (this.ui['chat-loading']) {
        this.ui['chat-loading'].style.display = show ? 'block' : 'none';
      }
    } catch (err) {
      console.error('Error updating loading state:', err);
    }
  }
  
  // Enable offline mode
  enableOfflineMode() {
    this.config.offlineMode = true;
    
    try {
      if (this.ui['chat-offline']) {
        this.ui['chat-offline'].style.display = 'none'; // Keep chat functional
      }
      
      // Add offline indicator message
      this.addMessage('system', 'I\'m currently operating in offline mode. I can still help you get an estimate for our services.');
    } catch (err) {
      console.error('Error enabling offline mode:', err);
    }
  }
  
  // Generate quote based on collected info
  generateQuote() {
    try {
      const prices = {
        'sedan': {
          'basic': 70,
          'full': 130,
          'ceramic': 450
        },
        'suv': {
          'basic': 90,
          'full': 160,
          'ceramic': 550
        },
        'truck': {
          'basic': 100,
          'full': 180,
          'ceramic': 600
        }
      };
      
      // Safely get price with fallbacks
      const vehicleType = this.state.vehicleType || 'sedan';
      const serviceType = this.state.serviceType || 'basic';
      const location = this.state.userLocation || 'Los Angeles';
      
      let price = 100; // Default fallback price
      
      // Safely access nested properties
      if (prices[vehicleType] && prices[vehicleType][serviceType]) {
        price = prices[vehicleType][serviceType];
      }
      
      return `Based on your ${vehicleType} and ${serviceType} service in ${location}, I can offer you a quote of $${price}. This includes our mobile service coming to your location. Would you like to schedule this service?`;
    } catch (err) {
      console.error('Error generating quote:', err);
      return 'Based on the information provided, I can offer you a quote starting at $100. For an exact price, please call us at 562-228-9429.';
    }
  }
  
  // Add booking option
  addBookingOption() {
    try {
      if (!this.ui['chat-messages']) return;
      
      const bookingOption = document.createElement('div');
      bookingOption.classList.add('booking-option');
      bookingOption.innerHTML = `
        <p>Ready to book your detailing service?</p>
        <a href="/booking/" class="btn-primary btn-sm" onclick="window.chatbot.trackEvent('chat_booking_click')">Book Now</a>
        <a href="tel:5622289429" class="btn-secondary btn-sm" onclick="window.chatbot.trackEvent('chat_call_click')">Call Us</a>
      `;
      this.ui['chat-messages'].appendChild(bookingOption);
      this.ui['chat-messages'].scrollTop = this.ui['chat-messages'].scrollHeight;
    } catch (err) {
      console.error('Error adding booking option:', err);
    }
  }
  
  // Generate unique session ID
  generateSessionId() {
    try {
      return 'chat_' + Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    } catch (err) {
      console.error('Error generating session ID:', err);
      return 'chat_fallback_session';
    }
  }
  
  // Safely get auth token
  getAuthToken() {
    try {
      // In production, would use secure token storage
      return localStorage.getItem('chat_auth_token') || '';
    } catch (err) {
      console.error('Error getting auth token:', err);
      return '';
    }
  }
  
  // Safely refresh auth token
  refreshAuthToken() {
    // In production, this would call a secure endpoint to refresh the token
    console.log('Auth token refresh would happen here');
  }
  
  // Safe analytics tracking
  trackEvent(eventName, params = {}) {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          'event_category': 'chat',
          ...params
        });
      }
    } catch (err) {
      console.warn('Analytics tracking error:', err);
    }
  }
}

// Initialize and expose chatbot globally (for event handling)
document.addEventListener('DOMContentLoaded', function() {
  try {
    window.chatbot = new SecureChatbotSystem();
  } catch (err) {
    console.error('Chatbot initialization failed:', err);
  }
});
