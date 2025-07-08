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
        'to {',
        'translateX',
        'translateY',
        'scale(',
        'rotate(',
        'backdrop-filter',
        'filter:',
        'cubic-bezier',
        'ease-in',
        'ease-in-out',
        'linear',
        'infinite',
        'alternate',
        'forwards',
        'backwards',
        'both',
        'paused',
        'running',
        '@media',
        'transition:',
        'duration:',
        'delay:',
        'iteration-count:',
        'direction:',
        'fill-mode:',
        'play-state:'
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
        
        // Also check all elements for CSS content, but be more selective
        document.querySelectorAll('*').forEach(element => {
            const text = element.textContent || '';
            const innerHTML = element.innerHTML || '';
            
            // Only target elements that look like pure CSS blocks
            const isLikelyCSS = text.includes('@keyframes') && text.includes('{') && text.includes('}');
            const hasAnimationCSS = text.includes('animation:') && text.includes('keyframes');
            
            // If it's a text-only element with pure CSS content, hide it
            if ((isLikelyCSS || hasAnimationCSS) && 
                !element.children.length && 
                text.length > 50) {
                
                console.log('Emergency CSS Blocker: Hiding element with CSS content:', text.substring(0, 100));
                element.style.display = 'none';
                element.textContent = '';
            }
            
            // Check for CSS in innerHTML as well
            if (innerHTML.includes('@keyframes') || innerHTML.includes('animation:')) {
                console.log('Emergency CSS Blocker: Cleaning innerHTML with CSS');
                element.innerHTML = element.innerHTML.replace(/@keyframes[^}]+}/g, '');
                element.innerHTML = element.innerHTML.replace(/animation:[^;]+;/g, '');
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
