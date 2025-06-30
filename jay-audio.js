/**
 * Jay's Mobile Wash - Enhanced Audio Experience
 * Features:
 * - Multi-pattern recognition for JAY, Jay, jay's, etc.
 * - BPM detection for perfect beat synchronization
 * - Frequency band mapping (bass→logo, mids→text, highs→particles)
 * - Mobile optimizations with device motion integration
 */

class JayAudioExperience {
  constructor(options = {}) {
    // Configuration
    this.config = {
      keyPatterns: ['JAY', 'Jay', 'jay', 'jays', "jay's", "JAY'S"],
      keyMaxDelay: 2000, // ms between keystrokes
      beatSensitivity: 0.80, // 0-1 threshold for beat detection
      frequencyBands: {
        bass: { min: 20, max: 150 },
        mid: { min: 151, max: 1000 },
        high: { min: 1001, max: 20000 }
      },
      ...options
    };

    // State
    this.isPlaying = false;
    this.audioContext = null;
    this.audioBuffer = null;
    this.audioSource = null;
    this.analyser = null;
    this.beatDetector = null;
    this.timeDataArray = null;
    this.freqDataArray = null;
    this.bandEnergies = { bass: 0, mid: 0, high: 0 };
    this.lastBeatTime = 0;
    this.bpmEstimate = 0;
    this.beatHistory = [];
    this.currentBPM = 0;
    
    // Pattern recognition
    this.keySequence = '';
    this.lastKeyTime = 0;
    this.keyTimeoutId = null;
    
    // Elements to animate
    this.logoElements = document.querySelectorAll('.company-logo');
    this.textElements = document.querySelectorAll('.company-name-animated');
    this.beatElements = document.querySelectorAll('.beat-reactive');
    this.anticipationElements = document.querySelectorAll('.beat-anticipation');
    this.gyroscopeElements = document.querySelectorAll('.gyroscope-reactive');
    
    // Visualization
    this.visualizationContainer = document.querySelector('.beat-visualization-container');
    this.beatBars = document.querySelector('.beat-bars');
    
    // Callbacks
    this.onBeatCallbacks = [];
    this.onBandEnergyCallbacks = [];
    
    // Initialize
    this.init();
  }
  
  async init() {
    try {
      // Setup keyboard listeners
      this.setupKeyboardListeners();
      
      // Setup audio context
      await this.initAudioContext();
      
      // Create beat detector
      this.beatDetector = new BeatDetector({
        sensitivity: this.config.beatSensitivity,
        analyser: this.analyser
      });
      
      // Setup mobile features
      this.setupMobileFeatures();
      
      // Create visualization bars
      this.createVisualizationBars();
      
      console.log('✅ Jay Audio Experience initialized');
    } catch (error) {
      console.error('❌ Error initializing Jay Audio Experience:', error);
    }
  }
  
  setupKeyboardListeners() {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }
  
  handleKeyPress(event) {
    const key = event.key;
    const now = Date.now();
    
    // Reset sequence if too much time passed between keystrokes
    if (now - this.lastKeyTime > this.config.keyMaxDelay && this.keySequence.length > 0) {
      this.keySequence = '';
    }
    
    // Add key to sequence
    this.keySequence += key;
    this.lastKeyTime = now;
    
    // Clear previous timeout
    if (this.keyTimeoutId) {
      clearTimeout(this.keyTimeoutId);
    }
    
    // Check if sequence contains any of our patterns
    const detected = this.checkPatterns();
    if (detected) {
      this.playAudioExperience();
      this.showTriggerIndicator(`Triggered by typing: ${detected}`);
      this.keySequence = '';
    }
    
    // Set timeout to clear sequence
    this.keyTimeoutId = setTimeout(() => {
      this.keySequence = '';
    }, this.config.keyMaxDelay);
  }
  
  checkPatterns() {
    for (const pattern of this.config.keyPatterns) {
      if (this.keySequence.includes(pattern)) {
        return pattern;
      }
    }
    
    // Check for fuzzy matches with high confidence
    for (const pattern of this.config.keyPatterns) {
      const similarity = this.calculateSimilarity(this.keySequence, pattern);
      if (similarity >= 0.75) { // 75% similarity threshold
        return pattern;
      }
    }
    
    return false;
  }
  
