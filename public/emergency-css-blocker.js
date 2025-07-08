// Emergency CSS content blocker - prevents any CSS content from displaying as text
(function() {
    'use strict';
    
    console.log('Emergency CSS Blocker: Starting...');
    
    // List of CSS-related strings that should never appear as visible text
    const CSS_PATTERNS = [
        '@keyframes',
        'animation:',
        'modalSlideIn',
        'laserSweep',
        'laserFromLeft',
        'laserFromRight',
        'laserFromTop',
        'laserFromBottom',
        'laserDiagonal',
        'transform:',
        'opacity:',
        'ease-out',
        '0% {',
        '50% {',
        '100% {',
        'from {',
        'to {'
    ];
    
    // Function to aggressively clean any element containing CSS content
    function emergencyCleanup() {
        console.log('Emergency CSS Blocker: Running emergency cleanup...');
        
        // Get all text nodes in the document
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const nodesToClean = [];
        let node;
        
        while (node = walker.nextNode()) {
            const text = node.textContent || '';
            
            // Check if this text node contains any CSS patterns
            for (const pattern of CSS_PATTERNS) {
                if (text.includes(pattern)) {
                    console.log('Emergency CSS Blocker: Found CSS content, removing...', text.substring(0, 100));
                    nodesToClean.push(node);
                    break;
                }
            }
        }
        
        // Remove all problematic text nodes
        nodesToClean.forEach(node => {
            node.textContent = '';
        });
        
        // Also check all elements
        document.querySelectorAll('*').forEach(element => {
            const text = element.textContent || '';
            const hasOnlyCSS = CSS_PATTERNS.some(pattern => text.includes(pattern)) && 
                              !element.children.length && 
                              text.length > 50; // Only if it's a substantial amount of CSS
            
            if (hasOnlyCSS) {
                console.log('Emergency CSS Blocker: Hiding element with CSS content');
                element.style.display = 'none';
                element.textContent = '';
            }
        });
    }
    
    // Run immediately
    emergencyCleanup();
    
    // Run on DOM changes
    const observer = new MutationObserver(function(mutations) {
        let shouldClean = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                shouldClean = true;
            }
        });
        
        if (shouldClean) {
            setTimeout(emergencyCleanup, 50);
        }
    });
    
    // Start observing
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    // Run at regular intervals as a failsafe
    setInterval(emergencyCleanup, 1000);
    
    console.log('Emergency CSS Blocker: Initialized and monitoring...');
})();
