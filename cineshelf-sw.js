// CineShelf Service Worker - FORCE UPDATE VERSION
const CACHE_VERSION = 'v1.7.5.7'; // ⬆️ BUMPED VERSION TO FORCE UPDATE
const CACHE_NAME = `cineshelf-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `cineshelf-data-${CACHE_VERSION}`;

// Only cache essential shell files (no CSS/JS here)
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js'
];

// Install event - cache minimal shell
self.addEventListener('install', event => {
    console.log(`CineShelf: Service Worker ${CACHE_VERSION} installing`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(error => {
                console.log('CineShelf: Cache failed:', error);
                return Promise.resolve();
            })
    );
    self.skipWaiting(); // Force immediate activation
});

// Activate event - AGGRESSIVE cache deletion
self.addEventListener('activate', event => {
    console.log(`CineShelf: Service Worker ${CACHE_VERSION} activating - CLEARING ALL OLD CACHES`);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete ANY cache that doesn't match current version
                    if (cacheName.startsWith('cineshelf-') && 
                        cacheName !== CACHE_NAME && 
                        cacheName !== DATA_CACHE_NAME) {
                        console.log('CineShelf: 🗑️ DELETING OLD CACHE:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('CineShelf: ✅ All old caches deleted, claiming clients');
            return self.clients.claim(); // Take control immediately
        }).then(() => {
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: CACHE_VERSION,
                        message: 'CineShelf has been updated! Please refresh.'
                    });
                });
            });
        })
    );
});

// Fetch event - ALWAYS fetch fresh CSS/JS
self.addEventListener('fetch', event => {
    const requestURL = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // NEVER cache backup/restore PHP
    if (requestURL.pathname.includes('backup.php') || 
        requestURL.pathname.includes('restore.php')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // API calls: network first, then cache
    if (requestURL.hostname.includes('api.themoviedb.org') || 
        requestURL.hostname.includes('api.openai.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        caches.open(DATA_CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // ⚡ ALWAYS fetch fresh CSS/JS files - NEVER serve from cache first
    if (requestURL.pathname.endsWith('.css') || requestURL.pathname.endsWith('.js')) {
        event.respondWith(
            fetch(event.request, {
                cache: 'no-store' // Force network fetch, bypass HTTP cache
            })
                .then(response => {
                    // Cache the new version for offline fallback only
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => {
                    // Only use cache as last resort (offline)
                    console.log('CineShelf: Network failed, using cached version of', requestURL.pathname);
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Default: cache first for HTML and images
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request).then(fetchResponse => {
                    if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                        return fetchResponse;
                    }

                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));

                    return fetchResponse;
                });
            })
    );
});

// Message event listener for manual cache control
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        console.log('CineShelf: Received SKIP_WAITING, activating immediately');
        self.skipWaiting();
    }
    
    if (event.data?.type === 'FORCE_REFRESH') {
        console.log('CineShelf: Received FORCE_REFRESH, deleting ALL caches');
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('cineshelf-')) {
                            console.log('CineShelf: 🗑️ Force clearing cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }).then(() => {
                return self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'FORCE_REFRESH_COMPLETE',
                            message: 'Cache cleared, refreshing app...'
                        });
                    });
                });
            })
        );
    }
});

// Background sync
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('CineShelf: Background sync triggered');
    }
});

// Push notifications
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: './icon-180.png',
            badge: './icon-180.png',
            data: data.data
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

console.log(`🚀 CineShelf Service Worker ${CACHE_VERSION} loaded and ready`);