  calculateSimilarity(str1, str2) {
    // Simple Levenshtein distance-based similarity
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        const cost = str2[i - 1] === str1[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    // Calculate similarity ratio (0-1)
    const maxLength = Math.max(str1.length, str2.length);
    const distance = matrix[str2.length][str1.length];
    return 1 - (distance / maxLength);
  }
  
  async initAudioContext() {
    // Create audio context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create analyzer node
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    
    // Create data arrays
    this.timeDataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.freqDataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    // Connect analyzer to destination
    this.analyser.connect(this.audioContext.destination);
    
    // Decode base64 audio
    await this.loadAudioFromBase64();
  }
  
  async loadAudioFromBase64() {
    try {
      // Get base64 data from hidden script tag
      const base64Element = document.getElementById('audio-base64');
      if (!base64Element) {
        throw new Error('Audio base64 element not found');
      }
      
      const base64String = base64Element.textContent.trim();
      if (!base64String) {
        throw new Error('Audio base64 content is empty');
      }
      
      // Convert base64 to array buffer
      const binaryString = window.atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode audio data
      this.audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
      
      console.log('✅ Audio loaded from base64');
    } catch (error) {
      console.error('❌ Error loading audio:', error);
      
      // Load fallback audio if base64 fails
      await this.loadFallbackAudio();
    }
  }
  
  async loadFallbackAudio() {
    try {
      // Load a fallback audio file
      const response = await fetch('/assets/audio/jay-audio.mp3');
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      console.log('✅ Fallback audio loaded');
    } catch (fallbackError) {
      console.error('❌ Fallback audio failed to load:', fallbackError);
      // Create silent buffer as last resort
      this.createSilentBuffer();
    }
  }
  
  createSilentBuffer() {
    // Create a 3-second silent buffer as last resort
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, 3 * sampleRate, sampleRate);
    this.audioBuffer = buffer;
    
    console.log('⚠️ Using silent buffer as fallback');
  }
  
  playAudioExperience() {
    // Stop any current playback
    if (this.isPlaying) {
      this.stopAudioExperience();
    }
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Create and connect audio source
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = this.audioBuffer;
    this.audioSource.connect(this.analyser);
    
    // Start playback
    this.audioSource.start(0);
    this.isPlaying = true;
    
    // Start analysis
    this.startAudioAnalysis();
    
    // Show visualization
    this.visualizationContainer.classList.add('active');
    
    // Setup end handler
    this.audioSource.onended = () => {
      this.stopAudioExperience();
    };
    
    // Trigger onPlay callbacks
    document.dispatchEvent(new CustomEvent('jay-audio-play'));
    
    // Try to activate vibration if available
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }
  
