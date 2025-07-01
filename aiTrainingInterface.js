/**
 * Jay's Mobile Wash - AI Training Interface
 * 
 * Web-based interface for training the Trainable Base Template system
 * Supports multiple content types: text, video transcripts, websites, conversations
 * 
 * @version 1.0.0
 * @author Jay's Mobile Wash Team
 */

class AITrainingInterface {
    constructor(chatWidget, options = {}) {
        this.chatWidget = chatWidget;
        this.config = {
            containerId: options.containerId || 'ai-training-interface',
            debug: options.debug || false,
            ...options
        };

        this.isVisible = false;
        this.currentUpload = null;
        
        this.init();
    }

    /**
     * Initialize the training interface
     */
    init() {
        this.log('Initializing AI Training Interface...');
        
        // Create the interface if it doesn't exist
        this.createInterface();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.log('AI Training Interface initialized');
    }

    /**
     * Create the training interface HTML
     */
    createInterface() {
        let container = document.getElementById(this.config.containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = this.config.containerId;
            document.body.appendChild(container);
        }

        container.innerHTML = `
            <div class="ai-training-overlay" id="aiTrainingOverlay">
                <div class="ai-training-modal">
                    <div class="ai-training-header">
                        <h2>🧠 AI Training Center</h2>
                        <button class="ai-training-close" id="aiTrainingClose">&times;</button>
                    </div>
                    
                    <div class="ai-training-content">
                        <div class="ai-training-tabs">
                            <button class="ai-training-tab active" data-tab="text">📝 Text Content</button>
                            <button class="ai-training-tab" data-tab="video">🎥 Video/Audio</button>
                            <button class="ai-training-tab" data-tab="website">🌐 Website</button>
                            <button class="ai-training-tab" data-tab="conversation">💬 Conversation</button>
                            <button class="ai-training-tab" data-tab="metrics">📊 Metrics</button>
                        </div>

                        <div class="ai-training-tab-content">
                            <!-- Text Content Tab -->
                            <div class="ai-training-panel active" id="textPanel">
                                <h3>Submit Text Content for Training</h3>
                                <div class="ai-training-form">
                                    <div class="ai-training-field">
                                        <label for="textContent">Text Content:</label>
                                        <textarea id="textContent" placeholder="Paste your text content here..." rows="10"></textarea>
                                    </div>
                                    <div class="ai-training-field">
                                        <label for="textSource">Source (optional):</label>
                                        <input type="text" id="textSource" placeholder="e.g., customer_feedback, FAQ, manual">
                                    </div>
                                    <div class="ai-training-field">
                                        <label for="textCategory">Category:</label>
                                        <select id="textCategory">
                                            <option value="general">General</option>
                                            <option value="services">Services</option>
                                            <option value="pricing">Pricing</option>
                                            <option value="booking">Booking</option>
                                            <option value="business_info">Business Info</option>
                                            <option value="technical">Technical</option>
                                        </select>
                                    </div>
                                    <button class="ai-training-submit" id="submitText">Submit Text Content</button>
                                </div>
                            </div>

                            <!-- Video/Audio Tab -->
                            <div class="ai-training-panel" id="videoPanel">
                                <h3>Submit Video/Audio Content</h3>
                                <div class="ai-training-form">
                                    <div class="ai-training-field">
                                        <label for="videoTranscript">Video Transcript:</label>
                                        <textarea id="videoTranscript" placeholder="Paste the video transcript here..." rows="10"></textarea>
                                    </div>
                                    <div class="ai-training-field">
                                        <label for="videoTitle">Video Title (optional):</label>
                                        <input type="text" id="videoTitle" placeholder="e.g., Service Demo Video">
                                    </div>
                                    <div class="ai-training-field">
                                        <label for="videoSource">Source:</label>
                                        <select id="videoSource">
                                            <option value="training_video">Training Video</option>
                                            <option value="customer_testimonial">Customer Testimonial</option>
                                            <option value="service_demo">Service Demo</option>
                                            <option value="educational">Educational Content</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <button class="ai-training-submit" id="submitVideo">Submit Video Content</button>
                                </div>
                            </div>

                            <!-- Website Tab -->
                            <div class="ai-training-panel" id="websitePanel">
                                <h3>Submit Website Content</h3>
                                <div class="ai-training-form">
                                    <div class="ai-training-field">
                                        <label for="websiteUrl">Website URL:</label>
                                        <input type="url" id="websiteUrl" placeholder="https://example.com">
                                    </div>
                                    <div class="ai-training-field">
                                        <label for="websiteContent">Website Content:</label>
                                        <textarea id="websiteContent" placeholder="Paste website content here..." rows="8"></textarea>
                                        <small>Paste the relevant text content from the website</small>
                                    </div>
                                    <div class="ai-training-field">
                                        <label for="websiteType">Content Type:</label>
                                        <select id="websiteType">
                                            <option value="competitor_analysis">Competitor Analysis</option>
                                            <option value="industry_info">Industry Information</option>
                                            <option value="best_practices">Best Practices</option>
                                            <option value="product_info">Product Information</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <button class="ai-training-submit" id="submitWebsite">Submit Website Content</button>
                                </div>
                            </div>

                            <!-- Conversation Tab -->
                            <div class="ai-training-panel" id="conversationPanel">
                                <h3>Submit Conversation Examples</h3>
                                <div class="ai-training-form">
                                    <div class="ai-training-field">
                                        <label for="conversationData">Conversation JSON:</label>
                                        <textarea id="conversationData" placeholder='[{"role": "user", "content": "Question?"}, {"role": "assistant", "content": "Answer"}]' rows="10"></textarea>
                                        <small>Format as JSON array with role and content fields</small>
                                    </div>
                                    <div class="ai-training-field">
                                        <label for="conversationSource">Source:</label>
                                        <select id="conversationSource">
                                            <option value="customer_chat">Customer Chat</option>
                                            <option value="phone_call">Phone Call Transcript</option>
                                            <option value="email_exchange">Email Exchange</option>
                                            <option value="training_example">Training Example</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <button class="ai-training-submit" id="submitConversation">Submit Conversation</button>
                                </div>
                            </div>

                            <!-- Metrics Tab -->
                            <div class="ai-training-panel" id="metricsPanel">
                                <h3>AI Learning Metrics</h3>
                                <div class="ai-training-metrics" id="metricsContent">
                                    <div class="metrics-loading">Loading metrics...</div>
                                </div>
                                <div class="ai-training-actions">
                                    <button class="ai-training-button" id="refreshMetrics">🔄 Refresh Metrics</button>
                                    <button class="ai-training-button" id="exportKnowledge">📤 Export Knowledge</button>
                                    <button class="ai-training-button danger" id="clearKnowledge">🗑️ Clear Knowledge</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="ai-training-status" id="trainingStatus">
                        Ready to train AI system
                    </div>
                </div>
            </div>
        `;

        // Add CSS styles
        this.addStyles();
    }

