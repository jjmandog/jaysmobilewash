/**
 * Jay's Mobile Wash - Particle Animation System
 * Version: 1.0.0
 * Last Updated: 2025-06-30
 * 
 * This file contains the particle system for background effects
 * with water droplets, bubbles, and shine effects.
 */

(function() {
    // Helper function to log with centralized error handler if available
    function logParticleInfo(message, additionalData = {}) {
        if (typeof window !== 'undefined' && window.errorHandler && window.errorHandler.logInfo) {
            window.errorHandler.logInfo('ParticleSystem', message, null, additionalData);
        } else {
            console.log(`[JAYS_CHAT_ERROR] [ParticleSystem] ${message}`);
        }
    }

    // Configuration
    const config = {
        particleCount: 50,
        bubblesEnabled: true,
        shineEnabled: true,
        waterDropletsEnabled: true,
        particlesEnabled: true,
        reflectionsEnabled: true,
        performance: 'high', // high, medium, low
        particleSections: ['.hero-section', '.cta-section', '.faq'],
        bubbleSections: ['.cta-section', '.locations'],
        waterDropletSections: ['.hero-section', '.before-after-gallery'],
        shineSections: ['.services-preview', '.process', '.testimonials'],
        particleColors: ['#4f46e5', '#a855f7', '#ec4899'],
        minParticleSize: 5,
        maxParticleSize: 20,
        particleOpacity: 0.6,
        particleSpeed: 1
    };

    // Adjust based on device performance
    function adjustForPerformance() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const memoryInfo = navigator.deviceMemory || 8; // Default to 8GB if not available
        
        if (isMobile || memoryInfo < 4) {
            config.performance = 'low';
            config.particleCount = 15;
            config.bubblesEnabled = false;
            config.shineEnabled = false;
            config.waterDropletsEnabled = true;
            config.particlesEnabled = true;
            config.reflectionsEnabled = false;
        } else if (memoryInfo < 8) {
            config.performance = 'medium';
            config.particleCount = 30;
        }
        
        // Check for prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            config.particlesEnabled = false;
            config.bubblesEnabled = false;
            config.shineEnabled = false;
            config.waterDropletsEnabled = false;
            config.reflectionsEnabled = false;
        }
    }

    // Initialize the system
    function init() {
        logParticleInfo('Initializing particle system...');
        adjustForPerformance();
        
        if (config.particlesEnabled) createParticles();
        if (config.bubblesEnabled) createBubbles();
        if (config.waterDropletsEnabled) createWaterDroplets();
        if (config.shineEnabled) createShineEffects();
        if (config.reflectionsEnabled) createReflections();
        
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', debounce(handleResize, 200));
        
        // Set up beat detection integration
        if (window.jayAudio) {
            document.addEventListener('beat', handleBeat);
        }
        
        logParticleInfo('Particle system initialized with performance level: ' + config.performance);
    }

    // Create floating particles
    function createParticles() {
        config.particleSections.forEach(selector => {
            const sections = document.querySelectorAll(selector);
            
            sections.forEach(section => {
                // Create container if not exists
                let container = section.querySelector('.particles-container');
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'particles-container';
                    section.appendChild(container);
                }
                
                // Make sure section has position relative for absolute positioning inside
                if (getComputedStyle(section).position === 'static') {
                    section.style.position = 'relative';
                }
                
                // Create particles
                for (let i = 0; i < config.particleCount; i++) {
                    createParticle(container);
                }
            });
        });
    }

    // Create a single particle element
    function createParticle(container) {
        const particle = document.createElement('div');
        
        // Randomly select particle color
        const colorIndex = Math.floor(Math.random() * config.particleColors.length);
        const color = config.particleColors[colorIndex];
        
        particle.className = 'particle';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size between min and max
        const size = config.minParticleSize + Math.random() * (config.maxParticleSize - config.minParticleSize);
        
        // Random animation duration and delay
        const duration = (10 + Math.random() * 10) / config.particleSpeed;
        const delay = Math.random() * duration;
        
        // Apply styles
        particle.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            opacity: ${Math.random() * config.particleOpacity};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            box-shadow: 0 0 ${size/2}px ${color};
        `;
        
        container.appendChild(particle);
    }

    // Create bubble elements
    function createBubbles() {
        config.bubbleSections.forEach(selector => {
            const sections = document.querySelectorAll(selector);
            
            sections.forEach(section => {
                // Create container if not exists
                let container = section.querySelector('.bubble-container');
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'bubble-container';
                    section.appendChild(container);
                }
                
                // Make sure section has position relative
                if (getComputedStyle(section).position === 'static') {
                    section.style.position = 'relative';
                }
                
                // Start bubble generation loop
                generateBubbles(container, Math.floor(config.particleCount / 3));
            });
        });
    }

    // Generate bubble animations continuously
    function generateBubbles(container, count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (!document.body.contains(container)) return;
                
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                
                // Random position along width
                const x = 5 + Math.random() * 90;
                
                // Random size
                const size = 10 + Math.random() * 30;
                
                // Random animation duration
                const duration = 10 + Math.random() * 20;
                
                // Apply styles
                bubble.style.cssText = `
                    left: ${x}%;
                    width: ${size}px;
                    height: ${size}px;
                    animation-duration: ${duration}s;
                    animation-delay: ${i * 2}s;
                `;
                
                container.appendChild(bubble);
                
                // Remove bubble after animation completes
                setTimeout(() => {
                    if (bubble.parentNode === container) {
                        container.removeChild(bubble);
                    }
                }, duration * 1000);
                
            }, i * 2000);
        }
        
        // Continue generating bubbles
        setTimeout(() => {
            if (document.body.contains(container)) {
                generateBubbles(container, Math.floor(count / 2));
            }
        }, count * 2000);
    }

    // Create water droplet effects
    function createWaterDroplets() {
        config.waterDropletSections.forEach(selector => {
            const sections = document.querySelectorAll(selector);
            
            sections.forEach(section => {
                // Add water droplet effect
                section.classList.add('water-effect');
                
                // Create ripples on interval
                setInterval(() => {
                    if (!document.body.contains(section)) return;
                    
                    createRipple(section);
                }, 4000);
                
                // Initial ripples
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => createRipple(section), i * 1000);
                }
            });
        });
    }

    // Create a single water ripple
    function createRipple(section) {
        const ripple = document.createElement('div');
        ripple.className = 'water-ripple';
        
        // Random position
        const x = 10 + Math.random() * 80;
        const y = 10 + Math.random() * 80;
        
        // Random duration
        const duration = 3 + Math.random() * 2;
        
        // Apply styles
        ripple.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            animation-duration: ${duration}s;
        `;
        
        // Make sure section has position relative
        if (getComputedStyle(section).position === 'static') {
            section.style.position = 'relative';
        }
        
        section.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode === section) {
                section.removeChild(ripple);
            }
        }, duration * 1000);
    }

    // Create shine/reflection effects
    function createShineEffects() {
        config.shineSections.forEach(selector => {
            const sections = document.querySelectorAll(selector);
            
            sections.forEach(section => {
                // Create shine element
                const shine = document.createElement('div');
                shine.className = 'light-beam';
                
                // Make sure section has position relative
                if (getComputedStyle(section).position === 'static') {
                    section.style.position = 'relative';
                }
                
                section.appendChild(shine);
                
                // Add wipe effect
                section.classList.add('wipe-effect');
            });
        });
    }

    // Create reflection spots
    function createReflections() {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            // Skip sections that already have other effects
            if (section.querySelector('.particles-container') || 
                section.querySelector('.bubble-container') || 
                section.classList.contains('water-effect') || 
                section.classList.contains('wipe-effect')) {
                return;
            }
            
            // Create reflection
            const reflection = document.createElement('div');
            reflection.className = 'reflection';
            
            // Random position
            const x = 20 + Math.random() * 60;
            const y = 20 + Math.random() * 60;
            
            // Random size
            const size = 100 + Math.random() * 200;
            
            // Random animation delay
            const delay = Math.random() * 5;
            
            // Apply styles
            reflection.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                animation-delay: ${delay}s;
            `;
            
            // Make sure section has position relative
            if (getComputedStyle(section).position === 'static') {
                section.style.position = 'relative';
            }
            
            section.appendChild(reflection);
        });
    }

    // Handle scroll events
    function handleScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Only animate elements in viewport
        document.querySelectorAll('.particle, .bubble, .water-ripple, .reflection, .light-beam').forEach(element => {
            const rect = element.getBoundingClientRect();
            
            // Check if element is in viewport
            if (rect.top < windowHeight && rect.bottom > 0) {
                element.style.animationPlayState = 'running';
            } else {
                element.style.animationPlayState = 'paused';
            }
        });
    }

    // Handle window resize
    function handleResize() {
        // Adjust particle count based on screen size
        const width = window.innerWidth;
        
        if (width < 768) {
            config.particleCount = Math.floor(config.particleCount * 0.6);
        } else {
            // Reset to original count from config
            adjustForPerformance();
        }
        
        // Clear existing particles
        document.querySelectorAll('.particles-container').forEach(container => {
            container.innerHTML = '';
        });
        
        // Recreate particles with new count
        if (config.particlesEnabled) createParticles();
    }

    // Handle beat events from audio system
    function handleBeat(event) {
        // Pulse particles on beat
        document.querySelectorAll('.particle').forEach(particle => {
            particle.classList.add('on-beat');
            setTimeout(() => {
                particle.classList.remove('on-beat');
            }, 300);
        });
        
        // Create extra ripples on beat
        config.waterDropletSections.forEach(selector => {
            const sections = document.querySelectorAll(selector);
            sections.forEach(section => {
                createRipple(section);
            });
        });
    }

    // Utility: Debounce function for resize
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', init);
})();
