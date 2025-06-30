/**
 * Jay's Mobile Wash - Audio System Fix
 * Version: 1.0.0
 * Last Updated: 2025-06-30
 * 
 * This file fixes the audio playback and background issue
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix #1: Load and play background audio immediately
    const audioElement = document.getElementById('background-audio') || createBackgroundAudio();
    
    // Use the base64 encoded audio from the referenced file
    const audioBase64 = document.getElementById('audio-base64-data').textContent;
    if (audioBase64) {
        audioElement.src = 'data:audio/mp3;base64,' + audioBase64;
        
        // Attempt to play as soon as possible
        const playAttempt = setInterval(function() {
            audioElement.play()
                .then(() => {
                    console.log('Background audio playing successfully');
                    clearInterval(playAttempt);
                    initializeAudioReactive();
                })
                .catch(error => {
                    console.log('Audio autoplay prevented. Click anywhere to enable audio.');
                });
        }, 1000);
        
        // Allow user interaction to start audio if autoplay is blocked
        document.body.addEventListener('click', function bodyClick() {
            audioElement.play()
                .then(() => {
                    console.log('Background audio playing after user interaction');
                    document.body.removeEventListener('click', bodyClick);
                    clearInterval(playAttempt);
                    initializeAudioReactive();
                })
                .catch(error => {
                    console.error('Audio playback error:', error);
                });
        }, { once: true });
    }
    
    // Fix #2: Apply background effects immediately
    applyBackgroundEffects();
    
    // Fix #3: Initialize typing effect
    initializeTypingEffect();
    
    // Create background audio element if it doesn't exist
    function createBackgroundAudio() {
        const audio = document.createElement('audio');
        audio.id = 'background-audio';
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0.7;
        document.body.appendChild(audio);
        
        // Add audio controls
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'audio-controls-fixed';
        controlsContainer.innerHTML = `
            <button class="toggle-audio">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        document.body.appendChild(controlsContainer);
        
        // Toggle audio on button click
        controlsContainer.querySelector('.toggle-audio').addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                this.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                audio.pause();
                this.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });
        
        return audio;
    }
    
    // Initialize audio reactive elements
    function initializeAudioReactive() {
        // Create audio context and analyzer if it doesn't exist
        if (!window.jayAudio) {
            window.jayAudio = new JayAudioSystem({
                audioElement: document.getElementById('background-audio'),
                debug: true, // Enable debug to check if beat detection works
                beatSensitivity: 1.5,
                useRandomBeats: true,
                randomBeatChance: 0.1,
                randomBeatInterval: 500
            });
        }
        
        // Add beat-reactive class to elements that should respond to beats
        const elementsToAnimate = document.querySelectorAll('.hero-section h1, .premium-title, .service-card, .btn');
        elementsToAnimate.forEach(el => {
            el.classList.add('beat-reactive');
        });
        
        console.log('Audio reactive elements initialized');
    }
    
    // Apply background effects
    function applyBackgroundEffects() {
        // Fix background for hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.background = 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.95)), url("images/hero-bg.webp")';
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
            heroSection.style.position = 'relative';
            heroSection.style.overflow = 'hidden';
            
            // Add particle overlay
            const particleOverlay = document.createElement('div');
            particleOverlay.className = 'particles-container';
            heroSection.appendChild(particleOverlay);
            
            // Generate particles
            for (let i = 0; i < 20; i++) {
                createParticle(particleOverlay);
            }
        }
        
        // Apply gradient backgrounds to other sections
        document.querySelectorAll('.services-preview').forEach(section => {
            section.style.background = 'linear-gradient(to bottom, #ffffff, #f9fafb)';
            section.style.position = 'relative';
        });
        
        document.querySelectorAll('.testimonials').forEach(section => {
            section.style.background = 'linear-gradient(to bottom, #f9fafb, #ffffff)';
            section.style.position = 'relative';
        });
        
        document.querySelectorAll('.cta-section').forEach(section => {
            section.style.background = 'linear-gradient(rgba(31, 41, 55, 0.85), rgba(31, 41, 55, 0.95)), url("images/cta-bg.webp")';
            section.style.backgroundSize = 'cover';
            section.style.backgroundPosition = 'center';
            section.style.position = 'relative';
        });
        
        // Inject critical CSS for immediate effect
        const criticalCss = `
            .particle {
                position: absolute;
                border-radius: 50%;
                opacity: 0.6;
                animation: float 15s infinite ease-in-out;
            }
            
            .particle-blue {
                background-color: rgba(79, 70, 229, 0.3);
                box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
            }
            
            .particle-purple {
                background-color: rgba(168, 85, 247, 0.3);
                box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
            }
            
            .particle-pink {
                background-color: rgba(236, 72, 153, 0.3);
                box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
            }
            
            @keyframes float {
                0% { transform: translateY(0) translateX(0) rotate(0); }
                33% { transform: translateY(-20px) translateX(10px) rotate(120deg); }
                66% { transform: translateY(10px) translateX(-15px) rotate(240deg); }
                100% { transform: translateY(0) translateX(0) rotate(360deg); }
            }
            
            .beat-reactive.on-beat {
                animation: beatPulse 0.3s ease-in-out;
            }
            
            @keyframes beatPulse {
                0% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.05); filter: brightness(1.2); }
                100% { transform: scale(1); filter: brightness(1); }
            }
            
            .typed-cursor {
                opacity: 1;
                animation: typingBlink 0.7s infinite;
            }
            
            @keyframes typingBlink {
                0% { opacity: 1; }
                50% { opacity: 0; }
                100% { opacity: 1; }
            }
            
            .audio-controls-fixed {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            .toggle-audio {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(79, 70, 229, 0.8);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .toggle-audio:hover {
                background: rgba(79, 70, 229, 1);
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = criticalCss;
        document.head.appendChild(styleElement);
        
        console.log('Background effects applied');
    }
    
    // Create a particle element
    function createParticle(container) {
        const particle = document.createElement('div');
        
        // Randomly select particle color class
        const colorClasses = ['particle-blue', 'particle-purple', 'particle-pink'];
        const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
        
        particle.className = `particle ${colorClass}`;
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size between 5px and 20px
        const size = 5 + Math.random() * 15;
        
        // Random animation delay
        const delay = Math.random() * 15;
        
        // Apply styles
        particle.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            animation-delay: ${delay}s;
            opacity: ${0.3 + Math.random() * 0.4};
        `;
        
        container.appendChild(particle);
    }
    
    // Initialize typing effect
    function initializeTypingEffect() {
        const typingElements = document.querySelectorAll('.typing-effect');
        
        typingElements.forEach(element => {
            const text = element.getAttribute('data-text') || element.textContent;
            element.textContent = '';
            
            let i = 0;
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typingInterval);
                    
                    // Add blinking cursor at the end
                    const cursor = document.createElement('span');
                    cursor.className = 'typed-cursor';
                    cursor.textContent = '|';
                    element.appendChild(cursor);
                }
            }, 100);
        });
    }
});

// JayAudioSystem class if it doesn't exist
if (typeof JayAudioSystem === 'undefined') {
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
                randomBeatInterval: options.randomBeatInterval || 500,
                audioElement: options.audioElement || null
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
            
            if (this.debug) {
                console.log('JayAudioSystem initialized successfully');
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
                
                // If audio element is provided, use it as source
                if (this.config.audioElement) {
                    this.audioSource = this.audioContext.createMediaElementSource(this.config.audioElement);
                    this.audioSource.connect(this.analyser);
                    this.analyser.connect(this.audioContext.destination);
                    
                    if (this.debug) {
                        console.log('Audio element connected successfully');
                    }
                }
                // Otherwise try to use microphone input
                else {
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
                }
                
                // Start animation loop
                this.animate();
            } catch (e) {
                console.log('Web Audio API not supported, using fallback: ', e);
                this.simulatedBeatChance *= 2; // Increase chance of beats when no audio
                this.startRandomBeats(); // Ensure we at least have random beats
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
            if (this.simulatedBeatTimer) clearInterval(this.simulatedBeatTimer);
            
            this.simulatedBeatTimer = setInterval(() => {
                if (Math.random() < this.simulatedBeatChance) {
                    const intensity = 0.3 + (Math.random() * 0.7); // Random intensity between 0.3 and 1.0
                    this.triggerBeat(intensity);
                }
            }, this.config.randomBeatInterval);
        }
        
        // Animation loop
        animate() {
            // Analyze audio for beats
            this.analyzeAudio();
            
            // Request next frame
            requestAnimationFrame(this.animate.bind(this));
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
            document.querySelectorAll('.beat-reactive').forEach(el => {
                el.classList.add('on-beat');
                
                // Remove class after animation duration
                setTimeout(() => {
                    el.classList.remove('on-beat');
                }, this.config.beatAnimationDuration);
            });
            
            if (this.debug) {
                console.log(`Beat triggered with intensity: ${intensity.toFixed(2)}`);
            }
            
            // Dispatch custom beat event
            const beatEvent = new CustomEvent('beat', { detail: { intensity: intensity } });
            document.dispatchEvent(beatEvent);
        }
    }
}
