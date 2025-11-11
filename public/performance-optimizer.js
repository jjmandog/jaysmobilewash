/**
 * Performance Optimizer for Jay's Mobile Wash
 * Automatically detects device capabilities and optimizes effects accordingly
 */

class PerformanceOptimizer {
    constructor() {
        this.performanceMode = 'auto'; // auto, high, medium, low
        this.deviceCapabilities = null;
        this.isLowEndDevice = false;
        this.init();
    }

    init() {
        console.log('[Performance] Initializing performance optimizer in HIGH PERFORMANCE mode...');
        this.performanceMode = 'high'; // Force high performance
        this.detectDeviceCapabilities();
        this.determineOptimalSettings();
        this.applyOptimizations();
        this.setupPerformanceMonitoring();
        // Removed addPerformanceControls() - no UI needed
    }

    /**
     * Detect device capabilities
     */
    detectDeviceCapabilities() {
        const capabilities = {
            // Hardware detection
            cores: navigator.hardwareConcurrency || 2,
            memory: navigator.deviceMemory || 2, // GB
            connection: this.getConnectionSpeed(),
            
            // Performance hints
            powerEfficient: navigator.scheduling?.isInputPending ? false : true,
            
            // Browser capabilities
            supportsWebGL: this.checkWebGLSupport(),
            supportsIntersectionObserver: 'IntersectionObserver' in window,
            supportsRequestIdleCallback: 'requestIdleCallback' in window,
            
            // Screen info
            pixelRatio: window.devicePixelRatio || 1,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            
            // Performance metrics
            initialLoadTime: performance.now(),
            fps: 60 // Will be measured
        };

        // Score device performance (0-100)
        let score = 50; // baseline
        
        // CPU cores boost
        if (capabilities.cores >= 8) score += 20;
        else if (capabilities.cores >= 4) score += 10;
        else if (capabilities.cores >= 2) score += 5;
        else score -= 15;
        
        // RAM boost
        if (capabilities.memory >= 8) score += 15;
        else if (capabilities.memory >= 4) score += 10;
        else if (capabilities.memory >= 2) score += 5;
        else score -= 20;
        
        // Connection speed
        if (capabilities.connection === 'fast') score += 10;
        else if (capabilities.connection === 'slow') score -= 15;
        
        // WebGL support
        if (!capabilities.supportsWebGL) score -= 15;
        
        // High pixel ratio can strain performance
        if (capabilities.pixelRatio > 2) score -= 10;
        
        // Mobile devices generally have less performance
        if (this.isMobile()) score -= 15;
        
        capabilities.performanceScore = Math.max(0, Math.min(100, score));
        
        // Determine if low-end device
        this.isLowEndDevice = capabilities.performanceScore < 40;
        
        this.deviceCapabilities = capabilities;
        
        console.log('[Performance] Device capabilities detected:', capabilities);
        console.log(`[Performance] Performance score: ${capabilities.performanceScore}/100`);
        console.log(`[Performance] Low-end device: ${this.isLowEndDevice}`);
    }

