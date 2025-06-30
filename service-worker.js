// Jay's Mobile Wash - Service Worker
// Version: 1.0.0
// Last Updated: 2025-06-30

const CACHE_NAME = 'jays-mobile-wash-cache-v1';
const RUNTIME_CACHE = 'jays-mobile-wash-runtime';

// Resources to pre-cache
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/styles.css',
  '/jay-audio.js',
  '/favicon.ico',
  '/manifest.json',
  '/images/logo.png',
  '/images/hero-bg.webp',
  '/images/cta-bg.webp',
  '/images/map.webp',
  '/fonts/montserrat-v25-latin-regular.woff2',
  '/fonts/montserrat-v25-latin-500.woff2',
  '/fonts/montserrat-v25-latin-600.woff2',
  '/fonts/montserrat-v25-latin-700.woff2'
];

// Install event - pre-cache critical assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .catch(error => {
        console.error('[Service Worker] Pre-cache error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Take control of all clients immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('jays-mobile-wash-') && 
                 cacheName !== CACHE_NAME &&
                 cacheName !== RUNTIME_CACHE;
        }).map(cacheName => {
          console.log('[Service Worker] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache, then network with cache update
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Skip analytics and third-party requests
  if (
    event.request.url.includes('google-analytics.com') ||
    event.request.url.includes('googletagmanager.com') ||
    event.request.url.includes('fb.com') ||
    event.request.url.includes('facebook.com') ||
    event.request.url.includes('analytics')
  ) return;
  
  // For HTML requests - network-first strategy with offline fallback
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const clonedResponse = response.clone();
          
          caches.open(RUNTIME_CACHE)
            .then(cache => {
              cache.put(event.request, clonedResponse);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If no cached HTML, return offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // For images - cache-first strategy
  if (event.request.url.match(/\.(jpe?g|png|gif|svg|webp|bmp|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and update cache in background
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                caches.open(RUNTIME_CACHE)
                  .then(cache => {
                    cache.put(event.request, networkResponse.clone());
                  });
                return networkResponse;
              })
              .catch(() => { /* Ignore network errors */ });
            
            // Fetch in background, but return cached response immediately
            fetchPromise.catch(() => console.log('[Service Worker] Background fetch failed'));
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then(response => {
              // Cache a copy of the response
              const clonedResponse = response.clone();
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  cache.put(event.request, clonedResponse);
                });
              
              return response;
            });
        })
    );
    return;
  }
  
  // For other requests - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response immediately if available
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update cache with fresh response
            caches.open(RUNTIME_CACHE)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            return networkResponse;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch error:', error);
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});

// Push notification event handler
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New notification from Jay\'s Mobile Wash',
    icon: '/images/logo-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Jay\'s Mobile Wash',
      options
    )
  );
});

// Notification click event handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const url = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(clientList => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for form submissions when offline
self.addEventListener('sync', event => {
  if (event.tag === 'submit-form') {
    event.waitUntil(
      // Get all pending form submissions from IndexedDB
      idbKeyval.get('pendingForms')
        .then(forms => {
          if (!forms || !forms.length) return;
          
          // Process each pending form
          return Promise.all(forms.map(form => {
            return fetch(form.url, {
              method: 'POST',
              body: JSON.stringify(form.data),
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => {
              if (response.ok) {
                // On success, remove from pending list
                return idbKeyval.get('pendingForms')
                  .then(currentForms => {
                    const newForms = currentForms.filter(f => 
                      f.id !== form.id
                    );
                    return idbKeyval.set('pendingForms', newForms);
                  });
              }
              throw new Error('Form submission failed');
            });
          }));
        })
        .catch(err => {
          console.error('[Service Worker] Sync error:', err);
          // Will retry on next sync event
        })
    );
  }
});

// Service worker messaging
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] Service worker registered - v20250630033605');
