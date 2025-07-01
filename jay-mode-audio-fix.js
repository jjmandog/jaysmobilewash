/**
 * JAY Mode Audio System - Production Grade Error Handling
 * Critical for user engagement and brand experience
 * This system must never crash the SPA or prevent core functionality
 * 
 * Mission-critical for:
 * - User engagement and retention
 * - Brand differentiation and memorability  
 * - Easter egg discovery and viral sharing
 * - Lighthouse performance scores (no blocking errors)
 */
document.addEventListener('DOMContentLoaded', function() {
    let keySequence = '';
    let targetSequence = 'JAY';
    let jayModeActive = false;
    let jayModeTimer = null;
    
    // Audio element setup with comprehensive error handling
    const audio = document.getElementById('jay-audio');
    const jayOverlay = document.getElementById('jay-overlay');
    
    // Enhanced audio initialization - critical to never block core functionality
    function initializeAudio() {
        if (!audio) {
            console.warn('[JAY Mode] Audio element missing - continuing without audio');
            return null;
        }
        
        try {
            // Set correct audio source with fallback mechanism
            audio.src = 'BLP-Kosher-Jack-and-Jill.wav';
            audio.preload = 'auto';
            audio.volume = 0.7;
            
            // Add comprehensive error handling
            audio.addEventListener('error', (e) => {
                console.warn('[JAY Mode] Primary audio failed, trying fallback:', e);
                try {
                    audio.src = 'blp-kosher-jack-and-jill.wav';
                    audio.load();
                } catch (fallbackError) {
                    console.warn('[JAY Mode] Audio fallback failed, disabling audio:', fallbackError);
                    return null;
                }
            });
            
            audio.addEventListener('canplaythrough', () => {
                console.log('[JAY Mode] Audio ready to play');
            });
            
            audio.addEventListener('loadstart', () => {
                console.log('[JAY Mode] Audio loading started');
            });
            
            return audio;
        } catch (error) {
            console.warn('[JAY Mode] Audio initialization failed, continuing without audio:', error);
            return null;
        }
    }
    
    // Initialize audio system
    const audioSystem = initializeAudio();
    
    // Enhanced key sequence detector with error handling
    document.addEventListener('keydown', function(event) {
        try {
            const key = event.key.toUpperCase();
            keySequence += key;
            
            if (keySequence.length > 3) {
                keySequence = keySequence.substring(keySequence.length - 3);
            }
            
            console.log('[JAY Mode] Current sequence:', keySequence);
            
            if (keySequence === targetSequence) {
                console.log('[JAY Mode] Sequence detected!');
                
                if (jayModeActive) {
                    deactivateJayMode();
                } else {
                    activateJayMode();
                }
            }
        } catch (error) {
            console.warn('[JAY Mode] Key handling error (non-critical):', error);
        }
    });
    
    function activateJayMode() {
        console.log('[JAY Mode] Activating with enhanced error handling!');
        jayModeActive = true;
        
        if (jayModeTimer) {
            clearTimeout(jayModeTimer);
        }
        
        // Enhanced audio playback with comprehensive error handling
        if (audioSystem) {
            try {
                // Reset audio position safely
                audioSystem.currentTime = 0;
                
                // Attempt audio playback with promise handling
                const playPromise = audioSystem.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('[JAY Mode] Audio playback started successfully');
                        
                        // Optional: Add beat visualization if function exists
                        if (typeof updateBeatVisualization === 'function') {
                            try {
                                updateBeatVisualization();
                            } catch (vizError) {
                                console.warn('[JAY Mode] Beat visualization failed (non-critical):', vizError);
                            }
                        }
                    }).catch(error => {
                        console.warn('[JAY Mode] Audio playback failed (continuing with visuals):', error);
                        
                        // Auto-unlock audio on browsers that block autoplay
                        const unlockAudio = () => {
                            if (audioSystem) {
                                audioSystem.play().then(() => {
                                    console.log('[JAY Mode] Audio unlocked after user interaction');
                                }).catch(unlockError => {
                                    console.warn('[JAY Mode] Audio unlock failed:', unlockError);
                                });
                            }
                            document.removeEventListener('click', unlockAudio);
                        };
                        
                        document.addEventListener('click', unlockAudio, { once: true });
                    });
                }
            } catch (audioError) {
                console.warn('[JAY Mode] Audio error (continuing with visuals):', audioError);
            }
        } else {
            console.log('[JAY Mode] No audio system available, visual effects only');
        }
        
        // Visual effects with error handling - these must always work
        try {
            if (jayOverlay) {
                jayOverlay.style.display = 'flex';
                // Small delay for smooth animation
                setTimeout(() => {
                    jayOverlay.classList.add('active');
                }, 10);
            }
            document.body.classList.add('jay-activated');
            createParticles();
        } catch (visualError) {
            console.error('[JAY Mode] Critical: Visual effects failed:', visualError);
        }
        
        // Set timer for auto-deactivation (45 seconds as specified)
        jayModeTimer = setTimeout(deactivateJayMode, 45000);
    }
    
    function deactivateJayMode() {
        console.log('[JAY Mode] Deactivating with enhanced cleanup!');
        jayModeActive = false;
        
        // Enhanced audio stopping with error handling
        if (audioSystem) {
            try {
                audioSystem.pause();
                audioSystem.currentTime = 0;
                console.log('[JAY Mode] Audio stopped successfully');
            } catch (audioError) {
                console.warn('[JAY Mode] Audio stop failed (non-critical):', audioError);
            }
        }
        
        // Enhanced visual cleanup with comprehensive error handling
        try {
            if (jayOverlay) {
                jayOverlay.classList.remove('active');
                setTimeout(() => {
                    jayOverlay.style.display = 'none';
                }, 500);
            }
            document.body.classList.remove('jay-activated');
            
            // Safe particle cleanup with individual error handling
            const particles = document.querySelectorAll('.floating-product-particle');
            particles.forEach(particle => {
                try {
                    particle.remove();
                } catch (removeError) {
                    console.warn('[JAY Mode] Particle removal failed:', removeError);
                }
            });
            
            // Clean up beat visualization effects safely
            document.querySelectorAll('.beat-reactive').forEach(element => {
                try {
                    element.classList.remove('on-beat');
                    element.style.transform = '';
                    element.style.filter = '';
                } catch (beatCleanupError) {
                    console.warn('[JAY Mode] Beat effect cleanup failed:', beatCleanupError);
                }
            });
            
            console.log('[JAY Mode] Visual cleanup completed');
        } catch (cleanupError) {
            console.error('[JAY Mode] Critical: Visual cleanup failed:', cleanupError);
        }
        
        // Timer cleanup
        if (jayModeTimer) {
            clearTimeout(jayModeTimer);
            jayModeTimer = null;
        }
    }
    
    // Enhanced particle creation with error handling
    function createParticles() {
        try {
            console.log('[JAY Mode] Creating particles');
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    try {
                        const particle = document.createElement('div');
                        particle.className = 'floating-product-particle';
                        particle.style.cssText = `
                            position: fixed;
                            width: 40px;
                            height: 40px;
                            background-image: url('https://i.ibb.co/1Yk0MChV/F91-F533-E-C5-CF-4-D18-A295-7-B40-C430-B8-E6-1.png');
                            background-size: contain;
                            background-repeat: no-repeat;
                            pointer-events: none;
                            left: ${Math.random() * 100}%;
                            bottom: -50px;
                            z-index: 10001;
                            animation: float-up ${6 + Math.random() * 4}s linear forwards;
                        `;
                        document.body.appendChild(particle);
                        
                        // Auto-remove particle after animation
                        setTimeout(() => {
                            try {
                                if (particle.parentNode) {
                                    particle.remove();
                                }
                            } catch (removeError) {
                                console.warn('[JAY Mode] Particle auto-removal failed:', removeError);
                            }
                        }, 10000);
                    } catch (particleError) {
                        console.warn('[JAY Mode] Individual particle creation failed:', particleError);
                    }
                }, i * 100);
            }
        } catch (particleSystemError) {
            console.warn('[JAY Mode] Particle system failed (non-critical):', particleSystemError);
        }
    }
});