    /**
     * Get connection speed estimation
     */
    getConnectionSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType) {
                switch (connection.effectiveType) {
                    case 'slow-2g':
                    case '2g':
                        return 'very-slow';
                    case '3g':
                        return 'slow';
                    case '4g':
                        return 'fast';
                    default:
                        return 'medium';
                }
            }
        }
        return 'medium';
    }

    /**
     * Check WebGL support
     */
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if mobile device
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    /**
     * Determine optimal performance settings
     */
    determineOptimalSettings() {
        // Force high performance mode for optimal user experience
        this.performanceMode = 'high';
        console.log(`[Performance] Performance mode set to: ${this.performanceMode} (optimized for best experience)`);
    }

    /**
     * Apply performance optimizations
     */
    applyOptimizations() {
        console.log(`[Performance] Applying ${this.performanceMode} performance mode optimizations...`);
        
        // Add performance class to body
        document.body.classList.add(`perf-${this.performanceMode}`);
        
        switch (this.performanceMode) {
            case 'low':
                this.applyLowPerformanceMode();
                break;
            case 'medium':
                this.applyMediumPerformanceMode();
                break;
            case 'high':
                this.applyHighPerformanceMode();
                break;
        }
        
        // Apply universal optimizations
        this.applyUniversalOptimizations();
    }

    /**
     * Low performance mode - minimal effects
     */
    applyLowPerformanceMode() {
        console.log('[Performance] Applying low performance optimizations...');
        
        // Disable heavy animations
        document.body.classList.add('reduced-motion');
        
        // Reduce particle count
        this.reduceParticleCount(0.2); // 20% of original
        
        // Disable complex animations
        this.disableComplexAnimations();
        
        // Reduce water droplet frequency
        this.waterDropletDelay = 200; // Increase delay
        
        // Disable Jay Mode auto-effects
        this.disableJayModeEffects();
        
        // Reduce animation frame rate
        this.setAnimationFrameRate(30);
        
        // Disable background gradients on scroll
        this.disableScrollEffects();
    }

    /**
     * Medium performance mode - balanced effects
     */
    applyMediumPerformanceMode() {
        console.log('[Performance] Applying medium performance optimizations...');
        
        // Reduce particle count
        this.reduceParticleCount(0.6); // 60% of original
        
        // Simplify animations
        this.simplifyAnimations();
        
        // Moderate water droplet frequency
        this.waterDropletDelay = 75; // Slightly increased delay
        
        // Reduce Jay Mode effects
        this.reduceJayModeEffects();
        
        // Standard animation frame rate
        this.setAnimationFrameRate(45);
    }

    /**
     * High performance mode - full effects
     */
    applyHighPerformanceMode() {
        console.log('[Performance] Applying high performance mode (full effects)...');
        
        // Full particle count
        this.reduceParticleCount(1.0); // 100% of original
        
        // All animations enabled
        this.enableAllAnimations();
        
        // Full water droplet frequency
        this.waterDropletDelay = 50; // Original delay
        
        // Full Jay Mode effects
        this.enableFullJayModeEffects();
        
        // High animation frame rate
        this.setAnimationFrameRate(60);
    }

    /**
     * Universal optimizations for all devices
     */
    applyUniversalOptimizations() {
        // Use transform3d for hardware acceleration
        this.enableHardwareAcceleration();
        
        // Debounce scroll events
        this.debounceScrollEvents();
        
        // Lazy load images
        this.setupLazyLoading();
        
        // Optimize CSS animations
        this.optimizeCSSAnimations();
        
        // Setup intersection observer for animations
        this.setupIntersectionObserver();
    }

    /**
     * Reduce particle count based on performance mode
     */
    reduceParticleCount(factor) {
        // Update global particle count variables
        window.performanceParticleFactor = factor;
        
        // Apply to existing particles
        const particles = document.querySelectorAll('.particle, .floating-product-particle');
        const keepCount = Math.ceil(particles.length * factor);
        
        particles.forEach((particle, index) => {
            if (index >= keepCount) {
                particle.remove();
            }
        });
        
        console.log(`[Performance] Reduced particles to ${Math.round(factor * 100)}%`);
    }

    /**
     * Disable complex animations for low-end devices
     */
    disableComplexAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .perf-low .laser-beam,
            .perf-low .purple-thunder,
            .perf-low .axy-star,
            .perf-low .ghostly-apparition {
                display: none !important;
            }
            
            .perf-low .jay-audio-visualizer-container {
                display: none !important;
            }
            
            .perf-low .frequency-bands {
                display: none !important;
            }
            
            .perf-low .floating-product-particle {
                animation-duration: 20s !important;
                opacity: 0.3 !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Simplify animations for medium performance
     */
    simplifyAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .perf-medium .laser-beam {
                animation-duration: 5s !important;
                opacity: 0.6 !important;
            }
            
            .perf-medium .particle {
                animation-duration: 18s !important;
            }
            
            .perf-medium .beat-reactive.on-beat {
                animation-duration: 0.2s !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Enable hardware acceleration
     */
    enableHardwareAcceleration() {
        const style = document.createElement('style');
        style.textContent = `
            .particle,
            .floating-product-particle,
            .laser-beam,
            .beat-reactive,
            .water-droplet {
                transform: translate3d(0, 0, 0);
                will-change: transform;
                backface-visibility: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 60;
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust performance if FPS drops
                if (fps < 30 && this.performanceMode !== 'low') {
                    console.log(`[Performance] Low FPS detected (${fps}), downgrading performance mode`);
                    this.downgradePerfomanceMode();
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    /**
     * Downgrade performance mode if FPS is too low
     */
    downgradePerfomanceMode() {
        if (this.performanceMode === 'high') {
            this.performanceMode = 'medium';
            this.applyMediumPerformanceMode();
        } else if (this.performanceMode === 'medium') {
            this.performanceMode = 'low';
            this.applyLowPerformanceMode();
        }
        
        console.log(`[Performance] Downgraded to ${this.performanceMode} mode`);
    }

    /**
     * Setup intersection observer for animation triggers
     */
    setupIntersectionObserver() {
        if (!this.deviceCapabilities.supportsIntersectionObserver) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.classList.remove('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        // Observe animated elements
        document.querySelectorAll('.beat-reactive, .particle').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Debounce scroll events
     */
    debounceScrollEvents() {
        let scrollTimeout;
        const originalScroll = window.onscroll;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (originalScroll) originalScroll();
            }, 16); // ~60fps
        }, { passive: true });
    }

    /**
     * Setup performance monitoring (no UI controls)
     */
    setupAdvancedMonitoring() {
        // Monitor performance metrics silently
        this.startFPSMonitoring();
        this.monitorMemoryUsage();
        this.trackLoadTimes();
        console.log('[Performance] Advanced monitoring enabled in high performance mode');
    }

    /**
     * Manually set performance mode
     */
    setPerformanceMode(mode) {
        console.log(`[Performance] Manually setting performance mode to: ${mode}`);
        
        // Remove existing performance classes
        document.body.classList.remove('perf-low', 'perf-medium', 'perf-high', 'reduced-motion');
        
        this.performanceMode = mode;
        this.applyOptimizations();
        
        // Update controls
        const controls = document.getElementById('performance-controls');
        if (controls) {
            controls.querySelector('strong').textContent = `Performance Mode: ${mode.toUpperCase()}`;
        }
    }

    /**
     * Optimize for battery-powered devices
     */
    optimizeForBattery() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2) {
                    console.log('[Performance] Low battery detected, enabling power saving mode');
                    this.setPerformanceMode('low');
                }
                
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.15 && this.performanceMode !== 'low') {
                        console.log('[Performance] Critical battery, forcing low performance mode');
                        this.setPerformanceMode('low');
                    }
                });
            });
        }
    }

    // Placeholder methods for specific optimizations
    disableJayModeEffects() {
        window.jayModeReducedEffects = true;
    }

    reduceJayModeEffects() {
        window.jayModeReducedEffects = 'partial';
    }

    enableFullJayModeEffects() {
        window.jayModeReducedEffects = false;
    }

    setAnimationFrameRate(fps) {
        window.performanceTargetFPS = fps;
    }

    disableScrollEffects() {
        document.body.classList.add('no-scroll-effects');
    }

    enableAllAnimations() {
        document.body.classList.remove('reduced-motion', 'no-scroll-effects');
    }

    setupLazyLoading() {
        // Basic lazy loading for images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    optimizeCSSAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .particle,
            .floating-product-particle,
            .beat-reactive {
                contain: layout style paint;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize performance optimizer
window.performanceOptimizer = new PerformanceOptimizer();

// Export for global access
window.PerformanceOptimizer = PerformanceOptimizer;
