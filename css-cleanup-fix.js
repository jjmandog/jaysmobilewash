// Enhanced CSS injection fix
document.addEventListener('DOMContentLoaded', function() {
    console.log('CSS Cleanup Fix: Starting...');
    
    // Function to aggressively remove CSS content that shouldn't be visible
    function cleanupCSSContent() {
        console.log('CSS Cleanup Fix: Running cleanup...');
        
        // Target the specific EZPZ section
        const ezpzSection = document.querySelector('.ezpz-ceramic');
        if (ezpzSection) {
            console.log('CSS Cleanup Fix: Found EZPZ section');
            
            // Check all text nodes within the EZPZ section
            const walker = document.createTreeWalker(
                ezpzSection,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const textNodesToRemove = [];
            let node;
            
            while (node = walker.nextNode()) {
                const text = node.textContent || '';
                
                // Check if this text node contains CSS
                if (text.includes('@keyframes') || 
                    text.includes('animation:') ||
                    text.includes('modalSlideIn') ||
                    text.includes('laserSweep') ||
                    text.includes('transform:') ||
                    text.includes('opacity:') ||
                    (text.includes('0%') && text.includes('100%')) ||
                    text.includes('ease-out')) {
                    
                    console.log('CSS Cleanup Fix: Found CSS text node:', text.substring(0, 100) + '...');
                    textNodesToRemove.push(node);
                }
            }
            
            // Remove the problematic text nodes
            textNodesToRemove.forEach(node => {
                console.log('CSS Cleanup Fix: Removing CSS text node');
                node.textContent = '';
            });
        }
        
        // Also check all elements for CSS content
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            const textContent = element.textContent || '';
            const innerHTML = element.innerHTML || '';
            
            // If element contains only CSS and no HTML tags
            if ((textContent.includes('@keyframes') || 
                 textContent.includes('animation: modalSlideIn') ||
                 textContent.includes('laserSweep')) &&
                !innerHTML.includes('<')) {
                
                console.log('CSS Cleanup Fix: Found element with CSS content:', element);
                element.style.display = 'none';
                element.textContent = '';
            }
        });
        
        console.log('CSS Cleanup Fix: Cleanup complete');
    }
    
    // Run cleanup multiple times with different strategies
    cleanupCSSContent();
    
    // Use MutationObserver to watch for dynamic content changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                console.log('CSS Cleanup Fix: DOM changed, running cleanup...');
                setTimeout(cleanupCSSContent, 100);
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
    
    // Run cleanup at intervals
    setTimeout(cleanupCSSContent, 500);
    setTimeout(cleanupCSSContent, 1000);
    setTimeout(cleanupCSSContent, 2000);
    setTimeout(cleanupCSSContent, 5000);
    
    console.log('CSS Cleanup Fix: Initialized');
});
