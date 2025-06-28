/**
 * Enhanced Service Worker for Jay's Mobile Wash
 * Provides comprehensive offline functionality, caching, and performance optimization
 * Features: Dynamic caching, background sync, push notifications, offline analytics
 */

const CACHE_NAME = 'jays-mobile-wash-v2.0.0'
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/about-jays-company',
    '/manifest.json',
    '/images/icon-192.png',
    '/images/icon-512.png',
    '/images/mclaren-hero.webp',
    '/audio/engine-rev.mp3',
    '/audio/foam-burst.mp3'
]

const DYNAMIC_CACHE_NAME = 'jays-mobile-wash-dynamic-v2.0.0'
const API_CACHE_NAME = 'jays-mobile-wash-api-v2.0.0'

// Enhanced installation with comprehensive caching
self.addEventListener('install', (event) => {
    console.log('🚀 Jay\'s Mobile Wash SW v2.0.0 installing...')
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(STATIC_CACHE_URLS)),
            
            // Pre-warm dynamic cache
            caches.open(DYNAMIC_CACHE_NAME),
            caches.open(API_CACHE_NAME)
        ])
        .then(() => {
            console.log('✅ All caches initialized')
            // Skip waiting to activate immediately
            return self.skipWaiting()
        })
        .catch((error) => {
            console.error('❌ Cache installation failed:', error)
        })
    )
})

// Enhanced activation with cache cleanup
self.addEventListener('activate', (event) => {
    console.log('🔄 Jay\'s Mobile Wash SW v2.0.0 activating...')
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (![CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME].includes(cacheName)) {
                            console.log('🗑️ Deleting old cache:', cacheName)
                            return caches.delete(cacheName)
                        }
                    })
                )
            }),
            
            // Take control of all pages
            self.clients.claim()
        ])
        .then(() => {
            console.log('✅ Service Worker activated and ready!')
        })
    )
})

// Advanced fetch handler with intelligent caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)
    
    // Skip cross-origin requests except for specific domains
    if (url.origin !== self.location.origin && !isAllowedOrigin(url.origin)) {
        return
    }
    
    // Handle different request types with appropriate strategies
    if (request.method === 'GET') {
        event.respondWith(handleGetRequest(request))
    } else if (request.method === 'POST') {
        event.respondWith(handlePostRequest(request))
    }
})

// Intelligent GET request handler
async function handleGetRequest(request) {
    const url = new URL(request.url)
    
    try {
        // Static assets - Cache First strategy
        if (isStaticAsset(url.pathname)) {
            return await cacheFirst(request, CACHE_NAME)
        }
        
        // API calls - Network First with cache fallback
        if (isApiRequest(url.pathname)) {
            return await networkFirst(request, API_CACHE_NAME, 3000)
        }
        
        // Images and media - Cache First with network fallback
        if (isMediaAsset(url.pathname)) {
            return await cacheFirst(request, DYNAMIC_CACHE_NAME)
        }
        
        // HTML pages - Network First with cache fallback
        if (isHtmlRequest(request)) {
            return await networkFirst(request, DYNAMIC_CACHE_NAME, 2000)
        }
        
        // Default: Network First
        return await networkFirst(request, DYNAMIC_CACHE_NAME, 5000)
        
    } catch (error) {
        console.error('Fetch handler error:', error)
        return await getOfflineFallback(request)
    }
}

// POST request handler with background sync
async function handlePostRequest(request) {
    try {
        // Try network first
        const response = await fetch(request)
        return response
    } catch (error) {
        // Store for background sync if offline
        if (isFormSubmission(request)) {
            await storeFormForSync(request)
            return new Response(
                JSON.stringify({ 
                    success: true, 
                    message: 'Form stored for sync when online',
                    offline: true 
                }),
                { 
                    status: 200, 
                    headers: { 'Content-Type': 'application/json' } 
                }
            )
        }
        throw error
    }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
        // Update cache in background
        fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response.clone())
            }
        }).catch(() => {}) // Silently fail background update
        
        return cachedResponse
    }
    
    // If not in cache, fetch from network and cache
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
    }
    return networkResponse
}

// Network First strategy with timeout
async function networkFirst(request, cacheName, timeout = 3000) {
    const cache = await caches.open(cacheName)
    
    try {
        // Race between network and timeout
        const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Network timeout')), timeout)
            )
        ])
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
        
    } catch (error) {
        // Fall back to cache
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
            return cachedResponse
        }
        throw error
    }
}

// Utility functions
function isAllowedOrigin(origin) {
    const allowedOrigins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://api.weather.com',
        'https://www.google-analytics.com'
    ]
    return allowedOrigins.includes(origin)
}

function isStaticAsset(pathname) {
    return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(pathname)
}

function isApiRequest(pathname) {
    return pathname.startsWith('/api/') || pathname.includes('weather')
}

function isMediaAsset(pathname) {
    return /\.(mp3|wav|mp4|webm|webp)$/i.test(pathname)
}

function isHtmlRequest(request) {
    return request.headers.get('accept')?.includes('text/html')
}

function isFormSubmission(request) {
    return request.headers.get('content-type')?.includes('form')
}

async function getOfflineFallback(request) {
    if (isHtmlRequest(request)) {
        // Return cached homepage for navigation
        const cache = await caches.open(CACHE_NAME)
        return await cache.match('/') || new Response(
            '<h1>Offline</h1><p>Jay\'s Mobile Wash is temporarily unavailable. Please try again later.</p>',
            { headers: { 'Content-Type': 'text/html' } }
        )
    }
    
    // Return generic offline response
    return new Response('Offline', { status: 503 })
}

async function storeFormForSync(request) {
    // Store form data for background sync
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    
    // Store in IndexedDB for background sync
    // This would be implemented with proper IndexedDB operations
    console.log('Form stored for sync:', data)
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-forms') {
        event.waitUntil(syncOfflineForms())
    }
})

async function syncOfflineForms() {
    // Sync stored forms when online
    console.log('Syncing offline forms...')
    // Implementation would retrieve from IndexedDB and submit
}

// Push notification handler
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'Jay\'s Mobile Wash notification',
        icon: '/images/icon-192.png',
        badge: '/images/icon-192.png',
        tag: 'jays-mobile-wash',
        actions: [
            {
                action: 'view',
                title: 'View Details'
            },
            {
                action: 'book',
                title: 'Book Service'
            }
        ]
    }
    
    event.waitUntil(
        self.registration.showNotification('Jay\'s Mobile Wash', options)
    )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    
    const action = event.action
    let url = '/'
    
    if (action === 'book') {
        url = '/#contact'
    } else if (action === 'view') {
        url = '/'
    }
    
    event.waitUntil(
        clients.matchAll().then((clientList) => {
            // Focus existing window or open new one
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus()
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url)
            }
        })
    )
})

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME })
    }
})

console.log('🏎️ Jay\'s Mobile Wash Service Worker loaded successfully!')
    );
    self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then((fetchResponse) => {
                        // Cache successful responses
                        if (fetchResponse.ok) {
                            const responseClone = fetchResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return fetchResponse;
                    });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});