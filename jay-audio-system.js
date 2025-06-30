/**
 * Jay's Mobile Wash - Professional Audio System with Beat Detection
 * Version: 1.0.0
 * Last Updated: 2025-06-30
 */

// Initialize audio system when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create global JayAudio object
    window.JayAudio = new JayAudioSystem();
});

class JayAudioSystem {
    constructor() {
        // Audio Elements
        this.audioElement = null;
        this.audioContext = null;
        this.audioSource = null;
        this.analyzer = null;
        this.gainNode = null;
        
        // Beat Detection Parameters
        this.beatCutoff = 0;
        this.beatDecayRate = 0.98;
        this.beatMinimum = 0.15;
        this.beatHoldTime = 60; // ms
        this.lastBeatTime = 0;
        this.beatDetected = false;
        
        // Visualization 
        this.canvas = null;
        this.canvasCtx = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.animationId = null;
        
        // Audio Status
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.7;
        
        // Configuration
        this.config = {
            beatSensitivity: 1.2,
            enableVisualization: true,
            useRandomBeats: true,
            randomBeatChance: 0.05,
            randomBeatInterval: 1000
        };
        
        // Initialize the system
        this.init();
    }
    
    // Initialize the audio system
    init() {
        console.log('Initializing Jay Audio System...');
        
        // Create audio element if it doesn't exist
        this.createAudioElement();
        
        // Set up audio context and analyzer
        this.setupAudioContext();
        
        // Create audio controls
        this.createControls();
        
        // Create visualizer if enabled
        if (this.config.enableVisualization) {
            this.createVisualizer();
        }
        
        // Set up background effects
        this.setupBackgroundEffects();
        
        // Add beat reactive class to elements
        this.setupBeatReactiveElements();
        
        // Set up random beats if enabled
        if (this.config.useRandomBeats) {
            this.setupRandomBeats();
        }
        
        // Start animation loop
        this.animate();
        
        console.log('Jay Audio System initialized successfully');
    }
    
    // Create audio element
    createAudioElement() {
        // Check if element already exists
        this.audioElement = document.getElementById('jay-audio');
        
        if (!this.audioElement) {
            // Get the base64 string from the hidden element
            const base64Data = document.getElementById('base64-audio-data');
            let audioSrc = '';
            
            if (base64Data && base64Data.textContent) {
                audioSrc = 'data:audio/mp3;base64,' + base64Data.textContent.trim();
            } else {
                console.error('Base64 audio data not found');
                return;
            }
            
            // Create new audio element
            this.audioElement = document.createElement('audio');
            this.audioElement.id = 'jay-audio';
            this.audioElement.src = audioSrc;
            this.audioElement.loop = true;
            this.audioElement.volume = this.volume;
            document.body.appendChild(this.audioElement);
            
            // Handle audio events
            this.setupAudioEvents();
        }
    }
    
