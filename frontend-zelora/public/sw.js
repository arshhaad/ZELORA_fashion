// ZELORA Luxury Fashion - Progressive Web App Service Worker
const CACHE_NAME = 'zelora-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon-192.png',
  '/favicon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon.svg'
];

// Install: Cache offline essentials
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up previous caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for dynamic navigation & API, fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strictly NEVER intercept or cache backend API calls, Django admin, or AI endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/django-admin/') ||
    url.pathname.startsWith('/media/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // For HTML navigation requests: Network-first with offline fallback to /index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // For static assets (images, fonts, stylesheets, scripts): Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Silent fallback for non-critical assets
        return null;
      });
    })
  );
});
