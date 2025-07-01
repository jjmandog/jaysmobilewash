/**
 * Jay's Mobile Wash Chat Widget - Production Module
 * 
 * Modular, production-ready chat widget with multi-backend AI support
 * Implements adapter pattern for extensible API integrations
 * 
 * @version 1.0.0
 * @author Jay's Mobile Wash Team
 */

class ChatWidget {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            containerId: options.containerId || 'chat-widget',
            bubbleId: options.bubbleId || 'chat-bubble',
            adapters: options.adapters || [],
            strategy: options.strategy || 'failover', // 'failover' or 'parallel'
            maxRetries: options.maxRetries || 2,
            timeout: options.timeout || 30000,
            debug: options.debug || false,
            enableTrainableTemplate: options.enableTrainableTemplate !== false, // Default enabled
            trainableTemplateOptions: options.trainableTemplateOptions || {},
            ...options
        };

        // State management
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.currentAdapter = 0;

        // Initialize Trainable Base Template
        if (this.config.enableTrainableTemplate && typeof TrainableBaseTemplate !== 'undefined') {
            this.baseTemplate = new TrainableBaseTemplate({
                debug: this.config.debug,
                ...this.config.trainableTemplateOptions
            });
        } else {
            this.baseTemplate = null;
            if (this.config.enableTrainableTemplate) {
                this.log('TrainableBaseTemplate not available - falling back to external APIs only');
            }
        }

        // Business knowledge system prompt
        this.systemPrompt = {
            role: 'system',
            content: `You are a helpful assistant for Jay's Mobile Wash, a premium mobile car detailing service in Los Angeles and Orange County.

Key business information:
- Mobile detailing services that come directly to the customer
- Service areas: Los Angeles County and Orange County
- Core services: Exterior detailing, interior detailing, ceramic coating, paint correction
- Premium packages: "Jay's Max Detail" and specialty treatments
- Professional products: Koch Chemie, BioBomb odor elimination, ceramic coatings
- Specializes in luxury and exotic vehicles
- Fully licensed and insured
- Phone: 562-228-9429
- Pricing starts around $70 for basic packages
- Expert paint correction and ceramic coating services
- Same-day and next-day availability in most areas

Service specialties:
- Paint correction and swirl removal
- Ceramic coating applications
- Interior deep cleaning and protection
- Odor elimination (pets, smoke, etc.)
- Luxury vehicle care
- Fleet vehicle maintenance

Always be helpful, professional, and knowledgeable about mobile detailing. Encourage customers to call 562-228-9429 for detailed quotes and scheduling. Emphasize the convenience of mobile service, quality of work, and expertise with luxury vehicles. Keep responses concise and focused on car detailing services.`
        };

        // Initialize with system prompt
        this.messages = [this.systemPrompt];

        // Initialize the widget
        this.init();
    }

    /**
     * Initialize the chat widget
     */
    init() {
        this.log('Initializing chat widget...');
        
        // Find DOM elements
        this.chatBubble = this.config.bubbleId ? document.getElementById(this.config.bubbleId) : null;
        this.chatWidget = document.getElementById(this.config.containerId);
        
        if (!this.chatWidget) {
            this.error('Required DOM element chat-widget not found.');
            return;
        }

        this.chatMessages = this.chatWidget.querySelector('#chatMessages') || 
                           this.chatWidget.querySelector('.chat-messages');
        this.chatInput = this.chatWidget.querySelector('#chatInput') || 
                        this.chatWidget.querySelector('.chat-input');
        this.sendButton = this.chatWidget.querySelector('#sendButton') || 
                         this.chatWidget.querySelector('.send-button');
        this.closeButton = this.chatWidget.querySelector('#chat-close') || 
                          this.chatWidget.querySelector('.chat-close-btn');

        if (!this.chatMessages || !this.chatInput || !this.sendButton) {
            this.error('Required chat elements not found in widget.');
            return;
        }

        this.setupEventListeners();
        this.validateAdapters();
        
        this.log('Chat widget initialized successfully');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Chat bubble click (only if bubble exists)
        if (this.chatBubble) {
            this.chatBubble.addEventListener('click', () => this.openChat());
        }
        
        // Close button
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.closeChat());
        }
        
        // Send button
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key handling
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 80) + 'px';
        });

        // Escape key to close (only if bubble exists for toggle functionality)
        if (this.chatBubble) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeChat();
                }
            });
        }
    }

    /**
     * Validate configured adapters
     */
    validateAdapters() {
        if (!this.config.adapters || this.config.adapters.length === 0) {
            this.error('No adapters configured. Widget will not be able to send messages.');
            return;
        }

        this.config.adapters.forEach((adapter, index) => {
            if (!adapter.name || typeof adapter.sendMessage !== 'function') {
                this.error(`Adapter ${index} is invalid. Must have 'name' and 'sendMessage' function.`);
            }
        });
    }

    /**
     * Open chat widget
     */
    openChat() {
        this.isOpen = true;
        if (this.chatBubble) {
            this.chatBubble.style.display = 'none';
        }
        this.chatWidget.classList.add('active');
        this.chatInput.focus();
        this.log('Chat opened');
    }

    /**
     * Close chat widget
     */
    closeChat() {
        this.isOpen = false;
        this.chatWidget.classList.remove('active');
        if (this.chatBubble) {
            setTimeout(() => {
                this.chatBubble.style.display = 'flex';
            }, 300);
        }
        this.log('Chat closed');
    }

    /**
     * Send user message
     */
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;

        // Add user message to UI and history
        this.addMessage(message, 'user');
        this.messages.push({
            role: 'user',
            content: message
        });

        // Clear input
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';

        // Check for booking requests
        if (this.isBookingRequest(message)) {
            this.showBookingPrompt();
            return;
        }

        // Send to AI
        await this.processAIResponse();
    }

    /**
     * Process AI response using trainable base template first, then external APIs
     */
    async processAIResponse() {
        this.showTyping();

        try {
            let response = null;
            let responseSource = 'unknown';

            // First, try the trainable base template
            if (this.baseTemplate) {
                const baseResult = await this.baseTemplate.generateResponse(
                    this.messages[this.messages.length - 1].content,
                    this.messages
                );

                if (baseResult && !baseResult.shouldUseExternalAPI) {
                    // Base template provided a confident response
                    response = baseResult.response;
                    responseSource = 'base_template';
                    
                    this.log(`Base template responded with confidence: ${baseResult.confidence}`);
                } else {
                    // Base template confidence too low, use external APIs
                    this.log(`Base template confidence too low (${baseResult?.confidence || 0}), using external APIs`);
                    
                    const externalResponse = await this.tryExternalAPIs();
                    if (externalResponse) {
                        response = externalResponse;
                        responseSource = 'external_api';
                        
                        // Let base template learn from external response
                        if (this.baseTemplate) {
                            await this.baseTemplate.learnFromExternalResponse(
                                this.messages[this.messages.length - 1].content,
                                externalResponse,
                                'external_adapter'
                            );
                        }
                    }
                }
            } else {
                // No base template, use external APIs directly
                response = await this.tryExternalAPIs();
                responseSource = 'external_api';
            }

            if (response) {
                this.messages.push({
                    role: 'assistant',
                    content: response,
                    source: responseSource
                });
                this.addMessage(response, 'assistant');
            } else {
                throw new Error('All response methods failed');
            }

        } catch (error) {
            this.error('AI processing failed:', error);
            this.addMessage(
                "I'm having trouble connecting right now. Please call us directly at 562-228-9429 for immediate assistance with your mobile detailing needs!",
                'error'
            );
        } finally {
            this.hideTyping();
        }
    }

    /**
     * Try external APIs using configured strategy
     */
    async tryExternalAPIs() {
        if (this.config.adapters.length === 0) {
            return null;
        }

        let response;
        
        if (this.config.strategy === 'parallel') {
            response = await this.tryParallelAdapters();
        } else {
            response = await this.tryFailoverAdapters();
        }

        return response;
    }

    /**
     * Try adapters in parallel, return first successful response
     */
    async tryParallelAdapters() {
        const promises = this.config.adapters.map(adapter => 
            this.callAdapter(adapter).catch(err => {
                this.log(`Parallel adapter ${adapter.name} failed:`, err.message);
                return null;
            })
        );

        const results = await Promise.allSettled(promises);
        
        // Return first successful result
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                return result.value;
            }
        }
        
        return null;
    }

    /**
     * Try adapters in sequence (failover)
     */
    async tryFailoverAdapters() {
        for (let i = 0; i < this.config.adapters.length; i++) {
            const adapter = this.config.adapters[i];
            
            try {
                const response = await this.callAdapter(adapter);
                if (response) {
                    this.log(`Failover success with adapter: ${adapter.name}`);
                    return response;
                }
            } catch (error) {
                this.log(`Failover adapter ${adapter.name} failed:`, error.message);
                
                // If this is the last adapter, let the error bubble up
                if (i === this.config.adapters.length - 1) {
                    throw error;
                }
            }
        }
        
        return null;
    }

    /**
     * Call a specific adapter with retry logic
     */
    async callAdapter(adapter) {
        let lastError;
        
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                this.log(`Calling adapter ${adapter.name}, attempt ${attempt + 1}`);
                
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), this.config.timeout);
                });
                
                const responsePromise = adapter.sendMessage(this.messages, {
                    maxTokens: 500,
                    temperature: 0.7
                });
                
                const response = await Promise.race([responsePromise, timeoutPromise]);
                
                if (response && typeof response === 'string') {
                    return response;
                }
                
                throw new Error('Invalid response format');
                
            } catch (error) {
                lastError = error;
                this.log(`Adapter ${adapter.name} attempt ${attempt + 1} failed:`, error.message);
                
                // Wait before retry (exponential backoff)
                if (attempt < this.config.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Check if message is a booking request
     */
    isBookingRequest(message) {
        const bookingKeywords = [
            'book', 'schedule', 'appointment', 'reserve', 'availability',
            'when can', 'what time', 'tomorrow', 'today', 'next week',
            'available', 'free time', 'come out', 'visit'
        ];
        
        const lowerMessage = message.toLowerCase();
        return bookingKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    /**
     * Show booking prompt
     */
    showBookingPrompt() {
        const bookingHtml = `
            <div class="booking-prompt">
                <h4>🚗 Ready to Schedule Your Detail?</h4>
                <p>Great! I'd love to help you schedule your mobile detailing service.</p>
                <p><strong>For fastest booking, please call us at 562-228-9429</strong></p>
                <p>Our team can check availability, provide exact pricing based on your vehicle and location, and schedule your appointment right away!</p>
                <div class="booking-benefits">
                    <p>✨ <strong>Why call?</strong></p>
                    <ul>
                        <li>Real-time availability</li>
                        <li>Instant quotes based on your specific needs</li>
                        <li>Same-day/next-day scheduling often available</li>
                        <li>Direct answers to any questions</li>
                    </ul>
                </div>
            </div>
        `;

        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'message assistant';
        bookingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user-tie"></i>
            </div>
            <div class="message-content">
                ${bookingHtml}
            </div>
        `;
        
        this.chatMessages.appendChild(bookingDiv);
        this.scrollToBottom();
    }

    /**
     * Add message to chat UI
     */
    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Create avatar if using structured message format
        if (this.chatMessages.querySelector('.message-avatar')) {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar';
            
            if (type === 'assistant') {
                avatarDiv.innerHTML = '<i class="fas fa-user-tie"></i>';
            } else if (type === 'user') {
                avatarDiv.innerHTML = '<i class="fas fa-user"></i>';
            } else if (type === 'error') {
                avatarDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            }

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = text;

            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);
        } else {
            // Simple message format
            messageDiv.textContent = text;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Show typing indicator
     */
    showTyping() {
        this.isTyping = true;
        this.sendButton.disabled = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        // Check if we have avatars
        if (this.chatMessages.querySelector('.message-avatar')) {
            typingDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="message-content">
                    Jay is typing<span class="typing-dots"></span>
                </div>
            `;
        } else {
            typingDiv.innerHTML = 'Jay is typing<span class="typing-dots"></span>';
        }
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTyping() {
        this.isTyping = false;
        this.sendButton.disabled = false;
        
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    /**
     * Log message (if debug enabled)
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[ChatWidget]', ...args);
        }
    }

    /**
     * Log error
     */
    error(...args) {
        console.error('[ChatWidget Error]', ...args);
    }

    /**
     * Add a new adapter at runtime
     */
    addAdapter(adapter) {
        if (!adapter.name || typeof adapter.sendMessage !== 'function') {
            this.error('Invalid adapter. Must have name and sendMessage function.');
            return;
        }
        
        this.config.adapters.push(adapter);
        this.log(`Added adapter: ${adapter.name}`);
    }

    /**
     * Remove adapter by name
     */
    removeAdapter(name) {
        const index = this.config.adapters.findIndex(adapter => adapter.name === name);
        if (index > -1) {
            this.config.adapters.splice(index, 1);
            this.log(`Removed adapter: ${name}`);
        }
    }

    /**
     * Get current adapter status
     */
    getAdapterStatus() {
        const adapterStatus = this.config.adapters.map(adapter => ({
            name: adapter.name,
            configured: typeof adapter.sendMessage === 'function'
        }));

        // Add base template status
        const baseTemplateStatus = {
            enabled: !!this.baseTemplate,
            metrics: this.baseTemplate ? this.baseTemplate.getMetrics() : null
        };

        return {
            adapters: adapterStatus,
            baseTemplate: baseTemplateStatus
        };
    }

    /**
     * Submit training content to the base template
     */
    async submitTrainingContent(content, type, metadata = {}) {
        if (!this.baseTemplate) {
            throw new Error('Trainable base template not enabled');
        }

        return await this.baseTemplate.submitTrainingContent(content, type, metadata);
    }

    /**
     * Get learning metrics from base template
     */
    getLearningMetrics() {
        if (!this.baseTemplate) {
            return { error: 'Trainable base template not enabled' };
        }

        return this.baseTemplate.getMetrics();
    }

    /**
     * Export knowledge base for backup
     */
    exportKnowledgeBase() {
        if (!this.baseTemplate) {
            throw new Error('Trainable base template not enabled');
        }

        return this.baseTemplate.exportKnowledgeBase();
    }

    /**
     * Import knowledge base from backup
     */
    async importKnowledgeBase(data) {
        if (!this.baseTemplate) {
            throw new Error('Trainable base template not enabled');
        }

        return await this.baseTemplate.importKnowledgeBase(data);
    }

    /**
     * Clear knowledge base (for testing/reset)
     */
    clearKnowledgeBase() {
        if (!this.baseTemplate) {
            throw new Error('Trainable base template not enabled');
        }

        this.baseTemplate.clearKnowledgeBase();
    }

    /**
     * Get detailed system status including learning capabilities
     */
    getSystemStatus() {
        const status = {
            chatWidget: {
                isOpen: this.isOpen,
                messagesCount: this.messages.length,
                adaptersConfigured: this.config.adapters.length
            },
            baseTemplate: null
        };

        if (this.baseTemplate) {
            status.baseTemplate = {
                enabled: true,
                metrics: this.baseTemplate.getMetrics(),
                knowledgeEntries: this.baseTemplate.knowledgeBase.size,
                conversationMemory: this.baseTemplate.conversationMemory.length
            };
        } else {
            status.baseTemplate = { enabled: false };
        }

        return status;
    }
}

/**
 * AI API Adapters
 * 
 * Each adapter must implement:
 * - name: string identifier
 * - sendMessage(messages, options): Promise<string>
 */

/**
 * Hugging Face API Adapter
 */
class HuggingFaceAdapter {
    constructor(options = {}) {
        this.name = 'HuggingFace';
        this.endpoint = options.endpoint || '/api/ai';
        this.model = options.model || 'gpt2';
    }

    async sendMessage(messages, options = {}) {
        // Convert messages to prompt format for HuggingFace
        const prompt = this.messagesToPrompt(messages);
        
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: options.maxTokens || 500,
                temperature: options.temperature || 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HuggingFace API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle HuggingFace response format
        if (Array.isArray(data) && data[0] && data[0].generated_text) {
            return data[0].generated_text.replace(prompt, '').trim();
        }
        
        throw new Error('Invalid HuggingFace response format');
    }

    messagesToPrompt(messages) {
        // Convert OpenAI-style messages to a single prompt
        let prompt = '';
        
        for (const message of messages) {
            if (message.role === 'system') {
                prompt += `System: ${message.content}\n\n`;
            } else if (message.role === 'user') {
                prompt += `Customer: ${message.content}\n`;
            } else if (message.role === 'assistant') {
                prompt += `Assistant: ${message.content}\n`;
            }
        }
        
        prompt += 'Assistant:';
        return prompt;
    }
}

/**
 * Netlify Functions Adapter
 */
class NetlifyAdapter {
    constructor(options = {}) {
        this.name = 'Netlify';
        this.endpoint = options.endpoint || '/netlify/functions/ai';
    }

    async sendMessage(messages, options = {}) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages,
                max_tokens: options.maxTokens || 500,
                temperature: options.temperature || 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Netlify API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle different possible response formats
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else if (data.result && Array.isArray(data.result) && data.result[0]) {
            return data.result[0].generated_text || data.result[0].content;
        } else if (typeof data === 'string') {
            return data;
        }
        
        throw new Error('Invalid Netlify response format');
    }
}

/**
 * DeepSeek API Adapter
 */
class DeepSeekAdapter {
    constructor(options = {}) {
        this.name = 'DeepSeek';
        this.apiKey = options.apiKey;
        this.baseURL = options.baseURL || 'https://api.deepseek.com/v1';
        this.model = options.model || 'deepseek-chat';
    }

    async sendMessage(messages, options = {}) {
        if (!this.apiKey) {
            throw new Error('DeepSeek API key not configured');
        }

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                max_tokens: options.maxTokens || 500,
                temperature: options.temperature || 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }
        
        throw new Error('Invalid DeepSeek response format');
    }
}

/**
 * Generic OpenAI-Compatible Adapter
 */
class OpenAICompatibleAdapter {
    constructor(options = {}) {
        this.name = options.name || 'OpenAI-Compatible';
        this.apiKey = options.apiKey;
        this.baseURL = options.baseURL;
        this.model = options.model || 'gpt-3.5-turbo';
    }

    async sendMessage(messages, options = {}) {
        if (!this.apiKey || !this.baseURL) {
            throw new Error(`${this.name} API key or base URL not configured`);
        }

        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                max_tokens: options.maxTokens || 500,
                temperature: options.temperature || 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`${this.name} API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }
        
        throw new Error(`Invalid ${this.name} response format`);
    }
}

// Export classes and create global instances for easy usage
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        ChatWidget,
        HuggingFaceAdapter,
        NetlifyAdapter,
        DeepSeekAdapter,
        OpenAICompatibleAdapter
    };
} else {
    // Browser environment
    window.ChatWidget = ChatWidget;
    window.ChatAdapters = {
        HuggingFaceAdapter,
        NetlifyAdapter,
        DeepSeekAdapter,
        OpenAICompatibleAdapter
    };
}