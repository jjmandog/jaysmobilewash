/**
 * Jay's Mobile Wash - Audio Reactive UI System
 * Version: 1.0.0
 * Last Updated: 2025-06-30
 * 
 * This system creates an immersive audio-reactive experience
 * by responding to music/audio beats and frequencies to animate UI elements.
 */

// Main class for audio analysis and beat detection
class JayAudioSystem {
    constructor(options = {}) {
        // Set configuration with defaults
        this.config = {
            beatThreshold: options.beatThreshold || 1.5,
            beatDecay: options.beatDecay || 0.98,
            beatMinimum: options.beatMinimum || 0.15,
            beatSensitivity: options.beatSensitivity || 1.0,
            frequencySmoothingFactor: options.frequencySmoothingFactor || 0.8,
            beatAnimationDuration: options.beatAnimationDuration || 300,
            useMouseFallback: options.useMouseFallback !== undefined ? options.useMouseFallback : true,
            useRandomBeats: options.useRandomBeats !== undefined ? options.useRandomBeats : true,
            randomBeatChance: options.randomBeatChance || 0.05,
            randomBeatInterval: options.randomBeatInterval || 500
        };
        
        // Properties and state variables
        this.audioContext = null;
        this.audioSource = null;
        this.analyser = null;
        this.audioData = null;
        this.beatDetected = false;
        this.beatTime = 0;
        this.beatLevel = 0;
        this.beatCutOff = 0;
        this.beatDecayRate = this.config.beatDecay;
        this.beatReactiveElements = [];
        this.beatAnticipationElements = [];
        this.rgbGlowElements = [];
        this.gyroscopeReactiveElements = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseActive = false;
        this.randomBeatInterval = null;
        this.simulatedBeatChance = this.config.randomBeatChance;
        this.simulatedBeatTimer = null;
        this.debug = options.debug || false;
        
        // Initialize the system
        this.init();
    }
    
    // Initialize everything
    init() {
        // Collect all reactive elements
        this.collectReactiveElements();
        
        // Try to initialize Web Audio API
        this.initializeAudio();
        
        // Set up mouse tracking for fallback interactions
        if (this.config.useMouseFallback) {
            this.initializeMouseTracking();
        }
        
        // Start random beat simulation if enabled
        if (this.config.useRandomBeats) {
            this.startRandomBeats();
        }
        
        // Initialize gyroscope for mobile devices if supported
        if (window.DeviceOrientationEvent) {
            this.initializeGyroscope();
        }
        
        // Start animation loop
        this.animate();
        
        if (this.debug) {
            console.log('JayAudioSystem initialized successfully');
        }
    }
    
    // Collect elements with reactive classes
    collectReactiveElements() {
        // Get all elements with specific classes
        this.beatReactiveElements = document.querySelectorAll('.beat-reactive');
        this.beatAnticipationElements = document.querySelectorAll('.beat-anticipation');
        this.rgbGlowElements = document.querySelectorAll('.rgb-glow-header');
        this.gyroscopeReactiveElements = document.querySelectorAll('.gyroscope-reactive');
        
        if (this.debug) {
            console.log(`Found ${this.beatReactiveElements.length} beat-reactive elements`);
        }
    }
    
