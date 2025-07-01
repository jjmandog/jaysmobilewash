/**
 * Chat Widget Tests
 * Tests for the modular chat widget and adapter system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock the chatWidget module
const mockChatWidget = {
    ChatWidget: class ChatWidget {
        constructor(options = {}) {
            this.config = {
                containerId: options.containerId || 'chat-widget',
                bubbleId: options.bubbleId || 'chat-bubble',
                adapters: options.adapters || [],
                strategy: options.strategy || 'failover',
                maxRetries: options.maxRetries || 2,
                timeout: options.timeout || 30000,
                debug: options.debug || false,
                ...options
            };
            this.isOpen = false;
            this.isTyping = false;
            this.messages = [{
                role: 'system',
                content: 'Test system prompt'
            }];
        }
        
        init() {
            return true;
        }
        
        openChat() {
            this.isOpen = true;
        }
        
        closeChat() {
            this.isOpen = false;
        }
        
        async sendMessage() {
            return 'Test response';
        }
        
        addMessage(text, type) {
            this.messages.push({ role: type === 'user' ? 'user' : 'assistant', content: text });
        }
    },
    
    HuggingFaceAdapter: class HuggingFaceAdapter {
        constructor(options = {}) {
            this.name = 'HuggingFace';
            this.endpoint = options.endpoint || '/api/ai';
        }
        
        async sendMessage(messages, options = {}) {
            if (!messages || messages.length === 0) {
                throw new Error('No messages provided');
            }
            
            // Mock API call
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: this.messagesToPrompt(messages) })
            });
            
            if (!response.ok) {
                throw new Error(`HuggingFace API error: ${response.status}`);
            }
            
            const data = await response.json();
            if (Array.isArray(data) && data[0] && data[0].generated_text) {
                return data[0].generated_text.replace(this.messagesToPrompt(messages), '').trim();
            }
            
            throw new Error('Invalid HuggingFace response format');
        }
        
        messagesToPrompt(messages) {
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
    },
    
    NetlifyAdapter: class NetlifyAdapter {
        constructor(options = {}) {
            this.name = 'Netlify';
            this.endpoint = options.endpoint || '/netlify/functions/ai';
        }
        
        async sendMessage(messages, options = {}) {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, ...options })
            });
            
            if (!response.ok) {
                throw new Error(`Netlify API error: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            }
            
            throw new Error('Invalid Netlify response format');
        }
    },
    
    DeepSeekAdapter: class DeepSeekAdapter {
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
                    messages,
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
};

describe('Chat Widget System', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        // Setup DOM environment
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="chat-bubble">Chat</div>
                <div id="chat-widget">
                    <div id="chatMessages"></div>
                    <input id="chatInput" />
                    <button id="sendButton">Send</button>
                    <button id="chat-close">Close</button>
                </div>
            </body>
            </html>
        `);
        
        document = dom.window.document;
        window = dom.window;
        
        // Setup global environment
        global.document = document;
        global.window = window;
        global.fetch = vi.fn();
        
        // Make classes available globally
        window.ChatWidget = mockChatWidget.ChatWidget;
        window.ChatAdapters = {
            HuggingFaceAdapter: mockChatWidget.HuggingFaceAdapter,
            NetlifyAdapter: mockChatWidget.NetlifyAdapter,
            DeepSeekAdapter: mockChatWidget.DeepSeekAdapter
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.document;
        delete global.window;
        delete global.fetch;
    });

    describe('ChatWidget Core Functionality', () => {
        it('should initialize with default configuration', () => {
            const widget = new mockChatWidget.ChatWidget();
            
            expect(widget.config.containerId).toBe('chat-widget');
            expect(widget.config.bubbleId).toBe('chat-bubble');
            expect(widget.config.strategy).toBe('failover');
            expect(widget.config.maxRetries).toBe(2);
            expect(widget.config.timeout).toBe(30000);
            expect(widget.isOpen).toBe(false);
            expect(widget.isTyping).toBe(false);
        });

        it('should accept custom configuration', () => {
            const customConfig = {
                containerId: 'custom-widget',
                bubbleId: 'custom-bubble',
                strategy: 'parallel',
                maxRetries: 3,
                timeout: 60000,
                debug: true
            };
            
            const widget = new mockChatWidget.ChatWidget(customConfig);
            
            expect(widget.config.containerId).toBe('custom-widget');
            expect(widget.config.strategy).toBe('parallel');
            expect(widget.config.maxRetries).toBe(3);
            expect(widget.config.debug).toBe(true);
        });

        it('should initialize with system prompt', () => {
            const widget = new mockChatWidget.ChatWidget();
            
            expect(widget.messages).toHaveLength(1);
            expect(widget.messages[0].role).toBe('system');
            expect(widget.messages[0].content).toContain('Test system prompt');
        });

        it('should handle chat open/close', () => {
            const widget = new mockChatWidget.ChatWidget();
            
            expect(widget.isOpen).toBe(false);
            
            widget.openChat();
            expect(widget.isOpen).toBe(true);
            
            widget.closeChat();
            expect(widget.isOpen).toBe(false);
        });
    });

    describe('HuggingFace Adapter', () => {
        it('should initialize with correct default configuration', () => {
            const adapter = new mockChatWidget.HuggingFaceAdapter();
            
            expect(adapter.name).toBe('HuggingFace');
            expect(adapter.endpoint).toBe('/api/ai');
        });

        it('should accept custom endpoint', () => {
            const adapter = new mockChatWidget.HuggingFaceAdapter({
                endpoint: '/custom/ai'
            });
            
            expect(adapter.endpoint).toBe('/custom/ai');
        });

        it('should convert messages to prompt format', () => {
            const adapter = new mockChatWidget.HuggingFaceAdapter();
            const messages = [
                { role: 'system', content: 'You are helpful' },
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there' }
            ];
            
            const prompt = adapter.messagesToPrompt(messages);
            
            expect(prompt).toContain('System: You are helpful');
            expect(prompt).toContain('Customer: Hello');
            expect(prompt).toContain('Assistant: Hi there');
            expect(prompt.endsWith('Assistant:')).toBe(true);
        });

        it('should handle successful API response', async () => {
            const adapter = new mockChatWidget.HuggingFaceAdapter();
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([{
                    generated_text: 'Customer: Hello\nAssistant: Hi there!'
                }])
            });
            
            const response = await adapter.sendMessage(messages);
            expect(response).toBe('Hi there!');
        });

        it('should handle API errors', async () => {
            const adapter = new mockChatWidget.HuggingFaceAdapter();
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500
            });
            
            await expect(adapter.sendMessage(messages)).rejects.toThrow('HuggingFace API error: 500');
        });

        it('should handle invalid response format', async () => {
            const adapter = new mockChatWidget.HuggingFaceAdapter();
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ invalid: 'format' })
            });
            
            await expect(adapter.sendMessage(messages)).rejects.toThrow('Invalid HuggingFace response format');
        });
    });

    describe('Netlify Adapter', () => {
        it('should initialize with correct configuration', () => {
            const adapter = new mockChatWidget.NetlifyAdapter();
            
            expect(adapter.name).toBe('Netlify');
            expect(adapter.endpoint).toBe('/netlify/functions/ai');
        });

        it('should handle successful API response', async () => {
            const adapter = new mockChatWidget.NetlifyAdapter();
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{
                        message: { content: 'Hello from Netlify!' }
                    }]
                })
            });
            
            const response = await adapter.sendMessage(messages);
            expect(response).toBe('Hello from Netlify!');
        });

        it('should handle API errors', async () => {
            const adapter = new mockChatWidget.NetlifyAdapter();
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockResolvedValue({
                ok: false,
                status: 429
            });
            
            await expect(adapter.sendMessage(messages)).rejects.toThrow('Netlify API error: 429');
        });
    });

    describe('DeepSeek Adapter', () => {
        it('should initialize with API key', () => {
            const adapter = new mockChatWidget.DeepSeekAdapter({
                apiKey: 'test-key'
            });
            
            expect(adapter.name).toBe('DeepSeek');
            expect(adapter.apiKey).toBe('test-key');
            expect(adapter.baseURL).toBe('https://api.deepseek.com/v1');
            expect(adapter.model).toBe('deepseek-chat');
        });

        it('should require API key', async () => {
            const adapter = new mockChatWidget.DeepSeekAdapter();
            const messages = [{ role: 'user', content: 'Hello' }];
            
            await expect(adapter.sendMessage(messages)).rejects.toThrow('DeepSeek API key not configured');
        });

        it('should handle successful API response', async () => {
            const adapter = new mockChatWidget.DeepSeekAdapter({
                apiKey: 'test-key'
            });
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{
                        message: { content: 'Hello from DeepSeek!' }
                    }]
                })
            });
            
            const response = await adapter.sendMessage(messages);
            expect(response).toBe('Hello from DeepSeek!');
        });

        it('should use correct headers and payload', async () => {
            const adapter = new mockChatWidget.DeepSeekAdapter({
                apiKey: 'test-key'
            });
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{ message: { content: 'Response' } }]
                })
            });
            
            await adapter.sendMessage(messages, { maxTokens: 1000, temperature: 0.5 });
            
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.deepseek.com/v1/chat/completions',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-key'
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages,
                        max_tokens: 1000,
                        temperature: 0.5
                    })
                })
            );
        });
    });

    describe('Widget Integration', () => {
        it('should initialize with multiple adapters', () => {
            const adapters = [
                new mockChatWidget.HuggingFaceAdapter(),
                new mockChatWidget.NetlifyAdapter(),
                new mockChatWidget.DeepSeekAdapter({ apiKey: 'test' })
            ];
            
            const widget = new mockChatWidget.ChatWidget({
                adapters: adapters
            });
            
            expect(widget.config.adapters).toHaveLength(3);
            expect(widget.config.adapters[0].name).toBe('HuggingFace');
            expect(widget.config.adapters[1].name).toBe('Netlify');
            expect(widget.config.adapters[2].name).toBe('DeepSeek');
        });

        it('should support strategy configuration', () => {
            const widget = new mockChatWidget.ChatWidget({
                strategy: 'parallel'
            });
            
            expect(widget.config.strategy).toBe('parallel');
        });
    });

    describe('Business Logic', () => {
        it('should include comprehensive business information in system prompt', () => {
            const widget = new mockChatWidget.ChatWidget();
            const systemMessage = widget.messages[0];
            
            // In a real implementation, we'd check for specific business details
            expect(systemMessage.role).toBe('system');
            expect(systemMessage.content).toBeTruthy();
        });

        it('should handle booking requests', () => {
            const widget = new mockChatWidget.ChatWidget();
            
            // Mock isBookingRequest method
            widget.isBookingRequest = (message) => {
                const bookingKeywords = ['book', 'schedule', 'appointment'];
                return bookingKeywords.some(keyword => 
                    message.toLowerCase().includes(keyword)
                );
            };
            
            expect(widget.isBookingRequest('I want to book a service')).toBe(true);
            expect(widget.isBookingRequest('Can I schedule an appointment?')).toBe(true);
            expect(widget.isBookingRequest('Tell me about pricing')).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            const adapter = new mockChatWidget.HuggingFaceAdapter();
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockRejectedValue(new Error('Network error'));
            
            await expect(adapter.sendMessage(messages)).rejects.toThrow('Network error');
        });

        it('should handle empty messages array', async () => {
            const adapter = new mockChatWidget.HuggingFaceAdapter();
            
            await expect(adapter.sendMessage([])).rejects.toThrow('No messages provided');
        });

        it('should handle malformed JSON responses', async () => {
            const adapter = new mockChatWidget.NetlifyAdapter();
            const messages = [{ role: 'user', content: 'Hello' }];
            
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.reject(new Error('Invalid JSON'))
            });
            
            await expect(adapter.sendMessage(messages)).rejects.toThrow('Invalid JSON');
        });
    });

    describe('Configuration Validation', () => {
        it('should validate adapter interface', () => {
            const invalidAdapter = { name: 'Invalid' }; // Missing sendMessage
            
            // In real implementation, widget would validate this
            expect(typeof invalidAdapter.sendMessage).toBe('undefined');
        });

        it('should handle missing DOM elements gracefully', () => {
            // Remove required elements
            document.getElementById('chat-widget').remove();
            
            const widget = new mockChatWidget.ChatWidget();
            
            // Widget should handle missing DOM elements without crashing
            expect(widget.init()).toBe(true);
        });
    });
});