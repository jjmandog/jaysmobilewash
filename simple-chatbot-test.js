// Simple chatbot button test
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Creating simple test chatbot button...');
    
    // Remove any existing chatbot widgets
    const existingWidgets = document.querySelectorAll('.advanced-chatbot-widget');
    existingWidgets.forEach(widget => widget.remove());
    
    // Create a simple test button
    const testButton = document.createElement('div');
    testButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 50px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
        font-size: 14px;
        font-weight: 500;
        border: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;
    
    testButton.innerHTML = `
        <span style="font-size: 18px;">🤖</span>
        <span>Chat with Jay</span>
    `;
    
    testButton.addEventListener('click', function() {
        alert('Chatbot clicked! The button is working properly.');
    });
    
    // Add to page
    document.body.appendChild(testButton);
    
    console.log('✅ Simple test chatbot button created!');
});
