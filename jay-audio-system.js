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
        
        // Beat Detection Parameters - Enhanced
        this.beatCutoff = 0;
        this.beatDecayRate = 0.98;
        this.beatMinimum = 0.15;
        this.beatHoldTime = 60; // ms
        this.lastBeatTime = 0;
        this.beatDetected = false;
        
        // Enhanced BPM Detection
        this.bpmHistory = [];
        this.currentBPM = 120;
        this.bpmSamples = 20;
        this.bpmCalculationInterval = 5000; // 5 seconds
        this.lastBPMCalculation = 0;
        this.beatTimestamps = [];
        
        // Advanced Beat Analysis
        this.frequencyBands = {
            bass: { start: 0, end: 10 },
            lowMid: { start: 10, end: 30 },
            mid: { start: 30, end: 80 },
            highMid: { start: 80, end: 150 },
            treble: { start: 150, end: 256 }
        };
        
        this.bandEnergy = {
            bass: 0,
            lowMid: 0,
            mid: 0,
            highMid: 0,
            treble: 0
        };
        
        this.energyHistory = {
            bass: [],
            lowMid: [],
            mid: [],
            highMid: [],
            treble: []
        };
        
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
        
        // Configuration - Enhanced
        this.config = {
            beatSensitivity: 1.2,
            enableVisualization: true,
            useRandomBeats: true,
            randomBeatChance: 0.05,
            randomBeatInterval: 1000,
            // Enhanced BPM detection settings
            bpmSensitivity: 1.5,
            enableAdvancedBeatDetection: true,
            multiFrequencyAnalysis: true,
            adaptiveBeatThreshold: true,
            visualizationStyle: 'enhanced', // 'basic', 'enhanced', 'spectrum'
            beatReactiveElements: true,
            particleSystem: true,
            bpmVisualization: true
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
    
    // Enhanced audio visualization with multiple styles
    drawVisualization() {
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (this.config.visualizationStyle) {
            case 'enhanced':
                this.drawEnhancedVisualization();
                break;
            case 'spectrum':
                this.drawSpectrumVisualization();
                break;
            default:
                this.drawBasicVisualization();
        }
    }
    
    // Basic visualization (original)
    drawBasicVisualization() {
        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = this.dataArray[i] / 4;
            
            const gradient = this.canvasCtx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#4f46e5');
            gradient.addColorStop(0.5, '#a855f7');
            gradient.addColorStop(1, '#ec4899');
            
            this.canvasCtx.fillStyle = gradient;
            this.canvasCtx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    // Enhanced visualization with frequency band colors
    drawEnhancedVisualization() {
        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let x = 0;
        
        // Draw background gradient
        const bgGradient = this.canvasCtx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, 'rgba(31, 41, 55, 0.1)');
        bgGradient.addColorStop(1, 'rgba(31, 41, 55, 0.3)');
        this.canvasCtx.fillStyle = bgGradient;
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw frequency bars with band-specific colors
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 256) * this.canvas.height * 0.8;
            const intensity = this.dataArray[i] / 256;
            
            // Determine frequency band and color
            const bandColor = this.getFrequencyBandColor(i, intensity);
            
            // Create gradient for this bar
            const gradient = this.canvasCtx.createLinearGradient(0, this.canvas.height - barHeight, 0, this.canvas.height);
            gradient.addColorStop(0, bandColor.top);
            gradient.addColorStop(1, bandColor.bottom);
            
            this.canvasCtx.fillStyle = gradient;
            
            // Add glow effect for high intensity
            if (intensity > 0.7) {
                this.canvasCtx.shadowColor = bandColor.glow;
                this.canvasCtx.shadowBlur = 10;
            } else {
                this.canvasCtx.shadowBlur = 0;
            }
            
            this.canvasCtx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
        
        // Draw BPM indicator
        this.drawBPMIndicator();
    }
    
    // Spectrum visualization with circular display
    drawSpectrumVisualization() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        // Clear with dark background
        this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw circular spectrum
        const angleStep = (Math.PI * 2) / this.bufferLength;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const angle = i * angleStep;
            const barHeight = (this.dataArray[i] / 256) * radius * 0.5;
            const intensity = this.dataArray[i] / 256;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);
            
            const bandColor = this.getFrequencyBandColor(i, intensity);
            this.canvasCtx.strokeStyle = bandColor.top;
            this.canvasCtx.lineWidth = 2;
            
            if (intensity > 0.6) {
                this.canvasCtx.shadowColor = bandColor.glow;
                this.canvasCtx.shadowBlur = 5;
            } else {
                this.canvasCtx.shadowBlur = 0;
            }
            
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(x1, y1);
            this.canvasCtx.lineTo(x2, y2);
            this.canvasCtx.stroke();
        }
        
        // Draw center circle with BPM
        this.canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.canvasCtx.fill();
        
        this.canvasCtx.fillStyle = '#1f2937';
        this.canvasCtx.font = '12px monospace';
        this.canvasCtx.textAlign = 'center';
        this.canvasCtx.fillText(`${this.currentBPM}`, centerX, centerY - 5);
        this.canvasCtx.font = '8px monospace';
        this.canvasCtx.fillText('BPM', centerX, centerY + 8);
    }
    
    // Get color for frequency band
    getFrequencyBandColor(index, intensity) {
        const colors = {
            bass: { 
                top: `hsla(240, 100%, ${50 + intensity * 30}%, 0.9)`, 
                bottom: `hsla(260, 100%, ${30 + intensity * 20}%, 0.9)`,
                glow: '#4f46e5'
            },
            lowMid: { 
                top: `hsla(280, 100%, ${50 + intensity * 30}%, 0.9)`, 
                bottom: `hsla(300, 100%, ${30 + intensity * 20}%, 0.9)`,
                glow: '#a855f7'
            },
            mid: { 
                top: `hsla(320, 100%, ${50 + intensity * 30}%, 0.9)`, 
                bottom: `hsla(340, 100%, ${30 + intensity * 20}%, 0.9)`,
                glow: '#ec4899'
            },
            highMid: { 
                top: `hsla(20, 100%, ${50 + intensity * 30}%, 0.9)`, 
                bottom: `hsla(40, 100%, ${30 + intensity * 20}%, 0.9)`,
                glow: '#f59e0b'
            },
            treble: { 
                top: `hsla(60, 100%, ${50 + intensity * 30}%, 0.9)`, 
                bottom: `hsla(80, 100%, ${30 + intensity * 20}%, 0.9)`,
                glow: '#eab308'
            }
        };
        
        // Determine which band this frequency belongs to
        if (index < 10) return colors.bass;
        if (index < 30) return colors.lowMid;
        if (index < 80) return colors.mid;
        if (index < 150) return colors.highMid;
        return colors.treble;
    }
    
    // Draw BPM indicator
    drawBPMIndicator() {
        if (!this.config.bpmVisualization) return;
        
        const indicatorWidth = 100;
        const indicatorHeight = 20;
        const x = this.canvas.width - indicatorWidth - 10;
        const y = 10;
        
        // Draw background
        this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.canvasCtx.fillRect(x, y, indicatorWidth, indicatorHeight);
        
        // Draw BPM text
        this.canvasCtx.fillStyle = '#ffffff';
        this.canvasCtx.font = '12px monospace';
        this.canvasCtx.textAlign = 'center';
        this.canvasCtx.fillText(`${this.currentBPM} BPM`, x + indicatorWidth / 2, y + 14);
        
        // Draw beat pulse
        if (Date.now() - this.lastBeatTime < 200) {
            this.canvasCtx.strokeStyle = '#4f46e5';
            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.strokeRect(x - 2, y - 2, indicatorWidth + 4, indicatorHeight + 4);
        }
    }
    
    // Enhanced beat detection with multi-frequency analysis
    detectBeat() {
        if (!this.config.enableAdvancedBeatDetection) {
            return this.basicBeatDetection();
        }
        
        // Calculate energy for each frequency band
        this.calculateBandEnergies();
        
        // Update energy history
        this.updateEnergyHistory();
        
        // Multi-frequency beat detection
        const currentTime = Date.now();
        let beatDetected = false;
        let beatIntensity = 0;
        
        // Primary beat detection on bass frequencies
        const bassEnergy = this.bandEnergy.bass;
        const bassThreshold = this.calculateAdaptiveThreshold('bass');
        
        if (bassEnergy > bassThreshold && bassEnergy > this.beatMinimum) {
            if (currentTime - this.lastBeatTime > this.beatHoldTime) {
                beatDetected = true;
                beatIntensity = Math.max(beatIntensity, bassEnergy * this.config.beatSensitivity);
                
                // Record beat timestamp for BPM calculation
                this.beatTimestamps.push(currentTime);
                
                // Keep only recent beat timestamps (last 30 seconds)
                this.beatTimestamps = this.beatTimestamps.filter(timestamp => 
                    currentTime - timestamp < 30000
                );
            }
        }
        
        // Secondary beat detection on low-mid frequencies
        const lowMidEnergy = this.bandEnergy.lowMid;
        const lowMidThreshold = this.calculateAdaptiveThreshold('lowMid');
        
        if (lowMidEnergy > lowMidThreshold && lowMidEnergy > this.beatMinimum * 0.8) {
            if (currentTime - this.lastBeatTime > this.beatHoldTime * 1.5) {
                beatIntensity = Math.max(beatIntensity, lowMidEnergy * this.config.beatSensitivity * 0.7);
            }
        }
        
        // Trigger beat if detected
        if (beatDetected) {
            this.lastBeatTime = currentTime;
            this.triggerBeat(beatIntensity);
        }
        
        // Calculate BPM periodically
        if (currentTime - this.lastBPMCalculation > this.bpmCalculationInterval) {
            this.calculateBPM();
            this.lastBPMCalculation = currentTime;
        }
        
        // Update beat cutoffs
        this.updateBeatCutoffs();
    }
    
    // Calculate energy for each frequency band
    calculateBandEnergies() {
        // Reset energies
        Object.keys(this.bandEnergy).forEach(band => {
            this.bandEnergy[band] = 0;
        });
        
        // Calculate energy for each band
        Object.keys(this.frequencyBands).forEach(bandName => {
            const band = this.frequencyBands[bandName];
            let energy = 0;
            
            for (let i = band.start; i < Math.min(band.end, this.dataArray.length); i++) {
                energy += this.dataArray[i] * this.dataArray[i];
            }
            
            // Normalize energy
            const bandWidth = band.end - band.start;
            this.bandEnergy[bandName] = Math.sqrt(energy / bandWidth) / 256;
        });
    }
    
    // Update energy history for adaptive thresholding
    updateEnergyHistory() {
        Object.keys(this.bandEnergy).forEach(bandName => {
            this.energyHistory[bandName].push(this.bandEnergy[bandName]);
            
            // Keep only recent history (last 100 samples)
            if (this.energyHistory[bandName].length > 100) {
                this.energyHistory[bandName].shift();
            }
        });
    }
    
    // Calculate adaptive threshold for beat detection
    calculateAdaptiveThreshold(bandName) {
        const history = this.energyHistory[bandName];
        if (history.length < 10) return this.beatMinimum;
        
        // Calculate average energy
        const averageEnergy = history.reduce((sum, energy) => sum + energy, 0) / history.length;
        
        // Calculate variance
        const variance = history.reduce((sum, energy) => sum + Math.pow(energy - averageEnergy, 2), 0) / history.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Adaptive threshold = average + (sensitivity * standard deviation)
        const threshold = averageEnergy + (this.config.bpmSensitivity * standardDeviation);
        
        return Math.max(threshold, this.beatMinimum);
    }
    
    // Calculate BPM from beat timestamps
    calculateBPM() {
        if (this.beatTimestamps.length < 4) return;
        
        // Calculate intervals between beats
        const intervals = [];
        for (let i = 1; i < this.beatTimestamps.length; i++) {
            intervals.push(this.beatTimestamps[i] - this.beatTimestamps[i - 1]);
        }
        
        // Enhanced outlier filtering with median-based approach
        const sortedIntervals = [...intervals].sort((a, b) => a - b);
        const median = sortedIntervals[Math.floor(sortedIntervals.length / 2)];
        const medianDeviation = sortedIntervals.map(interval => Math.abs(interval - median));
        const madThreshold = medianDeviation.sort((a, b) => a - b)[Math.floor(medianDeviation.length / 2)] * 2.0; // Reduced for better sensitivity
        
        // Filter out outliers using robust median-based approach
        const robustIntervals = intervals.filter(interval => 
            interval > 150 && interval < 2500 && // Extended BPM range (24-400 BPM) for better detection
            Math.abs(interval - median) <= madThreshold // Median absolute deviation filter
        );
        
        if (robustIntervals.length < 2) return;
        
        // Use weighted average giving more weight to recent intervals
        let weightedSum = 0;
        let totalWeight = 0;
        robustIntervals.forEach((interval, index) => {
            const weight = Math.pow(1.1, index); // Exponentially weight recent intervals
            weightedSum += interval * weight;
            totalWeight += weight;
        });
        
        const weightedAverage = weightedSum / totalWeight;
        
        // Convert to BPM
        const rawBpm = 60000 / weightedAverage;
        
        // Enhanced smoothing with adaptive filtering
        this.bpmHistory.push(rawBpm);
        if (this.bpmHistory.length > this.bpmSamples) {
            this.bpmHistory.shift();
        }
        
        // Calculate smoothed BPM with spike reduction
        if (this.bpmHistory.length >= 3) {
            // Use median filter for spike reduction
            const sortedHistory = [...this.bpmHistory].sort((a, b) => a - b);
            const medianBpm = sortedHistory[Math.floor(sortedHistory.length / 2)];
            
            // Apply low-pass filter for smoothing
            const alpha = 0.3; // Smoothing factor
            this.currentBPM = Math.round(alpha * medianBpm + (1 - alpha) * this.currentBPM);
        } else {
            this.currentBPM = Math.round(rawBpm);
        }
        
        // Clamp BPM to reasonable extended range
        this.currentBPM = Math.max(50, Math.min(250, this.currentBPM)); // Extended from 60-200 to 50-250
        
        // Update BPM display if available
        this.updateBPMDisplay();
        
        console.log(`BPM detected: ${this.currentBPM} (raw: ${Math.round(rawBpm)}, samples: ${this.bpmHistory.length})`);
    }
    
    // Update BPM display
    updateBPMDisplay() {
        if (this.config.bpmVisualization) {
            // Create or update BPM display
            let bpmDisplay = document.getElementById('jay-bpm-display');
            if (!bpmDisplay) {
                bpmDisplay = document.createElement('div');
                bpmDisplay.id = 'jay-bpm-display';
                bpmDisplay.className = 'jay-bpm-display';
                document.body.appendChild(bpmDisplay);
            }
            
            bpmDisplay.textContent = `${this.currentBPM} BPM`;
            bpmDisplay.style.opacity = '1';
            
            // Fade out after 3 seconds
            setTimeout(() => {
                bpmDisplay.style.opacity = '0';
            }, 3000);
        }
    }
    
    // Update beat cutoffs for all frequency bands
    updateBeatCutoffs() {
        Object.keys(this.bandEnergy).forEach(bandName => {
            const currentEnergy = this.bandEnergy[bandName];
            if (currentEnergy > this.beatCutoff) {
                this.beatCutoff = currentEnergy * 1.2;
            }
        });
        
        // Reduce beat cutoff over time
        this.beatCutoff *= this.beatDecayRate;
        this.beatCutoff = Math.max(this.beatCutoff, this.beatMinimum);
    }
    
    // Fallback basic beat detection
    basicBeatDetection() {
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
