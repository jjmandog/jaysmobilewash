// Fix for CSS injection issue
document.addEventListener('DOMContentLoaded', function() {
    // Function to remove any CSS text content that shouldn't be visible
    function cleanupCSSContent() {
        // Find all elements that might contain CSS content as text
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(element => {
            // Check if the element's text content contains CSS keyframes or animations
            const textContent = element.textContent || '';
            
            // Check for CSS patterns that shouldn't be visible as text
            if (textContent.includes('@keyframes') || 
                textContent.includes('animation:') ||
                textContent.includes('transform:') ||
                (textContent.includes('modalSlideIn') && textContent.includes('ease-out')) ||
                textContent.includes('laserSweep') ||
                textContent.includes('laserFromLeft')) {
                
                // If this element only contains CSS and no other meaningful content
                if (textContent.trim().startsWith('@keyframes') || 
                    textContent.trim().startsWith('animation:') ||
                    (textContent.includes('opacity: 0') && textContent.includes('transform:'))) {
                    
                    console.log('Removing CSS content from element:', element);
                    element.textContent = '';
                    element.style.display = 'none';
                }
            }
        });
    }
    
    // Run cleanup immediately
    cleanupCSSContent();
    
    // Run cleanup again after a short delay to catch any dynamically added content
    setTimeout(cleanupCSSContent, 500);
    setTimeout(cleanupCSSContent, 1000);
    setTimeout(cleanupCSSContent, 2000);
});
