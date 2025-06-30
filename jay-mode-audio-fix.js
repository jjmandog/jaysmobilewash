/**
 * Fixes the JAY mode audio issue
 * - Keeps ALL of your original visual effects
 * - Only fixes the audio playback and beat detection
 */
document.addEventListener('DOMContentLoaded', function() {
    let keySequence = '';
    let targetSequence = 'JAY';
    const audio = document.getElementById('jay-audio');
    const jayOverlay = document.getElementById('jay-overlay');
    let jayModeActive = false;
    let jayModeTimer = null;
    
    // Check for required elements without changing UI
    if (!audio) {
        console.error("JAY audio element missing");
        return;
    }
    
    // Preload audio without changing UI
    audio.load();
    
    // Debug listeners (no UI changes)
    audio.addEventListener('canplaythrough', () => console.log("Audio ready to play"));
    audio.addEventListener('error', (e) => console.error("Audio error:", e));
    
    // Your original key sequence detector
    document.addEventListener('keydown', function(event) {
        const key = event.key.toUpperCase();
        keySequence += key;
        
        if (keySequence.length > 3) {
            keySequence = keySequence.substring(keySequence.length - 3);
        }
        
        console.log('Current sequence:', keySequence);
        
        if (keySequence === targetSequence) {
            console.log('JAY sequence detected!');
            
            if (jayModeActive) {
                deactivateJayMode();
            } else {
                activateJayMode();
            }
        }
    });
    
    function activateJayMode() {
        console.log('JAY MODE ACTIVATED!');
        jayModeActive = true;
        
        if (jayModeTimer) {
            clearTimeout(jayModeTimer);
        }
        
        // Reset audio position
        audio.currentTime = 0;
        
        // Fixed audio playback with error handling
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Audio playback started');
                
                // Your existing beat visualization
                if (typeof updateBeatVisualization === 'function') {
                    updateBeatVisualization();
                }
            }).catch(error => {
                console.error('Audio playback failed:', error);
                
                // Auto-unlock audio on browsers that block autoplay
                document.addEventListener('click', function clickHandler() {
                    audio.play().then(() => {
                        console.log('Audio started after user interaction');
                        document.removeEventListener('click', clickHandler);
                    });
                }, { once: true });
                
                alert('Click anywhere to enable JAY mode audio');
            });
        }
        
        // Your existing UI code
        jayOverlay.style.display = 'flex';
        document.body.classList.add('jay-activated');
        createParticles();
        
        // Set 45-second timer as per your specs
        jayModeTimer = setTimeout(deactivateJayMode, 45000);
    }
    
    function deactivateJayMode() {
        console.log('JAY MODE DEACTIVATED!');
        jayModeActive = false;
        
        // Stop audio
        audio.pause();
        audio.currentTime = 0;
        
        // Your existing UI code
        jayOverlay.style.display = 'none';
        document.body.classList.remove('jay-activated');
        
        document.querySelectorAll('.floating-product-particle').forEach(particle => {
            particle.remove();
        });
        
        document.querySelectorAll('.beat-reactive').forEach(element => {
            element.classList.remove('on-beat');
            element.style.transform = '';
            element.style.filter = '';
        });
        
        if (jayModeTimer) {
            clearTimeout(jayModeTimer);
            jayModeTimer = null;
        }
    }
    
    // Your original particle creation function
    function createParticles() {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-product-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = (Math.random() * 2) + 's';
            document.body.appendChild(particle);
        }
    }
});