    // Initialize Web Audio API
    initializeAudio() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create analyzer node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = this.config.frequencySmoothingFactor;
            this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Check for microphone access
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(stream => {
                    this.audioSource = this.audioContext.createMediaStreamSource(stream);
                    this.audioSource.connect(this.analyser);
                    
                    if (this.debug) {
                        console.log('Audio input connected successfully');
                    }
                })
                .catch(err => {
                    console.log('Audio input error: ', err);
                    console.log('Falling back to simulated beats');
                    this.simulatedBeatChance *= 2; // Increase chance of beats when no audio
                });
        } catch (e) {
            console.log('Web Audio API not supported, using fallback: ', e);
            this.simulatedBeatChance *= 2; // Increase chance of beats when no audio
        }
    }
    
    // Initialize mouse tracking
    initializeMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX / window.innerWidth;
            this.mouseY = e.clientY / window.innerHeight;
            this.mouseActive = true;
            
            // Reset mouse active state after 2 seconds of no movement
            clearTimeout(this.mouseTimeout);
            this.mouseTimeout = setTimeout(() => {
                this.mouseActive = false;
            }, 2000);
            
            // Mouse movement can trigger beats occasionally
            if (Math.random() < 0.01) {
                this.triggerBeat(0.5 + (this.mouseX * 0.5)); // Beat intensity based on X position
            }
        });
        
        // Click always triggers a beat
        document.addEventListener('click', () => {
            this.triggerBeat(0.8); // Strong beat on click
        });
    }
    
    // Start random beat generation
    startRandomBeats() {
        this.simulatedBeatTimer = setInterval(() => {
            if (Math.random() < this.simulatedBeatChance) {
                const intensity = 0.3 + (Math.random() * 0.7); // Random intensity between 0.3 and 1.0
                this.triggerBeat(intensity);
            }
        }, this.config.randomBeatInterval);
    }
    
    // Initialize gyroscope response
    initializeGyroscope() {
        window.addEventListener('deviceorientation', (e) => {
            if (e.beta !== null && e.gamma !== null) {
                const tiltX = Math.min(Math.max(e.gamma, -15), 15) / 2; // Limit tilt to -15/15 degrees
                const tiltY = Math.min(Math.max(e.beta, -15), 15) / 2;
                
                this.gyroscopeReactiveElements.forEach(el => {
                    el.style.transform = `perspective(1000px) rotateX(${-tiltY}deg) rotateY(${tiltX}deg)`;
                });
                
                // Strong movements can trigger beats
                const movement = Math.abs(tiltX) + Math.abs(tiltY);
                if (movement > 10) {
                    this.triggerBeat(movement / 15); // Beat intensity based on movement amount
                }
            }
        });
    }
    
    // Analyze audio for beats
    analyzeAudio() {
        if (this.analyser) {
            // Get audio data
            this.analyser.getByteFrequencyData(this.audioData);
            
            // Calculate volume
            let volume = 0;
            let count = 0;
            
            // Focus on bass frequencies (0-150Hz) for beat detection
            const bassEnd = Math.min(10, this.audioData.length);
            
            for (let i = 0; i < bassEnd; i++) {
                volume += this.audioData[i];
                count++;
            }
            
            volume = count ? volume / count : 0;
            
            // Normalize volume (0-1)
            const normalizedVolume = volume / 256;
            
            // Implement beat detection algorithm
            if (normalizedVolume > this.beatCutOff && normalizedVolume > this.config.beatMinimum) {
                this.triggerBeat(normalizedVolume);
            }
            
            // Update beat cutoff
            this.beatCutOff *= this.beatDecayRate;
            this.beatCutOff = Math.max(this.beatCutOff, this.config.beatMinimum);
        }
    }
    
    // Trigger beat animation
    triggerBeat(intensity = 1.0) {
        this.beatDetected = true;
        this.beatTime = Date.now();
        this.beatLevel = intensity * this.config.beatSensitivity;
        
        // Set beat cutoff to current volume
        this.beatCutOff = this.beatLevel;
        
        // Set CSS variable for intensity
        document.documentElement.style.setProperty('--beat-intensity', this.beatLevel);
        
        // Apply the beat to all reactive elements
        this.beatReactiveElements.forEach(el => {
            el.classList.add('on-beat');
            
            // Remove class after animation duration
            setTimeout(() => {
                el.classList.remove('on-beat');
            }, this.config.beatAnimationDuration);
        });
        
        if (this.debug) {
            console.log(`Beat triggered with intensity: ${intensity.toFixed(2)}`);
        }
    }
    
    // Main animation loop
    animate() {
        // Analyze audio for beats
        this.analyzeAudio();
        
        // Create RGB glow effects that respond to beats
        this.updateRGBGlow();
        
        // Request next frame
        requestAnimationFrame(this.animate.bind(this));
    }
    
    // Update RGB glow effects
    updateRGBGlow() {
        // Calculate a color shift based on time and beat intensity
        const time = Date.now() * 0.001;
        const beatFactor = Math.max(0, 1 - ((Date.now() - this.beatTime) / 1000));
        
        this.rgbGlowElements.forEach(el => {
            // Intensify glow on beat
            const intensity = 0.3 + (beatFactor * 0.7);
            
            // Create color rotation effect
            const r = Math.sin(time * 0.7) * 127 + 128;
            const g = Math.sin(time * 0.5 + 2) * 127 + 128;
            const b = Math.sin(time * 0.3 + 4) * 127 + 128;
            
            // Apply text shadow with color and intensity
            el.style.textShadow = `
                0 0 ${5 + (intensity * 5)}px rgba(${r}, ${g}, ${b}, ${0.5 + (intensity * 0.5)}),
                0 0 ${10 + (intensity * 10)}px rgba(${r}, ${g}, ${b}, ${0.3 + (intensity * 0.3)}),
                0 0 ${15 + (intensity * 15)}px rgba(${r}, ${g}, ${b}, ${0.1 + (intensity * 0.2)})
            `;
        });
    }
    
    // Cleanup method
    cleanup() {
        // Stop audio context
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Clear intervals and timeouts
        clearInterval(this.simulatedBeatTimer);
        clearTimeout(this.mouseTimeout);
        
        if (this.debug) {
            console.log('JayAudioSystem cleaned up');
        }
    }
}