    /**
     * Add CSS styles for the training interface
     */
    addStyles() {
        if (document.getElementById('ai-training-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-training-styles';
        styles.textContent = `
            .ai-training-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: none;
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }

            .ai-training-overlay.active {
                display: flex;
            }

            .ai-training-modal {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .ai-training-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ai-training-header h2 {
                margin: 0;
                font-size: 1.5em;
            }

            .ai-training-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.3s;
            }

            .ai-training-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .ai-training-content {
                padding: 0;
            }

            .ai-training-tabs {
                display: flex;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
            }

            .ai-training-tab {
                flex: 1;
                padding: 15px 10px;
                border: none;
                background: none;
                cursor: pointer;
                transition: background 0.3s;
                font-size: 14px;
            }

            .ai-training-tab:hover {
                background: #e9ecef;
            }

            .ai-training-tab.active {
                background: #667eea;
                color: white;
            }

            .ai-training-tab-content {
                position: relative;
            }

            .ai-training-panel {
                display: none;
                padding: 20px;
                min-height: 400px;
            }

            .ai-training-panel.active {
                display: block;
            }

            .ai-training-panel h3 {
                margin-top: 0;
                color: #333;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }

            .ai-training-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .ai-training-field {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .ai-training-field label {
                font-weight: bold;
                color: #555;
            }

            .ai-training-field input,
            .ai-training-field textarea,
            .ai-training-field select {
                padding: 10px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                font-family: inherit;
                transition: border-color 0.3s;
            }

            .ai-training-field input:focus,
            .ai-training-field textarea:focus,
            .ai-training-field select:focus {
                outline: none;
                border-color: #667eea;
            }

            .ai-training-field small {
                color: #6c757d;
                font-size: 12px;
            }

            .ai-training-submit,
            .ai-training-button {
                padding: 12px 24px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background 0.3s;
                margin-top: 10px;
            }

            .ai-training-submit:hover,
            .ai-training-button:hover {
                background: #5a6fd8;
            }

            .ai-training-button.danger {
                background: #dc3545;
            }

            .ai-training-button.danger:hover {
                background: #c82333;
            }

            .ai-training-status {
                background: #f8f9fa;
                padding: 15px 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }

            .ai-training-status.success {
                background: #d4edda;
                color: #155724;
                border-color: #c3e6cb;
            }

            .ai-training-status.error {
                background: #f8d7da;
                color: #721c24;
                border-color: #f1b0b7;
            }

            .ai-training-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }

            .metric-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }

            .metric-card h4 {
                margin: 0 0 5px 0;
                color: #333;
                font-size: 14px;
            }

            .metric-card .value {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
            }

            .metric-card .description {
                font-size: 12px;
                color: #6c757d;
                margin-top: 5px;
            }

            .ai-training-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .metrics-loading {
                text-align: center;
                padding: 40px;
                color: #6c757d;
            }

            @media (max-width: 600px) {
                .ai-training-modal {
                    width: 95%;
                    max-height: 95vh;
                }

                .ai-training-tabs {
                    flex-wrap: wrap;
                }

                .ai-training-tab {
                    font-size: 12px;
                    padding: 10px 5px;
                }

                .ai-training-actions {
                    justify-content: center;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        document.getElementById('aiTrainingClose').addEventListener('click', () => {
            this.hide();
        });

        // Tab switching
        document.querySelectorAll('.ai-training-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        document.getElementById('submitText').addEventListener('click', () => {
            this.submitTextContent();
        });

        document.getElementById('submitVideo').addEventListener('click', () => {
            this.submitVideoContent();
        });

        document.getElementById('submitWebsite').addEventListener('click', () => {
            this.submitWebsiteContent();
        });

        document.getElementById('submitConversation').addEventListener('click', () => {
            this.submitConversationContent();
        });

        // Metrics actions
        document.getElementById('refreshMetrics').addEventListener('click', () => {
            this.refreshMetrics();
        });

        document.getElementById('exportKnowledge').addEventListener('click', () => {
            this.exportKnowledge();
        });

        document.getElementById('clearKnowledge').addEventListener('click', () => {
            this.clearKnowledge();
        });

        // Close on overlay click
        document.getElementById('aiTrainingOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'aiTrainingOverlay') {
                this.hide();
            }
        });
    }

    /**
     * Show the training interface
     */
    show() {
        this.isVisible = true;
        document.getElementById('aiTrainingOverlay').classList.add('active');
        
        // Load metrics if on metrics tab
        if (document.querySelector('.ai-training-tab.active').dataset.tab === 'metrics') {
            this.refreshMetrics();
        }
    }

    /**
     * Hide the training interface
     */
    hide() {
        this.isVisible = false;
        document.getElementById('aiTrainingOverlay').classList.remove('active');
    }

    /**
     * Switch tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.ai-training-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.ai-training-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}Panel`).classList.add('active');

        // Load metrics if switching to metrics tab
        if (tabName === 'metrics') {
            this.refreshMetrics();
        }
    }

    /**
     * Submit text content for training
     */
    async submitTextContent() {
        const content = document.getElementById('textContent').value.trim();
        const source = document.getElementById('textSource').value.trim();
        const category = document.getElementById('textCategory').value;

        if (!content) {
            this.showStatus('Please enter text content', 'error');
            return;
        }

        try {
            this.showStatus('Processing text content...', 'processing');

            const result = await this.chatWidget.submitTrainingContent(content, 'text', {
                source: source || 'manual_training',
                category: category,
                submittedBy: 'training_interface'
            });

            if (result.success) {
                this.showStatus(`Successfully added ${result.entriesAdded} knowledge entries!`, 'success');
                
                // Clear form
                document.getElementById('textContent').value = '';
                document.getElementById('textSource').value = '';
                document.getElementById('textCategory').value = 'general';
            } else {
                this.showStatus(result.message || 'Failed to process content', 'error');
            }

        } catch (error) {
            this.error('Text content submission failed:', error);
            this.showStatus('Error processing content: ' + error.message, 'error');
        }
    }

    /**
     * Submit video content for training
     */
    async submitVideoContent() {
        const transcript = document.getElementById('videoTranscript').value.trim();
        const title = document.getElementById('videoTitle').value.trim();
        const source = document.getElementById('videoSource').value;

        if (!transcript) {
            this.showStatus('Please enter video transcript', 'error');
            return;
        }

        try {
            this.showStatus('Processing video content...', 'processing');

            const result = await this.chatWidget.submitTrainingContent(transcript, 'video', {
                title: title,
                source: source,
                submittedBy: 'training_interface'
            });

            if (result.success) {
                this.showStatus(`Successfully processed video content! Added ${result.entriesAdded} knowledge entries.`, 'success');
                
                // Clear form
                document.getElementById('videoTranscript').value = '';
                document.getElementById('videoTitle').value = '';
                document.getElementById('videoSource').value = 'training_video';
            } else {
                this.showStatus(result.message || 'Failed to process video content', 'error');
            }

        } catch (error) {
            this.error('Video content submission failed:', error);
            this.showStatus('Error processing video content: ' + error.message, 'error');
        }
    }

    /**
     * Submit website content for training
     */
    async submitWebsiteContent() {
        const url = document.getElementById('websiteUrl').value.trim();
        const content = document.getElementById('websiteContent').value.trim();
        const type = document.getElementById('websiteType').value;

        if (!content) {
            this.showStatus('Please enter website content', 'error');
            return;
        }

        try {
            this.showStatus('Processing website content...', 'processing');

            const result = await this.chatWidget.submitTrainingContent(
                { content: content, url: url }, 
                'website', 
                {
                    url: url,
                    type: type,
                    submittedBy: 'training_interface'
                }
            );

            if (result.success) {
                this.showStatus(`Successfully processed website content! Added ${result.entriesAdded} knowledge entries.`, 'success');
                
                // Clear form
                document.getElementById('websiteUrl').value = '';
                document.getElementById('websiteContent').value = '';
                document.getElementById('websiteType').value = 'competitor_analysis';
            } else {
                this.showStatus(result.message || 'Failed to process website content', 'error');
            }

        } catch (error) {
            this.error('Website content submission failed:', error);
            this.showStatus('Error processing website content: ' + error.message, 'error');
        }
    }

    /**
     * Submit conversation for training
     */
    async submitConversationContent() {
        const conversationData = document.getElementById('conversationData').value.trim();
        const source = document.getElementById('conversationSource').value;

        if (!conversationData) {
            this.showStatus('Please enter conversation data', 'error');
            return;
        }

        try {
            // Parse JSON
            const conversation = JSON.parse(conversationData);
            
            if (!Array.isArray(conversation)) {
                throw new Error('Conversation must be an array');
            }

            this.showStatus('Processing conversation...', 'processing');

            const result = await this.chatWidget.submitTrainingContent(conversation, 'conversation', {
                source: source,
                submittedBy: 'training_interface'
            });

            if (result.success) {
                this.showStatus(`Successfully processed conversation! Added ${result.entriesAdded} knowledge entries.`, 'success');
                
                // Clear form
                document.getElementById('conversationData').value = '';
                document.getElementById('conversationSource').value = 'customer_chat';
            } else {
                this.showStatus(result.message || 'Failed to process conversation', 'error');
            }

        } catch (error) {
            this.error('Conversation submission failed:', error);
            this.showStatus('Error processing conversation: ' + error.message, 'error');
        }
    }

    /**
     * Refresh metrics display
     */
    async refreshMetrics() {
        const metricsContainer = document.getElementById('metricsContent');
        metricsContainer.innerHTML = '<div class="metrics-loading">Loading metrics...</div>';

        try {
            const metrics = this.chatWidget.getLearningMetrics();
            
            if (metrics.error) {
                metricsContainer.innerHTML = `<div class="metrics-loading">Error: ${metrics.error}</div>`;
                return;
            }

            metricsContainer.innerHTML = `
                <div class="metric-card">
                    <h4>Total Queries</h4>
                    <div class="value">${metrics.totalQueries}</div>
                    <div class="description">Questions asked to the system</div>
                </div>
                <div class="metric-card">
                    <h4>Base Template Success</h4>
                    <div class="value">${metrics.baseTemplateSuccessRate}</div>
                    <div class="description">Responses from base template</div>
                </div>
                <div class="metric-card">
                    <h4>Knowledge Entries</h4>
                    <div class="value">${metrics.knowledgeEntries}</div>
                    <div class="description">Total knowledge base entries</div>
                </div>
                <div class="metric-card">
                    <h4>Learning Events</h4>
                    <div class="value">${metrics.learningEvents}</div>
                    <div class="description">Times system learned from APIs</div>
                </div>
                <div class="metric-card">
                    <h4>External API Calls</h4>
                    <div class="value">${metrics.externalApiCalls}</div>
                    <div class="description">Fallback to external APIs</div>
                </div>
                <div class="metric-card">
                    <h4>Memory Usage</h4>
                    <div class="value">${metrics.memoryUsage}</div>
                    <div class="description">Conversation memory entries</div>
                </div>
            `;

        } catch (error) {
            this.error('Failed to load metrics:', error);
            metricsContainer.innerHTML = '<div class="metrics-loading">Failed to load metrics</div>';
        }
    }

    /**
     * Export knowledge base
     */
    async exportKnowledge() {
        try {
            const knowledge = this.chatWidget.exportKnowledgeBase();
            
            const blob = new Blob([JSON.stringify(knowledge, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jaysmobilewash_knowledge_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showStatus('Knowledge base exported successfully!', 'success');

        } catch (error) {
            this.error('Failed to export knowledge:', error);
            this.showStatus('Error exporting knowledge: ' + error.message, 'error');
        }
    }

    /**
     * Clear knowledge base
     */
    async clearKnowledge() {
        if (!confirm('Are you sure you want to clear the entire knowledge base? This action cannot be undone.')) {
            return;
        }

        try {
            this.chatWidget.clearKnowledgeBase();
            this.showStatus('Knowledge base cleared successfully!', 'success');
            
            // Refresh metrics
            this.refreshMetrics();

        } catch (error) {
            this.error('Failed to clear knowledge:', error);
            this.showStatus('Error clearing knowledge: ' + error.message, 'error');
        }
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('trainingStatus');
        statusElement.textContent = message;
        statusElement.className = `ai-training-status ${type}`;
        
        // Auto-clear after 5 seconds for success/error messages
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusElement.textContent = 'Ready to train AI system';
                statusElement.className = 'ai-training-status';
            }, 5000);
        }
    }

    /**
     * Log message (if debug enabled)
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[AITrainingInterface]', ...args);
        }
    }

    /**
     * Log error
     */
    error(...args) {
        console.error('[AITrainingInterface Error]', ...args);
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AITrainingInterface };
} else {
    window.AITrainingInterface = AITrainingInterface;
}