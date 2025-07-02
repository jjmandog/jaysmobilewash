/**
 * Simple Chatbot Implementation
 * A lightweight chatbot that works without React/complex dependencies
 */

class SimpleChatBot {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatWidget();
        this.setupEventListeners();
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.className = 'simple-chatbot-widget';
        widget.innerHTML = `
            <div class="chatbot-toggle" id="chatbot-toggle">
                <span class="chat-icon">💬</span>
                <span class="chat-text">Chat</span>
            </div>
            <div class="chatbot-window" id="chatbot-window" style="display: none;">
                <div class="chatbot-header">
                    <span class="chatbot-title">Jay's Mobile Wash Assistant</span>
                    <button class="chatbot-close" id="chatbot-close">✕</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="message bot-message">
                        <div class="message-content">
                            Hello! I'm here to help you with Jay's Mobile Wash services. How can I assist you today?
                        </div>
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Type your message...">
                    <button class="chatbot-send" id="chatbot-send">Send</button>
                </div>
            </div>
        `;
        
        this.container.appendChild(widget);
    }

    setupEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const send = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        const window = document.getElementById('chatbot-window');
        if (this.isOpen) {
            window.style.display = 'none';
            this.isOpen = false;
        } else {
            window.style.display = 'block';
            this.isOpen = true;
            document.getElementById('chatbot-input').focus();
        }
    }

    closeChat() {
        document.getElementById('chatbot-window').style.display = 'none';
        this.isOpen = false;
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            
            // Simulate bot response
            setTimeout(() => {
                const response = this.generateResponse(message);
                this.addMessage(response, 'bot');
            }, 1000);
        }
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateResponse(message) {
        const responses = {
            'hello': 'Hello! How can I help you with our mobile detailing services?',
            'hi': 'Hi there! What mobile detailing service are you interested in?',
            'price': 'Our services range from $70 for Mini Detail to $800 for Graphene Coating. Would you like specific pricing information?',
            'pricing': 'Our services range from $70 for Mini Detail to $800 for Graphene Coating. Would you like specific pricing information?',
            'book': 'Great! You can book our services by calling (562) 228-9429 or filling out our contact form. What service are you interested in?',
            'booking': 'Great! You can book our services by calling (562) 228-9429 or filling out our contact form. What service are you interested in?',
            'contact': 'You can reach us at (562) 228-9429 or email info@jaysmobilewash.net. We serve Los Angeles and Orange County.',
            'location': 'We provide mobile detailing throughout Los Angeles County and Orange County. We come to your location!',
            'service': 'We offer Mobile Detailing ($70-$200), Ceramic Coating ($450), and Graphene Coating ($800). Which interests you?',
            'services': 'We offer Mobile Detailing ($70-$200), Ceramic Coating ($450), and Graphene Coating ($800). Which interests you?',
            'ceramic': 'Our Ceramic Coating service is $450 and includes 2-year warranty protection with professional paint correction. Would you like to book?',
            'detailing': 'We have three detailing packages: Mini Detail ($70), Luxury Detail ($130), and Max Detail ($200). Which would you prefer?'
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        return 'Thanks for your message! For detailed information about our services, please call us at (562) 228-9429 or visit our website. We\'d be happy to help you find the perfect mobile detailing service!';
    }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SimpleChatBot('chatbot-container');
});