    // Set up audio events
    setupAudioEvents() {
        // Audio loaded
        this.audioElement.addEventListener('canplaythrough', () => {
            console.log('Audio loaded and ready to play');
            
            // Try to play automatically
            this.playAudio();
        });
        
        // Audio error
        this.audioElement.addEventListener('error', (e) => {
            console.error('Audio error:', e);
        });
        
        // Add click handler to document to enable audio on first user interaction
        document.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.playAudio();
            }
        }, { once: true });
    }
    
    // Set up Web Audio API context and nodes
    setupAudioContext() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create analyzer node
            this.analyzer = this.audioContext.createAnalyser();
            this.analyzer.fftSize = 256;
            this.bufferLength = this.analyzer.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume;
            
            // Connect audio source if audio element exists
            if (this.audioElement) {
                this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
                this.audioSource.connect(this.analyzer);
                this.analyzer.connect(this.gainNode);
                this.gainNode.connect(this.audioContext.destination);
            }
        } catch (e) {
            console.error('Web Audio API not supported:', e);
        }
    }
    
    // Create audio controls
    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'jay-audio-controls';
        controlsContainer.innerHTML = `
            <button id="jay-audio-toggle" aria-label="Toggle audio">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        document.body.appendChild(controlsContainer);
        
        // Set up toggle button
        const toggleButton = document.getElementById('jay-audio-toggle');
        
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.pauseAudio();
                    toggleButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    this.playAudio();
                    toggleButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            });
        }
    }
    
    // Create audio visualizer
    createVisualizer() {
        // Create container
        const visualizerContainer = document.createElement('div');
        visualizerContainer.className = 'jay-audio-visualizer-container';
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = 50;
        
        visualizerContainer.appendChild(this.canvas);
        document.body.appendChild(visualizerContainer);
        
        // Get canvas context
        this.canvasCtx = this.canvas.getContext('2d');
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
        });
    }
    
    // Set up background effects
    setupBackgroundEffects() {
        // Apply background gradients to sections
        document.querySelectorAll('.hero-section').forEach(section => {
            section.style.background = 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.95)), url("images/hero-bg.webp")';
            section.style.backgroundSize = 'cover';
            section.style.backgroundPosition = 'center';
            section.style.position = 'relative';
            section.style.overflow = 'hidden';
        });
        
        document.querySelectorAll('.cta-section').forEach(section => {
            section.style.background = 'linear-gradient(rgba(31, 41, 55, 0.85), rgba(31, 41, 55, 0.95)), url("images/cta-bg.webp")';
            section.style.backgroundSize = 'cover';
            section.style.backgroundPosition = 'center';
            section.style.position = 'relative';
        });
        
        // Create particle containers
        this.createParticles();
    }
    
    // Create particles for background effects
    createParticles() {
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection) {
            // Create particles container
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'particles-container';
            
            // Add particles to container
            for (let i = 0; i < 20; i++) {
                this.createParticle(particlesContainer);
            }
            
            // Insert container into hero section
            if (heroSection.firstChild) {
                heroSection.insertBefore(particlesContainer, heroSection.firstChild);
            } else {
                heroSection.appendChild(particlesContainer);
            }
        }
    }
    
    // Create individual particle
    createParticle(container) {
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
    
    // Set up beat reactive elements
    setupBeatReactiveElements() {
        // Find elements to apply beat reactive class
        const elementsToAnimate = document.querySelectorAll('.premium-title, h1, .btn, .service-card');
        
        elementsToAnimate.forEach(el => {
            el.classList.add('beat-reactive');
        });
    }
    
    // Set up random beats for when audio analysis isn't working
    setupRandomBeats() {
        setInterval(() => {
            // Only trigger random beats if real beats aren't happening frequently
            const timeSinceLastBeat = Date.now() - this.lastBeatTime;
            
            if (timeSinceLastBeat > 2000 && Math.random() < this.config.randomBeatChance) {
                const intensity = 0.3 + (Math.random() * 0.7);
                this.triggerBeat(intensity);
            }
        }, this.config.randomBeatInterval);
    }
    
    // Play audio
    playAudio() {
        if (this.audioElement) {
            // Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Play the audio
            const playPromise = this.audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Audio playing successfully');
                    this.isPlaying = true;
                    
                    // Update control button
                    const toggleButton = document.getElementById('jay-audio-toggle');
                    if (toggleButton) {
                        toggleButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }
                }).catch(error => {
                    console.error('Audio play error:', error);
                    
                    // Set up click handler to try again on user interaction
                    if (!this.clickHandlerAdded) {
                        document.addEventListener('click', () => {
                            if (!this.isPlaying) {
                                this.playAudio();
                            }
                        }, { once: true });
                        
                        this.clickHandlerAdded = true;
                    }
                });
            }
        }
    }
    
    // Pause audio
    pauseAudio() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
            
            // Update control button
            const toggleButton = document.getElementById('jay-audio-toggle');
            if (toggleButton) {
                toggleButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        }
    }
    
    // Set volume
    setVolume(value) {
        if (value >= 0 && value <= 1) {
            this.volume = value;
            
            // Set audio element volume
            if (this.audioElement) {
                this.audioElement.volume = value;
            }
            
            // Set gain node volume
            if (this.gainNode) {
                this.gainNode.gain.value = value;
            }
        }
    }
    
    // Mute/unmute audio
    toggleMute() {
        if (this.audioElement) {
            this.isMuted = !this.isMuted;
            this.audioElement.muted = this.isMuted;
            
            return this.isMuted;
        }
        
        return false;
    }
    
    // Main animation loop
    animate() {
        // Request next animation frame
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        // Skip if analyzer not available
        if (!this.analyzer) return;
        
        // Get frequency data
        this.analyzer.getByteFrequencyData(this.dataArray);
        
        // Draw visualization if enabled
        if (this.config.enableVisualization && this.canvasCtx) {
            this.drawVisualization();
        }
        
        // Detect beats
        this.detectBeat();
    }
    
    // Draw audio visualization
    drawVisualization() {
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate bar width
        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let x = 0;
        
        // Draw frequency bars
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = this.dataArray[i] / 4;
            
            // Create gradient
            const gradient = this.canvasCtx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#4f46e5');
            gradient.addColorStop(0.5, '#a855f7');
            gradient.addColorStop(1, '#ec4899');
            
            this.canvasCtx.fillStyle = gradient;
            
            // Draw bar
            this.canvasCtx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            // Move to next bar position
            x += barWidth + 1;
        }
    }
    
    // Detect beats in audio
    detectBeat() {
        // Focus on bass frequencies (0-10)
        let sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += this.dataArray[i];
        }
        
        // Calculate average volume
        const average = sum / 10;
        const normalizedVolume = average / 256;
        
        // Detect beat using cutoff threshold
        if (normalizedVolume > this.beatCutoff && normalizedVolume > this.beatMinimum) {
            const currentTime = Date.now();
            
            // Check if enough time has passed since last beat
            if (currentTime - this.lastBeatTime > this.beatHoldTime) {
                this.lastBeatTime = currentTime;
                this.triggerBeat(normalizedVolume * this.config.beatSensitivity);
            }
            
            // Update beat cutoff
            this.beatCutoff = normalizedVolume * 1.2;
        }
        
        // Reduce beat cutoff over time
        this.beatCutoff *= this.beatDecayRate;
        this.beatCutoff = Math.max(this.beatCutoff, this.beatMinimum);
    }
    
    // Trigger beat animations and effects
    triggerBeat(intensity = 1.0) {
        this.beatDetected = true;
        this.lastBeatTime = Date.now();
        
        // Set CSS variable for beat intensity
        document.documentElement.style.setProperty('--beat-intensity', intensity);
        
        // Apply the beat to all reactive elements
        document.querySelectorAll('.beat-reactive').forEach(el => {
            el.classList.add('on-beat');
            
            // Remove class after animation duration
            setTimeout(() => {
                el.classList.remove('on-beat');
            }, 300);
        });
        
        // Dispatch beat event for other components
        const beatEvent = new CustomEvent('beat', { 
            detail: { intensity: intensity } 
        });
        document.dispatchEvent(beatEvent);
        
        console.log(`Beat detected with intensity: ${intensity.toFixed(2)}`);
    }
    
    // Clean up resources
    cleanup() {
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Disconnect audio nodes
        if (this.audioSource) {
            this.audioSource.disconnect();
        }
        
        if (this.analyzer) {
            this.analyzer.disconnect();
        }
        
        if (this.gainNode) {
            this.gainNode.disconnect();
        }
        
        // Remove audio element
        if (this.audioElement && this.audioElement.parentNode) {
            this.audioElement.parentNode.removeChild(this.audioElement);
        }
    }
}
