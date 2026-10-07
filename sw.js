// Service Worker Oficial — Farmácia Popular Vittalis PWA
const CACHE_NAME = 'vittalis-cache-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './manifest-admin.json',
  './icon-192.png',
  './icon-512.png',
  './icon-admin-192.png',
  './icon-admin-512.png',
  './apple-touch-icon.png',
  './apple-touch-icon-admin.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não armazena em cache requisições externas para o Google Sheets e Google Apps Script
  if (url.hostname.includes('google.com') || url.hostname.includes('googleapis.com') || event.request.method !== 'GET') {
    return;
  }

  // Estratégia Stale-While-Revalidate para velocidade máxima
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
