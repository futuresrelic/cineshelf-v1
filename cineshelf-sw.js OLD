// CineShelf Service Worker - Reduced CSS/JS Caching
const CACHE_VERSION = 'v1.6.6'; // Bump this to force shell updates
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
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log(`CineShelf: Service Worker ${CACHE_VERSION} activating`);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName.startsWith('cineshelf-') && cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        console.log('CineShelf: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
          .then(() => {
              return self.clients.matchAll().then(clients => {
                  clients.forEach(client => {
                      client.postMessage({
                          type: 'SW_UPDATED',
                          version: CACHE_VERSION,
                          message: 'CineShelf has been updated!'
                      });
                  });
              });
          })
    );
});

// Fetch event - skip caching for .css and .js
self.addEventListener('fetch', event => {
    const requestURL = new URL(event.request.url);

    if (event.request.method !== 'GET') return;

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

    // Always bypass cache for CSS/JS
    if (requestURL.pathname.endsWith('.css') || requestURL.pathname.endsWith('.js')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Optionally cache updated version
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request)) // fallback if offline
        );
        return;
    }

    // Default: cache first, then network
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

// Message event listener
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data?.type === 'FORCE_REFRESH') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('cineshelf-')) {
                            console.log('CineShelf: Force clearing cache:', cacheName);
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

console.log(`CineShelf Service Worker ${CACHE_VERSION} loaded`);
