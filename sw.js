// Service Worker per PWA Controllo Vasche
const CACHE_NAME = 'cantina-vasche-v1';
const urlsToCache = [
  './gestione_vasche_cantina.html',
  './manifest.json'
];

// Installazione Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache aperta');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('❌ Errore cache:', err))
  );
  self.skipWaiting();
});

// Attivazione Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminazione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercettazione richieste - Network First strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clona risposta per cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Fallback a cache se offline
        return caches.match(event.request);
      })
  );
});

// Push notifications (opzionale)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nuova notifica',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [200, 100, 200],
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Controllo Vasche', options)
  );
});

console.log('🚀 Service Worker caricato');