// Page load handler with cache-busting confirmation
document.addEventListener('DOMContentLoaded', function() {
    // Log cache-busting version
    console.log('Jay Audio System loaded - v20250630032417');
    
    // Create audio system instance
    window.jayAudio = new JayAudioSystem({
        debug: false,
        beatSensitivity: 1.2,
        useRandomBeats: true,
        randomBeatChance: 0.05,
        randomBeatInterval: 1000
    });
    
    // Function to update countdown timer
    function updateCountdown() {
        const countdownTimer = document.getElementById('countdown-timer');
        
        if (countdownTimer) {
            // Set end date to 7 days from now
            const now = new Date();
            const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
            
            function update() {
                const currentDate = new Date();
                const diff = endDate - currentDate;
                
                // Calculate remaining time
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                // Update the countdown display
                document.getElementById('days').textContent = days.toString().padStart(2, '0');
                document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
                document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
                
                // If countdown is finished
                if (diff < 0) {
                    clearInterval(interval);
                    countdownTimer.innerHTML = "<span>Special Offer Expired</span>";
                }
            }
            
            // Update countdown every second
            update();
            const interval = setInterval(update, 1000);
        }
    }
    updateCountdown();
    
    // Mobile menu toggle functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            
            // Toggle hamburger menu animation
            const bars = this.querySelectorAll('.bar');
            if (mainNav.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }
    
    // Initialize before-after slider functionality
    const sliderHandles = document.querySelectorAll('.slider-handle');
    
    sliderHandles.forEach(handle => {
        const container = handle.closest('.before-after-container');
        const slider = container.querySelector('.before-after-slider');
        const afterImage = container.querySelector('.after-image');
        
        let isDragging = false;
        
        // Mouse events
        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // Touch events for mobile
        handle.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
        
        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const containerRect = slider.getBoundingClientRect();
            let x;
            
            if (e.type === 'touchmove') {
                x = e.touches[0].clientX - containerRect.left;
            } else {
                x = e.clientX - containerRect.left;
            }
            
            // Constrain x within the container
            x = Math.max(0, Math.min(x, containerRect.width));
            
            // Set the position as a percentage
            const percent = (x / containerRect.width) * 100;
            
            // Update the handle position and clip path
            handle.style.left = `${percent}%`;
            afterImage.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
        }
        
        function endDrag() {
            isDragging = false;
        }
    });
    
    // Initialize popups
    const bookingPopup = document.getElementById('bookingPopup');
    const closePopup = document.querySelector('.close-popup');
    
    if (bookingPopup && closePopup) {
        // Check if popup was already shown recently
        const popupShown = localStorage.getItem('popupShown');
        const popupLastShown = popupShown ? parseInt(popupShown) : 0;
        const currentTime = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        // Only show popup if it hasn't been shown in the last 24 hours
        if (currentTime - popupLastShown > oneDayInMs) {
            // Show popup after 15 seconds
            setTimeout(() => {
                bookingPopup.classList.add('show');
            }, 15000);
        }
        
        closePopup.addEventListener('click', () => {
            bookingPopup.classList.remove('show');
            
            // Set local storage to not show again for 1 day
            localStorage.setItem('popupShown', Date.now());
        });
    }
    
    // Cookie consent functionality
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookies = document.querySelector('.cookie-accept');
    
    if (cookieConsent && acceptCookies) {
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');
        
        if (!cookiesAccepted) {
            cookieConsent.classList.add('show');
        }
        
        acceptCookies.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieConsent.classList.remove('show');
        });
    }
    
    // Back to top functionality
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Update page history for better analytics and back-button support
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Scroll to element
                targetElement.scrollIntoView({ behavior: 'smooth' });
                
                // Update browser history to support back button and analytics
                const pageTitle = document.title;
                const url = `${window.location.pathname}#${targetId}`;
                
                window.history.pushState({ id: targetId }, pageTitle, url);
                
                // Track section view with analytics if available
                if (window.gtag) {
                    gtag('event', 'section_view', {
                        'section_id': targetId
                    });
                }
            }
        });
    });
    
    // Handle popstate for back button
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.id) {
            const targetElement = document.getElementById(e.state.id);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    console.log('All interactive elements initialized successfully');
});

// Lazy load images when they enter the viewport
document.addEventListener('DOMContentLoaded', function() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.setAttribute('src', src);
                        img.removeAttribute('data-src');
                    }
                    
                    observer.unobserve(img);
                }
            });
        });
        
        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imgObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver support
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.setAttribute('src', img.getAttribute('data-src'));
            img.removeAttribute('data-src');
        });
    }
});

// Page visibility changes - pause/resume animations as needed
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        // Page is hidden, pause intense animations to save battery
        document.body.classList.add('page-hidden');
    } else {
        // Page is visible again, resume animations
        document.body.classList.remove('page-hidden');
    }
});
