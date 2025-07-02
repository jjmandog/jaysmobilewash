/**
 * Chatbot Event Handler
 * Robust implementation for SPA compatibility and React Snap prerendering
 * Ensures WCAG compliance and proper event binding
 */

class ChatbotHandler {
    constructor() {
        this.isInitialized = false;
        this.isWidgetOpen = false;
        this.elements = {};
        this.retryCount = 0;
        this.maxRetries = 5;
        this.retryDelay = 100;
        this.initializationInProgress = false;
        this.popstateListenerAdded = false;
        this.mutationObserverAdded = false;
        
        // Bind methods to preserve context
        this.init = this.init.bind(this);
        this.toggleWidget = this.toggleWidget.bind(this);
        this.openWidget = this.openWidget.bind(this);
        this.closeWidget = this.closeWidget.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        this.addMessage = this.addMessage.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        
        // Initialize when ready
        this.initializeWhenReady();
    }
    
    /**
     * Initialize when DOM and scripts are ready
     * Compatible with React Snap prerendering and SPA navigation
     */
    initializeWhenReady() {
        // Skip if already trying to initialize
        if (this.initializationInProgress) {
            return;
        }
        
        this.initializationInProgress = true;
        
        // Multiple initialization strategies for different scenarios
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init);
        } else {
            // DOM already loaded, but wait a bit for React Snap hydration
            setTimeout(this.init, 50);
        }
        
        // Also listen for SPA navigation changes (only once)
        if (!this.popstateListenerAdded) {
            window.addEventListener('popstate', () => {
                if (!this.isInitialized) {
                    setTimeout(this.init, 100);
                }
            });
            this.popstateListenerAdded = true;
        }
        
        // Listen for dynamic content changes (React Snap hydration) - only once
        if (typeof MutationObserver !== 'undefined' && !this.mutationObserverAdded) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && !this.isInitialized) {
                        // Check if our elements are now available
                        setTimeout(this.init, 50);
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            this.mutationObserverAdded = true;
        }
    }
    
    /**
     * Initialize the chatbot with proper error handling and retries
     */
    init() {
        try {
            // Skip if already initialized
            if (this.isInitialized) {
                return;
            }
            
            // Get DOM elements
            this.elements = {
                bubble: document.getElementById('chat-bubble'),
                widget: document.getElementById('chat-widget'),
                messages: document.getElementById('chatMessages'),
                input: document.getElementById('chatInput'),
                sendButton: document.getElementById('sendButton'),
                closeButton: document.getElementById('chat-close')
            };
            
            // Check if all required elements exist
            const requiredElements = ['bubble', 'widget', 'messages', 'input', 'sendButton', 'closeButton'];
            const missingElements = requiredElements.filter(key => !this.elements[key]);
            
            if (missingElements.length > 0) {
                if (this.retryCount < this.maxRetries) {
                    console.log(`Chatbot: Missing elements [${missingElements.join(', ')}], retrying... (${this.retryCount + 1}/${this.maxRetries})`);
                    this.retryCount++;
                    setTimeout(this.init, this.retryDelay * this.retryCount);
                    return;
                } else {
                    console.error('Chatbot: Failed to initialize after maximum retries. Missing elements:', missingElements);
                    return;
                }
            }
            
            // Add WCAG compliance attributes
            this.setupAccessibility();
            
            // Bind event listeners
            this.bindEvents();
            
            // Mark as initialized
            this.isInitialized = true;
            console.log('✅ Chatbot initialized successfully');
            
            // Dispatch custom event for analytics/testing
            window.dispatchEvent(new CustomEvent('chatbotInitialized', {
                detail: { timestamp: Date.now() }
            }));
            
        } catch (error) {
            console.error('Chatbot initialization error:', error);
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                setTimeout(this.init, this.retryDelay * this.retryCount);
            }
        }
    }
    
    /**
     * Setup WCAG compliance attributes
     */
    setupAccessibility() {
        // Chat bubble accessibility
        this.elements.bubble.setAttribute('role', 'button');
        this.elements.bubble.setAttribute('aria-label', 'Open chat assistant');
        this.elements.bubble.setAttribute('aria-expanded', 'false');
        this.elements.bubble.setAttribute('tabindex', '0');
        this.elements.bubble.setAttribute('aria-haspopup', 'dialog');
        
        // Chat widget accessibility
        this.elements.widget.setAttribute('role', 'dialog');
        this.elements.widget.setAttribute('aria-label', 'Chat Assistant');
        this.elements.widget.setAttribute('aria-hidden', 'true');
        this.elements.widget.setAttribute('aria-modal', 'false');
        
        // Input accessibility
        this.elements.input.setAttribute('aria-label', 'Type your message');
        this.elements.input.setAttribute('aria-describedby', 'chat-instructions');
        
        // Send button accessibility
        this.elements.sendButton.setAttribute('aria-label', 'Send message');
        
        // Close button accessibility
        this.elements.closeButton.setAttribute('aria-label', 'Close chat');
        
        // Add hidden instructions for screen readers
        if (!document.getElementById('chat-instructions')) {
            const instructions = document.createElement('div');
            instructions.id = 'chat-instructions';
            instructions.className = 'sr-only';
            instructions.textContent = 'Press Enter to send message, Escape to close chat';
            instructions.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;';
            document.body.appendChild(instructions);
        }
    }
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Chat bubble click and keyboard events
        this.elements.bubble.addEventListener('click', this.toggleWidget);
        this.elements.bubble.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleWidget();
            }
        });
        
        // Close button events
        this.elements.closeButton.addEventListener('click', this.closeWidget);
        this.elements.closeButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.closeWidget();
            }
        });
        
        // Send button events
        this.elements.sendButton.addEventListener('click', this.sendMessage);
        
        // Input events
        this.elements.input.addEventListener('keydown', this.handleKeyPress);
        this.elements.input.addEventListener('input', this.autoResize.bind(this));
        
        // Global escape key listener
        document.addEventListener('keydown', this.handleEscapeKey);
        
        // Focus management
        this.elements.widget.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }
    
    /**
     * Toggle chat widget open/closed
     */
    toggleWidget() {
        if (this.isWidgetOpen) {
            this.closeWidget();
        } else {
            this.openWidget();
        }
    }
    
    /**
     * Open chat widget
     */
    openWidget() {
        this.isWidgetOpen = true;
        
        // Update classes and attributes
        this.elements.widget.classList.add('active');
        this.elements.bubble.setAttribute('aria-expanded', 'true');
        this.elements.widget.setAttribute('aria-hidden', 'false');
        this.elements.widget.setAttribute('aria-modal', 'true');
        
        // Focus management
        setTimeout(() => {
            this.elements.input.focus();
        }, 300); // Wait for animation
        
        // Analytics event
        this.fireAnalyticsEvent('chat_opened');
        
        console.log('Chat widget opened');
    }
    
    /**
     * Close chat widget
     */
    closeWidget() {
        this.isWidgetOpen = false;
        
        // Update classes and attributes
        this.elements.widget.classList.remove('active');
        this.elements.bubble.setAttribute('aria-expanded', 'false');
        this.elements.widget.setAttribute('aria-hidden', 'true');
        this.elements.widget.setAttribute('aria-modal', 'false');
        
        // Return focus to bubble
        this.elements.bubble.focus();
        
        // Analytics event
        this.fireAnalyticsEvent('chat_closed');
        
        console.log('Chat widget closed');
    }
    
    /**
     * Handle keyboard input in chat
     */
    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    /**
     * Handle escape key to close chat
     */
    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.isWidgetOpen) {
            this.closeWidget();
        }
    }
    
    /**
     * Handle tab navigation within chat widget
     */
    handleTabNavigation(e) {
        const focusableElements = this.elements.widget.querySelectorAll(
            'button, input, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * Send a message
     */
    sendMessage() {
        const message = this.elements.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.elements.input.value = '';
        this.autoResize();
        
        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const responses = [
                "Thanks for your message! To get an accurate quote, please call us at 562-228-9429.",
                "We offer various detailing packages starting at $70. Would you like to book an appointment?",
                "Our team serves all of Los Angeles and Orange County. When would you like us to come detail your vehicle?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.addMessage(randomResponse, 'assistant');
        }, 1000);
        
        // Analytics event
        this.fireAnalyticsEvent('message_sent', { messageLength: message.length });
    }
    
    /**
     * Add a message to the chat
     */
    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.setAttribute('role', 'log');
        messageDiv.setAttribute('aria-live', 'polite');
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = type === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-user-tie"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Announce new message to screen readers
        if (type === 'assistant') {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'assertive');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Assistant message: ${text}`;
            announcement.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;';
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }
    }
    
    /**
     * Auto-resize textarea
     */
    autoResize() {
        this.elements.input.style.height = 'auto';
        this.elements.input.style.height = Math.min(this.elements.input.scrollHeight, 80) + 'px';
    }
    
    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
    
    /**
     * Fire analytics events
     */
    fireAnalyticsEvent(eventName, eventData = {}) {
        try {
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    event_category: 'chat',
                    event_label: eventName,
                    ...eventData
                });
            }
            
            // Custom event for tracking
            window.dispatchEvent(new CustomEvent('chatbot-event', {
                detail: { eventName, eventData, timestamp: Date.now() }
            }));
            
        } catch (error) {
            console.warn('Failed to send analytics event:', error);
        }
    }
    
    /**
     * Public method to check if chatbot is ready
     */
    isReady() {
        return this.isInitialized;
    }
    
    /**
     * Public method to programmatically open chat
     */
    open() {
        if (this.isInitialized && !this.isWidgetOpen) {
            this.openWidget();
        }
    }
    
    /**
     * Public method to programmatically close chat
     */
    close() {
        if (this.isInitialized && this.isWidgetOpen) {
            this.closeWidget();
        }
    }
}

// Initialize chatbot handler
let chatbotHandler;

// Multiple initialization strategies for different environments
function initializeChatbot() {
    if (!chatbotHandler) {
        chatbotHandler = new ChatbotHandler();
        
        // Make available globally for testing and debugging
        window.chatbotHandler = chatbotHandler;
    }
}

// Initialize immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
}

// Re-initialize on SPA navigation
window.addEventListener('popstate', () => {
    setTimeout(initializeChatbot, 100);
});

// History API override for SPA navigation detection
if (typeof history !== 'undefined' && history.pushState) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(initializeChatbot, 100);
    };
    
    history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(initializeChatbot, 100);
    };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChatbotHandler, initializeChatbot };
}