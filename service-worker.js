/**
 * 🚀 SMART SERVICE WORKER - ADVANCED PERFORMANCE
 * Jay's Mobile Wash - Revolutionary Caching System
 * Version: v7-performance-rocket
 */

const CACHE_NAME = 'jays-mobile-wash-v7-performance-rocket';
const CACHE_VERSION = '2025.11.10-performance';

// Advanced caching strategies
const CACHE_STRATEGIES = {
    // Critical resources - Cache first with network fallback
    critical: [
        '/',
        '/index.html',
        '/manifest.json',
        '/instant-performance-loader.js',
        '/advanced-performance.css'
    ],
    
    // Booking system - Network first for fresh data
    booking: [
        '/booking-system.js',
        '/booking-system.css',
        '/api/book-appointment'
    ],
    
    // Static assets - Cache first
    static: [
        '/main.js',
        '/scripts.js',
        '/jay-audio-enhanced.css',
        '/gucci-purse.mp3'
    ],
    
    // Images - Cache with smart compression
    images: [
        // Will be populated dynamically
    ],
    
    // Pages - Stale while revalidate
    pages: [
        '/orange-county-mobile-car-detailing.html',
        '/los-angeles-mobile-car-detailing.html',
        '/pricing.html',
        '/about.html',
        '/products.html',
        '/ceramic-coating.html',
        '/paint-correction.html',
        '/interior-detailing.html'
    ]
};

// Smart preloading list
const SMART_PRELOAD = [
    '/booking-system.js',
    '/orange-county-mobile-car-detailing.html',
    '/los-angeles-mobile-car-detailing.html'
];

// Performance monitoring
let performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    preloadSuccess: 0
};

/**
 * INSTALLATION - Smart Cache Warming
 */
self.addEventListener('install', (event) => {
    console.log('🚀 Installing Smart Service Worker v7-performance-rocket');
    
    event.waitUntil(
        Promise.all([
            // Cache critical resources immediately
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(CACHE_STRATEGIES.critical);
            }),
            
            // Smart preload in background
            smartPreloadAssets(),
            
            // Skip waiting for instant activation
            self.skipWaiting()
        ])
    );
});

/**
 * ACTIVATION - Intelligent Cache Cleanup
 */
self.addEventListener('activate', (event) => {
    console.log('⚡ Activating Smart Service Worker');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            cleanupOldCaches(),
            
            // Claim all clients immediately
            self.clients.claim(),
            
            // Initialize performance monitoring
            initPerformanceMonitoring()
        ])
    );
});

/**
 * FETCH - Advanced Request Handling
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-http requests
    if (!request.url.startsWith('http')) return;
    
    // Skip non-GET requests for caching
    if (request.method !== 'GET') return;
    
    // Skip chrome-extension requests
    if (request.url.startsWith('chrome-extension://')) return;
    
    // Apply smart caching strategy based on request type
    if (isCriticalRequest(request)) {
        event.respondWith(cacheFirstStrategy(request));
    } else if (isBookingRequest(request)) {
        event.respondWith(networkFirstStrategy(request));
    } else if (isImageRequest(request)) {
        event.respondWith(smartImageStrategy(request));
    } else if (isPageRequest(request)) {
        event.respondWith(staleWhileRevalidateStrategy(request));
    } else {
        event.respondWith(networkWithCacheFallback(request));
    }
});

/**
 * BACKGROUND SYNC - Smart Data Sync
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'booking-sync') {
        event.waitUntil(syncPendingBookings());
    } else if (event.tag === 'performance-sync') {
        event.waitUntil(syncPerformanceMetrics());
    }
});

/**
 * CACHING STRATEGIES
 */

// Cache First - For critical resources
async function cacheFirstStrategy(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        performanceMetrics.networkRequests++;
        
        // Cache successful responses
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        performanceMetrics.cacheMisses++;
        console.warn('Cache first strategy failed:', error);
        throw error;
    }
}

