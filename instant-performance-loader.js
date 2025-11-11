/**
 * 🚀 INSTANT PERFORMANCE LOADER
 * Revolutionary preloading system for Jay's Mobile Wash
 * Makes everything feel INSTANT while preserving beautiful design
 */

class InstantPerformanceLoader {
    constructor() {
        this.preloadedContent = new Map();
        this.criticalAssets = new Set();
        this.init();
    }

    init() {
        this.setupHoverPreloading();
        this.setupSmartImageLoading();
        this.setupProgressiveBooking();
        this.setupCriticalAssetPreloading();
        this.setupPerformanceMonitoring();
        
        console.log('🚀 Instant Performance Loader initialized!');
    }

    /**
     * INSTANT HOVER PRELOADING
     * Preloads content when user hovers over interactive elements
     */
    setupHoverPreloading() {
        let hoverTimeout;
        
        document.addEventListener('mouseover', (e) => {
            clearTimeout(hoverTimeout);
            
            hoverTimeout = setTimeout(() => {
                // Preload booking modal on hover
                if (e.target.closest('.book-button, .floating-book-button, button[onclick*="openBookingModal"]')) {
                    this.preloadBookingModal();
                }
                
                // Preload pricing page content
                if (e.target.closest('a[href*="pricing"], .pricing-nav')) {
                    this.preloadPricingContent();
                }
                
                // Preload service pages
                if (e.target.closest('a[href*="ceramic"], a[href*="paint"], a[href*="interior"]')) {
                    this.preloadServiceContent(e.target.href);
                }
                
                // Preload gallery images
                if (e.target.closest('.gallery-item, .portfolio-image')) {
                    this.preloadGalleryImages();
                }
            }, 100); // 100ms delay prevents accidental preloads
        });
    }

    /**
     * SMART BOOKING MODAL PRELOADING
     */
    async preloadBookingModal() {
        if (this.preloadedContent.has('booking-modal')) return;
        
        try {
            // Preload booking system assets
            const bookingAssets = [
                '/booking-system.js',
                '/booking-system.css'
            ];
            
            await Promise.all(bookingAssets.map(asset => this.preloadAsset(asset)));
            
            // Preload booking modal HTML structure if not already loaded
            if (!document.getElementById('booking-modal')) {
                const bookingScript = document.querySelector('script[src*="booking-system"]');
                if (bookingScript) {
                    // Trigger modal creation without showing it
                    if (window.createBookingModal) {
                        window.createBookingModal();
                    }
                }
            }
            
            this.preloadedContent.set('booking-modal', true);
            console.log('⚡ Booking modal preloaded successfully');
        } catch (error) {
            console.warn('Booking modal preload failed:', error);
        }
    }