  stopAudioExperience() {
    if (!this.isPlaying) return;
    
    // Stop source
    if (this.audioSource) {
      try {
        this.audioSource.stop();
        this.audioSource.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
    }
    
    // Stop analysis
    if (this.analysisFrame) {
      cancelAnimationFrame(this.analysisFrame);
      this.analysisFrame = null;
    }
    
    // Hide visualization
    this.visualizationContainer.classList.remove('active');
    
    // Reset state
    this.isPlaying = false;
    this.lastBeatTime = 0;
    this.beatHistory = [];
    
    // Trigger onStop callbacks
    document.dispatchEvent(new CustomEvent('jay-audio-stop'));
  }
  
  startAudioAnalysis() {
    // Cancel any existing frame
    if (this.analysisFrame) {
      cancelAnimationFrame(this.analysisFrame);
    }
    
    // Start analysis loop
    const analyzeFrame = () => {
      if (!this.isPlaying) return;
      
      // Get frequency and time domain data
      this.analyser.getByteFrequencyData(this.freqDataArray);
      this.analyser.getByteTimeDomainData(this.timeDataArray);
      
      // Calculate band energies
      this.calculateBandEnergies();
      
      // Detect beats
      const beatDetected = this.beatDetector.detectBeat(this.freqDataArray);
      if (beatDetected) {
        this.onBeat(beatDetected.energy);
        
        // Update BPM calculation
        this.updateBPM();
      }
      
      // Update visualizations
      this.updateVisualizations();
      
      // Continue loop
      this.analysisFrame = requestAnimationFrame(analyzeFrame);
    };
    
    this.analysisFrame = requestAnimationFrame(analyzeFrame);
  }
  
  calculateBandEnergies() {
    const nyquist = this.audioContext.sampleRate / 2;
    const freqByteData = this.freqDataArray;
    const bins = freqByteData.length;
    
    // Reset energies
    const energies = { bass: 0, mid: 0, high: 0 };
    const counts = { bass: 0, mid: 0, high: 0 };
    
    // Calculate energy for each frequency band
    for (let i = 0; i < bins; i++) {
      // Convert bin index to frequency
      const frequency = (i / bins) * nyquist;
      const value = freqByteData[i];
      
      // Determine which band this frequency belongs to
      let band = null;
      if (frequency >= this.config.frequencyBands.bass.min && frequency <= this.config.frequencyBands.bass.max) {
        band = 'bass';
      } else if (frequency >= this.config.frequencyBands.mid.min && frequency <= this.config.frequencyBands.mid.max) {
        band = 'mid';
      } else if (frequency >= this.config.frequencyBands.high.min && frequency <= this.config.frequencyBands.high.max) {
        band = 'high';
      }
      
      // Add energy to the appropriate band
      if (band) {
        energies[band] += value;
        counts[band]++;
      }
    }
    
    // Calculate average energy for each band
    Object.keys(energies).forEach(band => {
      if (counts[band] > 0) {
        this.bandEnergies[band] = energies[band] / counts[band];
      }
    });
    
    // Trigger band energy callbacks
    this.onBandEnergyCallbacks.forEach(callback => {
      callback(this.bandEnergies);
    });
  }
  
  updateBPM() {
    const now = performance.now();
    
    // Add current beat time to history
    this.beatHistory.push(now);
    
    // Keep only the last 10 beats for calculation
    if (this.beatHistory.length > 10) {
      this.beatHistory.shift();
    }
    
    // Need at least 4 beats to calculate BPM
    if (this.beatHistory.length < 4) return;
    
    // Calculate intervals between beats
    const intervals = [];
    for (let i = 1; i < this.beatHistory.length; i++) {
      intervals.push(this.beatHistory[i] - this.beatHistory[i-1]);
    }
    
    // Calculate average interval
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // Convert to BPM (60000ms = 1 minute)
    this.currentBPM = Math.round(60000 / avgInterval);
    
    // Reasonable BPM range is 60-180
    if (this.currentBPM < 60 || this.currentBPM > 180) {
      // Likely a false detection, ignore
      return;
    }
    
    // Update UI with new BPM if needed
    const bpmDisplay = document.querySelector('.current-bpm');
    if (bpmDisplay) {
      bpmDisplay.textContent = this.currentBPM;
    }
    
    // Update CSS variable
    document.documentElement.style.setProperty('--current-bpm', this.currentBPM);
  }
  
  onBeat(energy) {
    const now = performance.now();
    const timeSinceLastBeat = now - this.lastBeatTime;
    this.lastBeatTime = now;
    
    // Normalize energy to 0-1 range
    const normalizedEnergy = Math.min(energy / 255, 1);
    
    // Apply beat effect to elements
    this.beatElements.forEach(element => {
      // Remove any existing beat classes
      element.classList.remove('on-beat');
      
      // Force a reflow to restart animation
      void element.offsetWidth;
      
      // Add beat class and set custom property for intensity
      element.classList.add('on-beat');
      element.style.setProperty('--beat-intensity', normalizedEnergy);
    });
    
    // Apply specific effects based on frequency bands
    this.applyBassEffects(this.bandEnergies.bass / 255);
    this.applyMidEffects(this.bandEnergies.mid / 255);
    this.applyHighEffects(this.bandEnergies.high / 255);
    
    // Trigger vibration on strong beats
    if (normalizedEnergy > 0.7 && 'vibrate' in navigator) {
      const vibrationLength = Math.round(normalizedEnergy * 100);
      navigator.vibrate(vibrationLength);
    }
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('jay-beat-detected', {
      detail: { 
        energy: normalizedEnergy,
        bandEnergies: this.bandEnergies,
        bpm: this.currentBPM,
        timeSinceLastBeat 
      }
    }));
  }
  
