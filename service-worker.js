const CACHE_NAME = 'lotti-karotti-v1';
const urlsToCache = [
  './',
  './karten-ziehen.html',
  './index.html'
];

// Installation - Cache alle wichtigen Dateien
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Aktivierung - Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Lösche alten Cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Offline-First Strategie
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - gib gecachte Version zurück
        if (response) {
          return response;
        }
        
        // Nicht im Cache - hole vom Netzwerk
        return fetch(event.request).then(response => {
          // Prüfe ob gültige Response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone Response für Cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Fallback wenn offline und nicht im Cache
        return new Response('Offline - bitte versuche es später erneut');
      })
  );
});
