/*
 * AcademiaIQ - Production Service Worker
 * Caches app shell, static assets, and API responses for offline-first behavior.
 * Handles Render free tier cold starts gracefully.
 */

const CACHE_NAME = 'academiaiq-v1';
const STATIC_CACHE = 'academiaiq-static-v1';
const API_CACHE = 'academiaiq-api-v1';
const OFFLINE_URL = '/index.html';

// Core app shell assets to cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/academiaiq-logo.svg',
  '/favicon.ico',
];

// API patterns to cache (GET only, short TTL)
const CACHEABLE_API_PREFIXES = ['/api/groq', '/api/rss'];

// Max age for cached API responses (5 minutes)
const API_CACHE_TTL = 5 * 60 * 1000;

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches, claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== CACHE_NAME && k !== API_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML, cache-first for assets, stale-while-revalidate for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http/https schemes (chrome-extension, chrome-devtools, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Skip chrome-extension:// and other non-http schemes
  if (!url.protocol.startsWith('http:')) return;

  // Handle app shell HTML -> network first, fall back to cache
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).then((response) => {
        const cloned = response.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned));
        return response;
      }).catch(() => caches.match(OFFLINE_URL).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Cache static assets (JS, CSS, images, fonts)
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const cloned = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned));
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Cacheable API endpoints: stale-while-revalidate
  if (CACHEABLE_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) {
              const cloned = response.clone();
              // Store with timestamp
              const record = { body: cloned, ts: Date.now() };
              // Cache the response directly
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => null);

          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // Default: try network, fall back to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Listen for messages from the client (e.g., skipWaiting, cache bust)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_BUST') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});