// Network First - For dynamic content
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        performanceMetrics.networkRequests++;
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        performanceMetrics.cacheMisses++;
        throw error;
    }
}

// Stale While Revalidate - For pages
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch in background to update cache
    const networkRequest = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        // Ignore network errors for background updates
    });
    
    if (cachedResponse) {
        performanceMetrics.cacheHits++;
        return cachedResponse;
    }
    
    // If no cache, wait for network
    performanceMetrics.networkRequests++;
    return networkRequest;
}

// Smart Image Strategy - Optimized for images
async function smartImageStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        performanceMetrics.cacheHits++;
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        performanceMetrics.networkRequests++;
        
        // Cache images with smart compression
        if (networkResponse.ok && isImageRequest(request)) {
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        performanceMetrics.cacheMisses++;
        // Return placeholder image if available
        const placeholder = await cache.match('/images/placeholder.jpg');
        return placeholder || new Response('', { status: 404 });
    }
}

// Network with Cache Fallback - Default strategy
async function networkWithCacheFallback(request) {
    try {
        const networkResponse = await fetch(request);
        performanceMetrics.networkRequests++;
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        performanceMetrics.cacheMisses++;
        throw error;
    }
}

/**
 * SMART UTILITIES
 */

// Smart asset preloading
async function smartPreloadAssets() {
    try {
        const cache = await caches.open(CACHE_NAME);
        
        for (const url of SMART_PRELOAD) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                    performanceMetrics.preloadSuccess++;
                }
            } catch (error) {
                console.warn('Preload failed for:', url, error);
            }
        }
        
        console.log(`⚡ Smart preloaded ${performanceMetrics.preloadSuccess} assets`);
    } catch (error) {
        console.warn('Smart preloading failed:', error);
    }
}

// Clean up old caches
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('jays-mobile-wash-') && name !== CACHE_NAME
    );
    
    await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );
    
    if (oldCaches.length > 0) {
        console.log('🧹 Cleaned up old caches:', oldCaches);
    }
}

// Request type detection
function isCriticalRequest(request) {
    return CACHE_STRATEGIES.critical.some(url => request.url.includes(url));
}

function isBookingRequest(request) {
    return request.url.includes('/booking') || 
           request.url.includes('/api/book') ||
           CACHE_STRATEGIES.booking.some(url => request.url.includes(url));
}

function isImageRequest(request) {
    return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

function isPageRequest(request) {
    return request.mode === 'navigate' || 
           CACHE_STRATEGIES.pages.some(url => request.url.includes(url));
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Reset metrics periodically
    setInterval(() => {
        if (performanceMetrics.cacheHits + performanceMetrics.cacheMisses > 0) {
            const hitRate = (performanceMetrics.cacheHits / 
                           (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100).toFixed(1);
            
            console.log(`📊 Cache performance: ${hitRate}% hit rate (${performanceMetrics.cacheHits} hits, ${performanceMetrics.cacheMisses} misses)`);
        }
        
        // Reset for next period
        performanceMetrics = {
            cacheHits: 0,
            cacheMisses: 0,
            networkRequests: 0,
            preloadSuccess: 0
        };
    }, 300000); // Every 5 minutes
}

// Sync pending bookings
async function syncPendingBookings() {
    try {
        // Get pending bookings from IndexedDB (if implemented)
        console.log('🔄 Syncing pending bookings...');
        
        // This would sync with your booking API
        // Implementation depends on your offline booking storage
        
    } catch (error) {
        console.warn('Booking sync failed:', error);
    }
}

// Sync performance metrics
async function syncPerformanceMetrics() {
    try {
        // Send performance data to analytics (optional)
        console.log('📈 Syncing performance metrics...');
        
        // This could send data to Google Analytics or your own metrics endpoint
        
    } catch (error) {
        console.warn('Performance sync failed:', error);
    }
}

console.log('🚀 Smart Service Worker v7-performance-rocket loaded successfully!');