  applyBassEffects(intensity) {
    // Bass affects the logo elements
    this.logoElements.forEach(logo => {
      // Scale based on bass intensity
      const scale = 1 + (intensity * 0.15);
      logo.style.transform = `scale(${scale})`;
      
      // Glow effect
      logo.style.filter = `drop-shadow(0 0 ${intensity * 15}px rgba(236, 72, 153, ${intensity}))`;
    });
  }
  
  applyMidEffects(intensity) {
    // Mid frequencies affect text elements
    this.textElements.forEach(text => {
      // Text glow based on mid intensity
      const color = `rgba(168, 85, 247, ${intensity})`;
      text.style.textShadow = `0 0 ${intensity * 15}px ${color}, 0 0 ${intensity * 30}px ${color}`;
    });
  }
  
  applyHighEffects(intensity) {
    // High frequencies affect particles and other visual elements
    const particleElements = document.querySelectorAll('.particle');
    particleElements.forEach(particle => {
      // Adjust particle speed and opacity based on high frequency energy
      particle.style.animationDuration = `${3 - (intensity * 2)}s`;
      particle.style.opacity = Math.min(0.2 + (intensity * 0.8), 1);
    });
  }
  
  setupMobileFeatures() {
    // Device motion and orientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
    }
    
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.handleDeviceMotion.bind(this));
    }
  }
  
  handleDeviceOrientation(event) {
    if (!this.isPlaying) return;
    
    const { beta, gamma } = event;
    
    // Apply orientation effects to gyroscope elements
    this.gyroscopeElements.forEach(element => {
      // Limit rotation range for subtlety
      const rotateX = (beta || 0) * 0.2;
      const rotateY = (gamma || 0) * 0.2;
      
      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }
  
  handleDeviceMotion(event) {
    if (!this.isPlaying) return;
    
    const acceleration = event.acceleration;
    if (!acceleration) return;
    
    // Calculate overall motion magnitude
    const magnitude = Math.sqrt(
      Math.pow(acceleration.x || 0, 2) +
      Math.pow(acceleration.y || 0, 2) +
      Math.pow(acceleration.z || 0, 2)
    );
    
    // Trigger effects on significant motion
    if (magnitude > 10) { // threshold for "shake"
      // Trigger a beat effect
      this.onBeat(magnitude * 10);
      
      // Vibrate if available
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }
  }
  
  createVisualizationBars() {
    // Clear existing bars
    while (this.beatBars.firstChild) {
      this.beatBars.removeChild(this.beatBars.firstChild);
    }
    
    // Create bars
    const numBars = 32;
    for (let i = 0; i < numBars; i++) {
      const bar = document.createElement('div');
      bar.classList.add('beat-bar');
      this.beatBars.appendChild(bar);
    }
  }
  
  updateVisualizations() {
    if (!this.isPlaying) return;
    
    // Update beat bars
    const bars = this.beatBars.querySelectorAll('.beat-bar');
    const binSize = Math.floor(this.freqDataArray.length / bars.length);
    
    bars.forEach((bar, index) => {
      // Get average value for this frequency range
      let sum = 0;
      for (let i = 0; i < binSize; i++) {
        sum += this.freqDataArray[(index * binSize) + i];
      }
      const average = sum / binSize;
      
      // Update bar height
      bar.style.height = `${average}px`;
    });
  }
  
  showTriggerIndicator(message) {
    const indicator = document.querySelector('.audio-trigger-indicator');
    if (!indicator) return;
    
    // Update message and show
    indicator.textContent = message;
    indicator.classList.add('active');
    
    // Hide after 3 seconds
    setTimeout(() => {
      indicator.classList.remove('active');
    }, 3000);
  }
  
  // Public API methods
  onBeatDetected(callback) {
    if (typeof callback === 'function') {
      this.onBeatCallbacks.push(callback);
    }
    return this;
  }
  
  onBandEnergy(callback) {
    if (typeof callback === 'function') {
      this.onBandEnergyCallbacks.push(callback);
    }
    return this;
  }
  
  getCurrentBPM() {
    return this.currentBPM;
  }
  
  getBandEnergies() {
    return { ...this.bandEnergies };
  }
}

/**
 * Beat detector class for identifying beats in audio
 */
class BeatDetector {
  constructor(options = {}) {
    this.options = {
      sensitivity: 0.8,
      minThreshold: 150,
      historySize: 20,
      ...options
    };
    
    this.energyHistory = [];
    this.lastBeatTime = 0;
    this.minBeatInterval = 250; // ms between beats
  }
  
  detectBeat(freqData) {
    // Calculate energy in the bass frequencies (first 10% of frequency data)
    const numBassFrequencies = Math.floor(freqData.length * 0.1);
    let bassEnergy = 0;
    
    for (let i = 0; i < numBassFrequencies; i++) {
      bassEnergy += freqData[i];
    }
    
    bassEnergy = bassEnergy / numBassFrequencies;
    
    // Add to energy history
    this.energyHistory.push(bassEnergy);
    
    // Keep history at fixed size
    if (this.energyHistory.length > this.options.historySize) {
      this.energyHistory.shift();
    }
    
    // Not enough history to detect beats yet
    if (this.energyHistory.length < 8) {
      return false;
    }
    
    // Calculate local average (without current value)
    const recentAverage = this.energyHistory
      .slice(0, -1)
      .reduce((sum, energy) => sum + energy, 0) / (this.energyHistory.length - 1);
    
    // Current energy must be above minimum threshold
    if (bassEnergy < this.options.minThreshold) {
      return false;
    }
    
    // Current energy must be significantly higher than recent average
    const now = performance.now();
    if (bassEnergy > recentAverage * (1 + this.options.sensitivity) && 
        now - this.lastBeatTime > this.minBeatInterval) {
      
      this.lastBeatTime = now;
      return {
        energy: bassEnergy,
        ratio: bassEnergy / recentAverage
      };
    }
    
    return false;
  }
}

/**
 * Particle background visualization
 */
class ParticleBackground {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.isPlaying = false;
    
    this.options = {
      particleCount: 100,
      particleColor: 'rgba(168, 85, 247, 0.8)',
      lineColor: 'rgba(236, 72, 153, 0.15)',
      particleSize: 2,
      maxSpeed: 1,
      lineThickness: 1,
      connectDistance: 150,
      responsive: true,
      ...options
    };
    
    // Initialize
    this.init();
    this.bindEvents();
    this.start();
  }
  
  init() {
    // Set canvas size
    this.setCanvasSize();
    
    // Create particles
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  setCanvasSize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() * 2 - 1) * this.options.maxSpeed,
      vy: (Math.random() * 2 - 1) * this.options.maxSpeed,
      size: Math.random() * this.options.particleSize + 1,
      color: this.options.particleColor
    };
  }
  
  bindEvents() {
    if (this.options.responsive) {
      window.addEventListener('resize', () => {
        this.setCanvasSize();
      });
    }
    
    // Connect to audio experience if available
    document.addEventListener('jay-audio-play', () => {
      this.isPlaying = true;
    });
    
    document.addEventListener('jay-audio-stop', () => {
      this.isPlaying = false;
    });
    
    document.addEventListener('jay-beat-detected', (event) => {
      if (this.isPlaying) {
        this.onBeat(event.detail);
      }
    });
  }
  
  start() {
    this.animate();
  }
  
  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > this.width) {
        particle.vx *= -1;
      }
      
      if (particle.y < 0 || particle.y > this.height) {
        particle.vy *= -1;
      }
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
      
      // Connect particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const particle2 = this.particles[j];
        const dx = particle.x - particle2.x;
        const dy = particle.y - particle2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.options.connectDistance) {
          // Calculate opacity based on distance
          const opacity = 1 - (dist / this.options.connectDistance);
          
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(particle2.x, particle2.y);
          this.ctx.strokeStyle = this.options.lineColor.replace('0.15', opacity * 0.15);
          this.ctx.lineWidth = this.options.lineThickness;
          this.ctx.stroke();
        }
      }
    }
    
    // Continue animation loop
    requestAnimationFrame(() => this.animate());
  }
  
  onBeat(beatData) {
    const { energy } = beatData;
    const normalizedEnergy = Math.min(energy / 255, 1);
    
    // Increase particle speed on beat
    this.particles.forEach(particle => {
      particle.vx *= 1 + (normalizedEnergy * 0.2);
      particle.vy *= 1 + (normalizedEnergy * 0.2);
      
      // Clamp speed
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > this.options.maxSpeed * 3) {
        const scale = (this.options.maxSpeed * 3) / speed;
        particle.vx *= scale;
        particle.vy *= scale;
      }
    });
    
    // Flash color
    this.options.particleColor = `rgba(${Math.round(168 + normalizedEnergy * 87)}, ${Math.round(85 + normalizedEnergy * 170)}, ${Math.round(247 - normalizedEnergy * 100)}, 0.8)`;
    
    // Update particle colors
    this.particles.forEach(particle => {
      particle.color = this.options.particleColor;
    });
  }
}

// Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize JAY audio experience
  window.jayAudioExperience = new JayAudioExperience();
  
  // Add particles to background if enabled
  if (document.getElementById('particle-background')) {
    window.particleBackground = new ParticleBackground('particle-background');
  }
  
  // Create hint about the JAY typing trigger
  setTimeout(() => {
    const hint = document.createElement('div');
    hint.classList.add('audio-trigger-indicator');
    hint.textContent = "Try typing 'JAY' for a surprise...";
    document.body.appendChild(hint);
    
    setTimeout(() => {
      hint.classList.add('active');
      
      setTimeout(() => {
        hint.classList.remove('active');
        
        setTimeout(() => {
          if (hint.parentNode) {
            hint.parentNode.removeChild(hint);
          }
        }, 500);
      }, 5000);
    }, 100);
  }, 10000);
  
  // Add custom event listeners for beat detection
  document.addEventListener('jay-beat-detected', (event) => {
    const { energy, bandEnergies, bpm } = event.detail;
    
    // Update CSS variables for different frequency bands
    document.documentElement.style.setProperty('--beat-intensity', energy);
    document.documentElement.style.setProperty('--bass-intensity', bandEnergies.bass / 255);
    document.documentElement.style.setProperty('--mid-intensity', bandEnergies.mid / 255);
    document.documentElement.style.setProperty('--high-intensity', bandEnergies.high / 255);
    
    // Update BPM display
    if (bpm > 0) {
      const bpmIndicator = document.querySelector('.bpm-indicator');
      const bpmDisplay = document.querySelector('.current-bpm');
      
      if (bpmDisplay) {
        bpmDisplay.textContent = bpm;
      }
      
      if (bpmIndicator && !bpmIndicator.classList.contains('active')) {
        bpmIndicator.classList.add('active');
      }
    }
    
    // Create particles on strong beats
    if (energy > 0.7) {
      createBeatParticles(5 + Math.floor(energy * 10));
    }
  });
  
  // Create particles on beat
  function createBeatParticles(count) {
    const container = document.body;
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random position
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      
      // Random size
      const size = Math.random() * 20 + 10;
      
      // Set styles
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random animation duration
      particle.style.animationDuration = `${Math.random() * 2 + 1}s`;
      
      // Add to DOM
      container.appendChild(particle);
      
      // Remove after animation
      setTimeout(() => {
        if (particle.parentNode === container) {
          container.removeChild(particle);
        }
      }, 3000);
    }
  }
  
  // Battery status API integration
  if ('getBattery' in navigator) {
    navigator.getBattery().then(function(battery) {
      // Add battery-saver class if battery level is below 15%
      if (battery.level < 0.15 && !battery.charging) {
        document.body.classList.add('battery-saver');
      }
      
      // Listen for battery level changes
      battery.addEventListener('levelchange', function() {
        if (battery.level < 0.15 && !battery.charging) {
          document.body.classList.add('battery-saver');
        } else {
          document.body.classList.remove('battery-saver');
        }
      });
      
      // Listen for charging status changes
      battery.addEventListener('chargingchange', function() {
        if (battery.level < 0.15 && !battery.charging) {
          document.body.classList.add('battery-saver');
        } else {
          document.body.classList.remove('battery-saver');
        }
      });
    });
  }
  
  // Connection awareness for performance optimization
  if ('connection' in navigator && navigator.connection.effectiveType) {
    // Add low-bandwidth class for slow connections
    if (navigator.connection.effectiveType === 'slow-2g' || 
        navigator.connection.effectiveType === '2g') {
      document.body.classList.add('low-bandwidth');
    }
    
    // Listen for connection changes
    navigator.connection.addEventListener('change', function() {
      if (navigator.connection.effectiveType === 'slow-2g' || 
          navigator.connection.effectiveType === '2g') {
        document.body.classList.add('low-bandwidth');
      } else {
        document.body.classList.remove('low-bandwidth');
      }
    });
  }
});
