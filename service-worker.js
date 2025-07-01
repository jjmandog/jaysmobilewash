const CACHE_NAME = 'jays-mobile-wash-v2';
// Critical assets for offline functionality and performance
// These resources are essential for UX, SEO, and Lighthouse scores
const urlsToCache = [
    '/',
    '/index.html',
    'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    // Critical loading screen image - Unsplash CDN for maximum reliability
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    // Fallback logo in case primary loading image fails
    'https://i.ibb.co/1Yk0MChV/F91-F533-E-C5-CF-4-D18-A295-7-B40-C430-B8-E6-1.png',
    // Critical JAY mode audio files for engagement features
    'BLP-Kosher-Jack-and-Jill.wav',
    'blp-kosher-jack-and-jill.wav'
];

// Install service worker with comprehensive error handling
// Critical for offline functionality and initial page load performance
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell and critical assets');
                
                // Cache resources individually to prevent single failure from breaking all caching
                // This ensures SPA loads even if some assets fail (critical for UX/SEO)
                const cachePromises = urlsToCache.map(url => {
                    return cache.add(url).catch(err => {
                        console.warn(`[SW] Failed to cache ${url}:`, err);
                        // Continue caching other resources even if this one fails
                        return Promise.resolve();
                    });
                });
                
                return Promise.allSettled(cachePromises);
            })
            .then(results => {
                const failedCaches = results.filter(result => result.status === 'rejected');
                if (failedCaches.length > 0) {
                    console.warn(`[SW] ${failedCaches.length} resources failed to cache`);
                }
                console.log('[SW] Service worker installation completed');
            })
            .catch(err => {
                console.error('[SW] Critical: Cache initialization failed:', err);
                // Don't prevent service worker installation even if caching fails
                return Promise.resolve();
            })
    );
});

// Enhanced fetch handler with comprehensive error handling
// Critical for offline functionality and preventing SPA freezing
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension and non-http(s) requests
    if (event.request.url.startsWith('chrome-extension://') || 
        !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if found
                if (cachedResponse) {
                    console.log(`[SW] Serving from cache: ${event.request.url}`);
                    return cachedResponse;
                }

                // Clone the request because it can only be used once
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        console.warn(`[SW] Invalid response for ${event.request.url}:`, response.status);
                        return response;
                    }

                    // Clone the response before caching
                    const responseToCache = response.clone();

                    // Cache successful responses asynchronously (don't block response)
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache).catch(cacheError => {
                                console.warn(`[SW] Failed to cache ${event.request.url}:`, cacheError);
                            });
                        })
                        .catch(cacheOpenError => {
                            console.warn('[SW] Failed to open cache for storing:', cacheOpenError);
                        });

                    return response;
                }).catch(fetchError => {
                    console.warn(`[SW] Fetch failed for ${event.request.url}:`, fetchError);
                    
                    // For critical assets, try to return any cached version even if stale
                    return caches.match(event.request).then(staleResponse => {
                        if (staleResponse) {
                            console.log(`[SW] Serving stale cache for failed fetch: ${event.request.url}`);
                            return staleResponse;
                        }
                        
                        // Return offline page if available for HTML requests
                        if (event.request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('/offline.html').then(offlinePage => {
                                return offlinePage || new Response('Service temporarily unavailable', {
                                    status: 503,
                                    statusText: 'Service Unavailable'
                                });
                            });
                        }
                        
                        // For other resources, let the error propagate but don't crash the app
                        throw fetchError;
                    });
                });
            })
            .catch(error => {
                console.error(`[SW] Critical error handling ${event.request.url}:`, error);
                // Return a basic error response to prevent app freezing
                return new Response('Resource unavailable', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Clean old caches with enhanced error handling
// Critical for preventing storage bloat and ensuring fresh content delivery
self.addEventListener('activate', event => {
    console.log('[SW] Service worker activating');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                const deletePromises = cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log(`[SW] Deleting old cache: ${name}`);
                        return caches.delete(name).catch(deleteError => {
                            console.warn(`[SW] Failed to delete cache ${name}:`, deleteError);
                            return Promise.resolve(); // Continue with other deletions
                        });
                    });
                
                return Promise.allSettled(deletePromises);
            })
            .then(results => {
                const failedDeletions = results.filter(result => result.status === 'rejected');
                if (failedDeletions.length > 0) {
                    console.warn(`[SW] ${failedDeletions.length} cache deletions failed`);
                }
                console.log('[SW] Service worker activated successfully');
                
                // Take control of all pages immediately for faster updates
                return self.clients.claim();
            })
            .catch(error => {
                console.error('[SW] Activation failed:', error);
                // Don't prevent activation even if cleanup fails
                return Promise.resolve();
            })
    );
});
