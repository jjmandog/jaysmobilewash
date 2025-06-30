/**
 * Fixes the loading screen that was stuck at 0%
 * - Preserves your exact original UI design
 * - Only fixes the progress calculation and animation
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("[Loading] Initialization started");
    
    // Get your existing elements without changing their design
    const loadingScreen = document.getElementById('loading-screen');
    const loadingProgress = document.getElementById('loading-progress');
    const waterFill = document.getElementById('water-fill');
    
    if (!loadingScreen || !loadingProgress || !waterFill) {
        console.error("[Loading] Elements missing:", {
            loadingScreen: Boolean(loadingScreen),
            loadingProgress: Boolean(loadingProgress),
            waterFill: Boolean(waterFill)
        });
        return;
    }
    
    // Your original loading animation logic fixed
    let progress = 0;
    const loadingInterval = setInterval(function() {
        // Your original random progress calculation
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 100) progress = 100;
        
        // Update your existing UI elements
        loadingProgress.textContent = progress;
        waterFill.style.height = progress + '%';
        
        console.log("[Loading] Progress updated:", progress);
        
        if (progress === 100) {
            clearInterval(loadingInterval);
            
            // Your original fade-out timing
            setTimeout(function() {
                loadingScreen.style.opacity = '0';
                setTimeout(function() {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
    }, 150);
    
    // Failsafe to prevent eternal loading
    setTimeout(() => {
        if (parseInt(loadingProgress.textContent) < 100) {
            console.warn("[Loading] Force completing after timeout");
            loadingProgress.textContent = "100";
            waterFill.style.height = '100%';
            
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
    }, 8000);
});
