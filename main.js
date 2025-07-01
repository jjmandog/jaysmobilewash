document.addEventListener('DOMContentLoaded', function() {
    console.log("Main JS initialized");
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }
    
    // Add cool hover effects
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(147, 51, 234, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.2)';
        });
    });
    
    // Add subtle animation to benefit icons
    const benefitIcons = document.querySelectorAll('.benefit-item i');
    benefitIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0)';
        });
    });

    // Initialize Chat Widget with multiple AI adapters
    initializeChatWidget();
});

/**
 * Initialize the production chat widget with trainable AI system and multi-backend support
 */
function initializeChatWidget() {
    // Check if required elements exist
    if (!document.getElementById('chat-widget') || !document.getElementById('chat-bubble')) {
        console.log('Chat widget elements not found, skipping initialization');
        return;
    }

    try {
        // Configure multiple AI adapters with failover strategy
        const adapters = [];

        // Primary adapter: HuggingFace (via existing /api/ai endpoint)
        adapters.push(new window.ChatAdapters.HuggingFaceAdapter({
            endpoint: '/api/ai'
        }));

        // Secondary adapter: Netlify Functions (if available)
        adapters.push(new window.ChatAdapters.NetlifyAdapter({
            endpoint: '/netlify/functions/ai'
        }));

        // Additional adapters can be added here
        // Example: DeepSeek (would need API key configuration)
        // if (window.DEEPSEEK_API_KEY) {
        //     adapters.push(new window.ChatAdapters.DeepSeekAdapter({
        //         apiKey: window.DEEPSEEK_API_KEY
        //     }));
        // }

        // Initialize chat widget with trainable base template and production configuration
        window.jaysChatWidget = new window.ChatWidget({
            containerId: 'chat-widget',
            bubbleId: 'chat-bubble',
            adapters: adapters,
            strategy: 'failover', // Try adapters in sequence
            maxRetries: 2,
            timeout: 30000,
            debug: false, // Set to true for development
            enableTrainableTemplate: true, // Enable intelligent base template
            trainableTemplateOptions: {
                debug: false,
                confidenceThreshold: 0.7,
                maxKnowledgeEntries: 10000,
                learningRate: 0.1
            }
        });

        console.log('Chat widget initialized successfully with', adapters.length, 'adapters and trainable AI system');

        // Initialize AI Training Interface
        if (typeof window.AITrainingInterface !== 'undefined') {
            window.jaysTrainingInterface = new window.AITrainingInterface(window.jaysChatWidget, {
                debug: false
            });
            
            console.log('AI Training Interface initialized');
            
            // Add keyboard shortcut to open training interface (Ctrl+Shift+T)
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                    e.preventDefault();
                    window.jaysTrainingInterface.show();
                }
            });

            // Add training interface access for admin users
            // This could be protected by authentication in production
            window.openTrainingInterface = function() {
                if (window.jaysTrainingInterface) {
                    window.jaysTrainingInterface.show();
                } else {
                    console.error('Training interface not available');
                }
            };
        }

    } catch (error) {
        console.error('Failed to initialize chat widget:', error);
        
        // Fallback: Create a basic error-only widget
        const fallbackWidget = {
            openChat: () => {
                alert('Chat is temporarily unavailable. Please call us at 562-228-9429 for immediate assistance!');
            }
        };
        
        // Still allow bubble click for fallback
        const bubble = document.getElementById('chat-bubble');
        if (bubble) {
            bubble.addEventListener('click', fallbackWidget.openChat);
        }
    }
}
// Function to open the chat widget
function openChat() {
    if (window.jaysChatWidget) {
        window.jaysChatWidget.openChat();
    } else {
        // Fallback if widget not initialized
        alert('Chat is temporarily unavailable. Please call us at 562-228-9429 for immediate assistance!');
    }
}
