/**
 * Advanced Emergency Chatbot Accessibility Fix
 * Ensures the chatbot button remains clickable even during Jay Mode
 * Works independently and complements the main implementation
 */

console.log('�️ Advanced Emergency Chatbot Fix v2.0 loading...');

// Create a self-executing function to avoid global scope pollution
(function() {
    // Setup a MutationObserver to watch for DOM changes that might affect chatbot visibility
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            // Check if any mutation might be related to Jay Mode or overlay elements
            const needsFix = mutations.some(mutation => {
                // Check for class changes on body (Jay Mode activation)
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' && 
                    mutation.target.classList && 
                    mutation.target.classList.contains('jay-mode-active')) {
                    return true;
                }
                
                // Check for new nodes that might be overlays
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    return Array.from(mutation.addedNodes).some(node => {
                        if (node.nodeType !== Node.ELEMENT_NODE) return false;
                        
                        const element = node;
                        return element.className && (
                            element.className.includes('jay-mode') ||
                            element.className.includes('thunder') ||
                            element.className.includes('ghostly') ||
                            element.className.includes('cosmic') ||
                            element.className.includes('overlay') ||
                            parseInt(element.style.zIndex || '0') > 9000
                        );
                    });
                }
                
                return false;
            });
            
            if (needsFix) {
                console.log('🛡️ Detected potential chatbot accessibility issue - applying fix...');
                fixChatbotAccessibility();
            }
        });
        
        // Start observing the entire document
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
        
        console.log('🛡️ DOM mutation observer installed');
    }

    // Apply fixes to ensure chatbot accessibility
    function fixChatbotAccessibility() {
        // Find all chatbot elements
        const chatbotElements = document.querySelectorAll(
            '#chatbot-toggle, .chatbot-toggle, ' + 
            '#advanced-chatbot-toggle, .advanced-chatbot-widget, ' + 
            '#advanced-chatbot-container, .advanced-chatbot-widget *'
        );
        
        if (chatbotElements.length === 0) {
            console.log('⚠️ No chatbot elements found to fix');
            return;
        }
        
        // Apply fixes to each element
        chatbotElements.forEach(element => {
            element.style.zIndex = '2147483647'; // Maximum z-index
            element.style.pointerEvents = 'auto';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            element.style.display = element.classList.contains('chatbot-window') ? 
                element.style.display : 'block'; // Don't force display on the window itself
            
            // Clear any transforms or filters that might be affecting visibility
            element.style.transform = 'none';
            element.style.filter = 'none';
        });
        
        // Make sure the chatbot button is clickable
        const chatbotButton = document.querySelector('#chatbot-toggle, .chatbot-toggle');
        if (chatbotButton) {
            // Make sure existing click handlers work
            const originalOnClick = chatbotButton.onclick;
            
            // Create a function that both calls the original and provides a fallback
            chatbotButton.onclick = function(e) {
                console.log('🎯 Chatbot button clicked via emergency handler');
                
                // Try original handler first
                if (originalOnClick) {
                    originalOnClick.call(this, e);
                }
                
                // Fallback to global instances
                if (window.chatbot && window.chatbot.toggleChat) {
                    window.chatbot.toggleChat();
                } else if (window.advancedChatbot && window.advancedChatbot.toggleChat) {
                    window.advancedChatbot.toggleChat();
                }
                
                // Prevent any other handlers from stopping propagation
                e.stopPropagation();
            };
            
            // Add pulsing effect to make it more noticeable
            chatbotButton.style.animation = 'pulse-glow 2s ease-in-out infinite';
        }
        
        console.log('🛡️ Applied accessibility fixes to ' + chatbotElements.length + ' chatbot elements');
    }
    
    // Make sure any Jay Mode related elements don't block clicks
    function makeOverlaysClickThrough() {
        // Find all elements that might be Jay Mode related
        const overlays = document.querySelectorAll(
            '.purple-thunder, .ghostly-apparition, .cosmic-star, ' +
            '[class*="jay-mode"], .jay-animation-element'
        );
        
        overlays.forEach(element => {
            element.style.pointerEvents = 'none';
        });
        
        if (overlays.length > 0) {
            console.log('🛡️ Made ' + overlays.length + ' overlay elements click-through');
        }
    }
    
    // Handle click events globally to intercept clicks intended for the chatbot
    function setupGlobalClickHandler() {
        document.addEventListener('click', function(e) {
            // Skip if chat is already open
            if (document.querySelector('.chatbot-window[style*="display: block"]')) {
                return;
            }
            
            // Find chatbot button
            const chatbotBtn = document.querySelector('#chatbot-toggle, .chatbot-toggle');
            if (!chatbotBtn) return;
            
            // Check if click was near the chatbot button
            const rect = chatbotBtn.getBoundingClientRect();
            const tolerance = 15; // px
            
            if (
                e.clientX >= (rect.left - tolerance) &&
                e.clientX <= (rect.right + tolerance) &&
                e.clientY >= (rect.top - tolerance) &&
                e.clientY <= (rect.bottom + tolerance)
            ) {
                console.log('🎯 Global click handler detected click near chatbot button');
                
                // Try to toggle chat using global instances
                if (window.chatbot && window.chatbot.toggleChat) {
                    window.chatbot.toggleChat();
                } else if (window.advancedChatbot && window.advancedChatbot.toggleChat) {
                    window.advancedChatbot.toggleChat();
                }
                
                e.stopPropagation();
            }
        }, true); // Use capture phase
        
        console.log('🛡️ Global click handler installed');
    }
    
    // Add CSS that ensures chatbot is always visible and clickable
    function addEmergencyCss() {
        const style = document.createElement('style');
        style.textContent = `
            /* Emergency chatbot fix styles */
            #chatbot-toggle, 
            .chatbot-toggle,
            #advanced-chatbot-toggle,
            .advanced-chatbot-widget,
            #advanced-chatbot-container {
                z-index: 2147483647 !important; /* Maximum z-index */
                pointer-events: auto !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Make Jay Mode elements click-through */
            .purple-thunder,
            .ghostly-apparition,
            .cosmic-star,
            [class*="jay-mode-element"],
            .jay-animation-element {
                pointer-events: none !important;
            }
            
            /* Pulse animation to make button more noticeable */
            @keyframes emergency-pulse {
                0% { box-shadow: 0 0 10px rgba(236, 72, 153, 0.7); }
                50% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.9); }
                100% { box-shadow: 0 0 10px rgba(236, 72, 153, 0.7); }
            }
            
            /* Apply only when Jay Mode is active */
            body.jay-mode-active .chatbot-toggle {
                animation: emergency-pulse 2s infinite ease-in-out !important;
                border: 2px solid rgba(255, 255, 255, 0.8) !important;
            }
        `;
        document.head.appendChild(style);
        console.log('🛡️ Emergency CSS added');
    }
    
    // Initialize everything when the DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🛡️ Initializing Advanced Emergency Chatbot Fix...');
        
        // Add emergency CSS immediately
        addEmergencyCss();
        
        // Setup all protective measures
        setupMutationObserver();
        setupGlobalClickHandler();
        
        // Apply fixes immediately
        fixChatbotAccessibility();
        makeOverlaysClickThrough();
        
        // Periodically apply fixes
        setInterval(() => {
            fixChatbotAccessibility();
            makeOverlaysClickThrough();
        }, 2000);
        
        console.log('🛡️ Advanced Emergency Chatbot Fix initialized!');
    });
})();
    console.log('🔍 All chatbot elements:', document.querySelectorAll('[class*="chatbot"]'));
    
    // Log computed styles of the widget
    setTimeout(() => {
        const widget = document.querySelector('.advanced-chatbot-widget');
        if (widget) {
            const styles = window.getComputedStyle(widget);
            console.log('🎨 Widget computed styles:', {
                position: styles.position,
                bottom: styles.bottom,
                right: styles.right,
                zIndex: styles.zIndex,
                visibility: styles.visibility,
                opacity: styles.opacity,
                display: styles.display,
                pointerEvents: styles.pointerEvents,
                width: styles.width,
                height: styles.height
            });
        }
    }, 1000);
});
