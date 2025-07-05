/**
 * Simple Emergency Chatbot Fix
 * Makes sure the chatbot button is always clickable
 */

console.log('🔧 Simple Emergency Chatbot Fix loading...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Applying emergency chatbot fix...');
    
    // Add critical CSS to ensure button visibility
    const style = document.createElement('style');
    style.textContent = `
        /* Force chatbot button to be clickable */
        #chatbot-toggle, .chatbot-toggle {
            z-index: 2147483647 !important;
            pointer-events: auto !important;
            cursor: pointer !important;
            position: relative !important;
        }
        
        /* Make Jay Mode overlays click-through */
        .jay-overlay, .jay-mode-indicator {
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Simple fix function
    function fixChatbotButton() {
        // Find the chatbot button
        const button = document.querySelector('#chatbot-toggle') || 
                      document.querySelector('.chatbot-toggle');
                      
        if (button) {
            // Fix basic properties
            button.style.zIndex = '2147483647';
            button.style.pointerEvents = 'auto';
            
            // Fix the button's container
            const container = button.closest('.advanced-chatbot-widget') || 
                             document.querySelector('#advanced-chatbot-container');
            if (container) {
                container.style.zIndex = '2147483647';
                container.style.pointerEvents = 'auto';
            }
        }
    }
    
    // Add a global click handler that detects clicks near the button
    document.addEventListener('click', function(e) {
        const button = document.querySelector('#chatbot-toggle') || 
                     document.querySelector('.chatbot-toggle');
        
        if (button) {
            // Get button position
            const rect = button.getBoundingClientRect();
            const tolerance = 10; // px
            
            // Check if click is near the button
            if (
                e.clientX >= rect.left - tolerance &&
                e.clientX <= rect.right + tolerance &&
                e.clientY >= rect.top - tolerance &&
                e.clientY <= rect.bottom + tolerance
            ) {
                console.log('🎯 Detected click near chatbot button');
                
                // Try to toggle the chatbot
                if (window.chatbot && window.chatbot.toggleChat) {
                    window.chatbot.toggleChat();
                } else if (window.advancedChatbot && window.advancedChatbot.toggleChat) {
                    window.advancedChatbot.toggleChat();
                }
            }
        }
    }, true); // Use capture phase to get the click before it can be blocked
    
    // Apply fix immediately and periodically
    fixChatbotButton();
    setInterval(fixChatbotButton, 1000);
    
    console.log('✅ Emergency chatbot fix applied!');
});
