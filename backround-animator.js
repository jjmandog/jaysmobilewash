/**
 * Jay's Mobile Wash - Background Animator
 * Version: 1.0.0
 * Last Updated: 2025-06-30
 * 
 * This file handles the dynamic background and section dividers
 * for the Jay's Mobile Wash website.
 */

(function() {
    // Helper function to log with centralized error handler if available
    function logBackgroundInfo(message, additionalData = {}) {
        if (typeof window !== 'undefined' && window.errorHandler && window.errorHandler.logInfo) {
            window.errorHandler.logInfo('BackgroundAnimator', message, null, additionalData);
        } else {
            console.log(`[JAYS_CHAT_ERROR] [BackgroundAnimator] ${message}`);
        }
    }

    function logBackgroundError(message, error = null, additionalData = {}) {
        if (typeof window !== 'undefined' && window.errorHandler && window.errorHandler.logError) {
            window.errorHandler.logError('BackgroundAnimator', message, error, additionalData);
        } else {
            console.error(`[JAYS_CHAT_ERROR] [BackgroundAnimator] ${message}`, error);
        }
    }

    // Configuration
    const config = {
        waveEnabled: true,
        gradientShiftEnabled: true,
        colorPalette: {
            primary: '#4f46e5',
            secondary: '#a855f7',
            accent: '#ec4899',
            dark: '#1f2937',
            light: '#f9fafb',
            white: '#ffffff'
        },
        gradientSpeed: 15, // seconds for a full cycle
        scrollEffectsEnabled: true,
        parallaxEnabled: true,
        parallaxStrength: 0.15, // parallax effect strength
        lightEffectsEnabled: true,
        dividerStyles: ['wave', 'curve', 'angle', 'arrow'],
        sectionMap: [
            { selector: '.hero-section', background: 'dark-gradient', parallax: true, particles: true },
            { selector: '.services-preview', background: 'light', divider: 'wave', dividerPosition: 'bottom' },
            { selector: '.before-after-gallery', background: 'light-pattern', divider: 'curve', dividerPosition: 'both' },
            { selector: '.testimonials', background: 'white', divider: 'angle', dividerPosition: 'top' },
            { selector: '.locations', background: 'light-pattern', divider: 'wave', dividerPosition: 'bottom' },
            { selector: '.process', background: 'white-gradient', divider: 'curve', dividerPosition: 'bottom' },
            { selector: '.faq', background: 'light-dots', divider: 'arrow', dividerPosition: 'top' },
            { selector: '.cta-section', background: 'dark-gradient', particles: true, divider: 'wave', dividerPosition: 'top' },
            { selector: '.latest-blog', background: 'white', divider: 'angle', dividerPosition: 'top' },
            { selector: '.instagram-feed', background: 'light-pattern', divider: 'wave', dividerPosition: 'top' }
        ]
    };

    // Initialize
    function init() {
        logBackgroundInfo('Initializing background animator...');
        
        // Apply background styles based on section mapping
        applySectionBackgrounds();
        
        // Add section dividers
        if (config.waveEnabled) {
            addSectionDividers();
        }
        
        // Set up scroll effects
        if (config.scrollEffectsEnabled) {
            setupScrollEffects();
        }
        
        // Set up parallax
        if (config.parallaxEnabled) {
            setupParallax();
        }
        
        // Set up light effects
        if (config.lightEffectsEnabled) {
            setupLightEffects();
        }
        
        // Set up scroll snap points
        setupScrollSnapping();
        
        // Set up resize handler
        window.addEventListener('resize', debounce(handleResize, 200));
        
        logBackgroundInfo('Background animator initialized');
    }

    // Apply background styles to sections
    function applySectionBackgrounds() {
        config.sectionMap.forEach(sectionConfig => {
            const sections = document.querySelectorAll(sectionConfig.selector);
            
            sections.forEach(section => {
                // Apply background style based on type
                switch(sectionConfig.background) {
                    case 'dark-gradient':
                        section.classList.add('gradient-bg');
                        section.style.background = `linear-gradient(135deg, ${config.colorPalette.dark}, rgba(17, 24, 39, 0.95))`;
                        break;
                        
                    case 'light':
                        section.style.backgroundColor = config.colorPalette.light;
                        break;
                        
                    case 'light-pattern':
                        section.classList.add('pattern-bg');
                        section.classList.add('pattern-dots');
                        section.style.backgroundColor = config.colorPalette.light;
                        break;
                        
                    case 'light-dots':
                        section.classList.add('pattern-dots');
                        section.style.backgroundColor = config.colorPalette.light;
                        break;
                        
                    case 'white':
                        section.style.backgroundColor = config.colorPalette.white;
                        break;
                        
                    case 'white-gradient':
                        section.classList.add('gradient-bg');
                        section.style.background = `linear-gradient(to bottom, ${config.colorPalette.white}, ${config.colorPalette.light})`;
                        break;
                        
                    default:
                        // No background style applied
                        break;
                }
                
                // Add particle effects if specified
                if (sectionConfig.particles) {
                    section.classList.add('generate-particles');
                }
                
                // Make sure section has position relative for absolute positioning inside
                if (getComputedStyle(section).position === 'static') {
                    section.style.position = 'relative';
                }
            });
        });
    }

    // Add section dividers
    function addSectionDividers() {
        config.sectionMap.forEach(sectionConfig => {
            if (!sectionConfig.divider) return;
            
            const sections = document.querySelectorAll(sectionConfig.selector);
            
            sections.forEach(section => {
                const dividerStyle = sectionConfig.divider;
                const positions = sectionConfig.dividerPosition === 'both' ? 
                                 ['top', 'bottom'] : [sectionConfig.dividerPosition];
                
                // Get section and next section background colors for proper fill
                const sectionBgColor = getComputedStyle(section).backgroundColor;
                
                positions.forEach(position => {
                    // Determine adjacent section
                    let adjacentSection;
                    let fillColor;
                    
                    if (position === 'bottom') {
                        adjacentSection = section.nextElementSibling;
                    } else { // top
                        adjacentSection = section.previousElementSibling;
                    }
                    
                    if (adjacentSection) {
                        const adjacentBgColor = getComputedStyle(adjacentSection).backgroundColor;
                        
                        // Determine fill color
                        if (adjacentBgColor.includes('rgb(255, 255, 255)')) {
                            fillColor = 'white';
                        } else if (adjacentBgColor.includes('rgb(249, 250, 251)')) {
                            fillColor = 'light-gray';
                        } else if (adjacentBgColor.includes('rgb(31, 41, 55)')) {
                            fillColor = 'dark';
                        } else {
                            // Default to section's own background color
                            if (sectionBgColor.includes('rgb(255, 255, 255)')) {
                                fillColor = 'white';
                            } else if (sectionBgColor.includes('rgb(249, 250, 251)')) {
                                fillColor = 'light-gray';
                            } else {
                                fillColor = 'white'; // Safe default
                            }
                        }
                        
                        // Create divider
                        const dividerClassName = getDividerClassName(dividerStyle);
                        const divider = document.createElement('div');
                        divider.className = `${dividerClassName} ${position} ${fillColor}`;
                        divider.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                ${getDividerPath(dividerStyle)}
                            </svg>
                        `;
                        
                        section.appendChild(divider);
                    }
                });
            });
        });
    }

    // Get class name for divider type
    function getDividerClassName(dividerStyle) {
        switch(dividerStyle) {
            case 'wave': return 'wave-divider';
            case 'curve': return 'curve-divider';
            case 'angle': return 'angle-divider';
            case 'arrow': return 'arrow-divider';
            default: return 'wave-divider';
        }
    }

    // Get SVG path for divider type
    function getDividerPath(dividerStyle) {
        switch(dividerStyle) {
            case 'wave':
                return '<path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>';
            
            case 'curve':
                return '<path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" class="shape-fill"></path>';
            
            case 'angle':
                return '<path d="M1200 0L0 0 1200 120 1200 0z" class="shape-fill"></path>';
            
            case 'arrow':
                return '<path d="M649.97 0L550.03 0 599.91 54.12 649.97 0z" class="shape-fill"></path>';
            
            default:
                return '<path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>';
        }
    }

    // Set up scroll effects
    function setupScrollEffects() {
        window.addEventListener('scroll', throttle(() => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const sections = document.querySelectorAll('section');
            
            // Apply effects to sections
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top;
                const sectionHeight = rect.height;
                const sectionCenter = sectionTop + (sectionHeight / 2);
                
                // Calculate how far the section is through the viewport
                const progress = (windowHeight - sectionTop) / (windowHeight + sectionHeight);
                
                // Only apply effects when section is visible
                if (progress > 0 && progress < 1) {
                    // Background scaling effect for gradient backgrounds
                    if (section.classList.contains('gradient-bg')) {
                        const scale = 1 + ((progress - 0.5) * 0.1);
                        section.querySelectorAll('.gradient-bg::before').forEach(element => {
                            element.style.transform = `scale(${scale})`;
                        });
                    }
                    
                    // Parallax elements inside section
                    section.querySelectorAll('.parallax').forEach(element => {
                        const speed = element.getAttribute('data-parallax-speed') || config.parallaxStrength;
                        const yOffset = (windowHeight - sectionTop) * speed;
                        element.style.transform = `translateY(${yOffset}px)`;
                    });
                    
                    // Light beam rotation adjustment
                    section.querySelectorAll('.light-beam').forEach(beam => {
                        const rotationOffset = progress * 45 - 22.5; // -22.5 to +22.5 degrees
                        beam.style.transform = `rotate(${rotationOffset}deg)`;
                    });
                    
                    // Water ripple creation based on scroll
                    if (section.classList.contains('water-effect') && Math.random() < 0.05) {
                        createRippleEffect(section);
                    }
                }
            });
        }, 50));
    }

    // Set up parallax effect
    function setupParallax() {
        config.sectionMap.forEach(sectionConfig => {
            if (!sectionConfig.parallax) return;
            
            const sections = document.querySelectorAll(sectionConfig.selector);
            
            sections.forEach(section => {
                // Add parallax class to children that should move
                const elementsToParallax = section.querySelectorAll('h2, p, .btn, img');
                elementsToParallax.forEach((element, index) => {
                    element.classList.add('parallax');
                    
                    // Alternate parallax speeds for visual interest
                    const speed = 0.05 + (index % 3) * 0.05;
                    element.setAttribute('data-parallax-speed', speed);
                });
            });
        });
    }

    // Create ripple effect for water elements
    function createRippleEffect(section) {
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
        
        section.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode === section) {
                section.removeChild(ripple);
            }
        }, duration * 1000);
    }

    // Set up light effects
    function setupLightEffects() {
        const sections = document.querySelectorAll('.services-preview, .testimonials, .process, .latest-blog');
        
        sections.forEach(section => {
            // Add light beam
            const lightBeam = document.createElement('div');
            lightBeam.className = 'light-beam';
            section.appendChild(lightBeam);
            
            // Add reflections
            for (let i = 0; i < 2; i++) {
                const reflection = document.createElement('div');
                reflection.className = 'reflection';
                
                // Random position
                const x = 10 + Math.random() * 80;
                const y = 10 + Math.random() * 80;
                
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
                
                section.appendChild(reflection);
            }
        });
    }

    // Set up scroll snapping
    function setupScrollSnapping() {
        // Don't enable on mobile devices
        if (window.innerWidth < 768) return;
        
        // Apply scroll-snap to the body
        document.body.style.scrollSnapType = 'y proximity';
        
        // Apply scroll-snap-align to sections
        document.querySelectorAll('section').forEach(section => {
            section.style.scrollSnapAlign = 'start';
        });
    }

    // Handle resize
    function handleResize() {
        // Disable scroll snapping on mobile
        if (window.innerWidth < 768) {
            document.body.style.scrollSnapType = 'none';
        } else {
            document.body.style.scrollSnapType = 'y proximity';
        }
        
        // Adjust light effects positions
        document.querySelectorAll('.reflection').forEach(reflection => {
            // New random position
            const x = 10 + Math.random() * 80;
            const y = 10 + Math.random() * 80;
            
            reflection.style.left = `${x}%`;
            reflection.style.top = `${y}%`;
        });
    }

    // Utility: Debounce function
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

    // Utility: Throttle function
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', init);
})();