    /**
     * SMART IMAGE OPTIMIZATION & LOADING
     */
    setupSmartImageLoading() {
        // Intersection Observer for lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImageOptimized(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px' // Start loading 50px before image is visible
        });

        // Observe all images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Convert existing images to optimized lazy loading
        document.querySelectorAll('img:not([data-src])').forEach(img => {
            if (!img.complete) {
                this.optimizeImageLoading(img);
            }
        });
    }

    /**
     * PROGRESSIVE BOOKING FORM LOADING
     */
    setupProgressiveBooking() {
        // Preload booking steps progressively
        document.addEventListener('click', (e) => {
            if (e.target.closest('#booking-modal')) {
                const currentStep = document.querySelector('.step-indicator.active');
                if (currentStep) {
                    const stepNumber = parseInt(currentStep.dataset.step || '1');
                    this.preloadBookingStep(stepNumber + 1);
                }
            }
        });
    }

    /**
     * CRITICAL ASSET PRELOADING
     */
    setupCriticalAssetPreloading() {
        const criticalAssets = [
            '/main.js',
            '/jay-audio-enhanced.css',
            '/performance-optimizations.css',
            '/gucci-purse.mp3' // For Jay mode
        ];

        // Preload critical assets with high priority
        criticalAssets.forEach(asset => {
            this.preloadAsset(asset, 'high');
        });
    }

    /**
     * PERFORMANCE MONITORING & OPTIMIZATION
     */
    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            this.monitorWebVitals();
        }

        // Smart cache warming
        this.warmupCache();

        // Optimize scroll performance
        this.optimizeScrollPerformance();
    }

    /**
     * ASSET PRELOADING UTILITIES
     */
    async preloadAsset(url, priority = 'low') {
        if (this.preloadedContent.has(url)) return;

        try {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.setAttribute('importance', priority);

            if (url.endsWith('.css')) {
                link.as = 'style';
            } else if (url.endsWith('.js')) {
                link.as = 'script';
            } else if (url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                link.as = 'image';
            } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
                link.as = 'audio';
            } else {
                link.as = 'fetch';
                link.crossOrigin = 'anonymous';
            }

            document.head.appendChild(link);
            this.preloadedContent.set(url, true);

            return new Promise((resolve) => {
                link.onload = resolve;
                link.onerror = resolve; // Don't fail the whole process
            });
        } catch (error) {
            console.warn(`Failed to preload ${url}:`, error);
        }
    }

    /**
     * OPTIMIZED IMAGE LOADING
     */
    loadImageOptimized(img) {
        const src = img.dataset.src || img.src;
        
        // Create optimized image with blur-to-sharp transition
        const tempImg = new Image();
        
        tempImg.onload = () => {
            // Apply smooth transition
            img.style.filter = 'blur(5px)';
            img.style.transition = 'filter 0.3s ease';
            
            img.src = tempImg.src;
            
            // Remove blur once loaded
            setTimeout(() => {
                img.style.filter = 'none';
            }, 50);
        };
        
        // Check for WebP support and use optimized format
        if (this.supportsWebP()) {
            tempImg.src = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        } else {
            tempImg.src = src;
        }
    }

    /**
     * PROGRESSIVE BOOKING STEP PRELOADING
     */
    preloadBookingStep(stepNumber) {
        if (stepNumber > 3 || this.preloadedContent.has(`step-${stepNumber}`)) return;

        // Preload next step content
        setTimeout(() => {
            if (window.getStepHTML && typeof window.getStepHTML === 'function') {
                try {
                    const stepContent = window.getStepHTML(stepNumber);
                    if (stepContent) {
                        // Parse and preload any assets in the step
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = stepContent;
                        
                        tempDiv.querySelectorAll('img, script, link').forEach(asset => {
                            const src = asset.src || asset.href;
                            if (src) this.preloadAsset(src);
                        });
                    }
                } catch (error) {
                    console.warn('Step preload failed:', error);
                }
            }
            
            this.preloadedContent.set(`step-${stepNumber}`, true);
        }, 100);
    }

    /**
     * CACHE WARMING
     */
    warmupCache() {
        // Warm up frequently accessed content
        const warmupUrls = [
            '/pricing',
            '/about', 
            '/products',
            '/ceramic-coating',
            '/paint-correction'
        ];

        setTimeout(() => {
            warmupUrls.forEach(url => {
                fetch(url, { method: 'HEAD' }).catch(() => {
                    // Ignore errors, this is just warming
                });
            });
        }, 2000); // Warm up after initial load
    }

    /**
     * SCROLL PERFORMANCE OPTIMIZATION
     */
    optimizeScrollPerformance() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            // Use passive listener for better performance
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                // Trigger progressive loading based on scroll position
                const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
                
                if (scrollPercent > 0.3) {
                    this.preloadBookingModal();
                }
                
                if (scrollPercent > 0.7) {
                    this.preloadPricingContent();
                }
            }, 100);
        }, { passive: true });
    }

    /**
     * WEBP SUPPORT DETECTION
     */
    supportsWebP() {
        if (this._webpSupport !== undefined) return this._webpSupport;
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        
        this._webpSupport = canvas.toDataURL('image/webp', 0.1).indexOf('data:image/webp') === 0;
        return this._webpSupport;
    }

    /**
     * PRICING CONTENT PRELOADING
     */
    async preloadPricingContent() {
        if (this.preloadedContent.has('pricing-content')) return;
        
        try {
            await this.preloadAsset('/pricing');
            this.preloadedContent.set('pricing-content', true);
            console.log('⚡ Pricing content preloaded');
        } catch (error) {
            console.warn('Pricing preload failed:', error);
        }
    }

    /**
     * GALLERY IMAGES PRELOADING
     */
    preloadGalleryImages() {
        if (this.preloadedContent.has('gallery-images')) return;
        
        // Preload next few gallery images
        const galleryImages = document.querySelectorAll('.gallery-item img, .portfolio-image');
        
        Array.from(galleryImages).slice(0, 5).forEach(img => {
            this.preloadAsset(img.src || img.dataset.src);
        });
        
        this.preloadedContent.set('gallery-images', true);
    }
}

// Initialize the performance loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new InstantPerformanceLoader();
    });
} else {
    new InstantPerformanceLoader();
}

// Export for global access
window.InstantPerformanceLoader = InstantPerformanceLoader;