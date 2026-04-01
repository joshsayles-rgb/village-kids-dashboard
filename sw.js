/**
 * Village Kids Dashboard — Service Worker
 * Strategy:
 *   - App shell (HTML, fonts, icons): cache-first, update in background
 *   - Notion data (Worker API calls): network-first, fall back to cache
 *   - Everything else: network-first
 */

const CACHE_VERSION  = 'vk-v8';
const SHELL_CACHE    = CACHE_VERSION + '-shell';
const DATA_CACHE     = CACHE_VERSION + '-data';

// Assets to pre-cache on install (the app shell)
const SHELL_ASSETS = [
  '/village-kids-dashboard/',
  '/village-kids-dashboard/index.html',
  '/village-kids-dashboard/admin.html',
  '/village-kids-dashboard/icon-192.png',
  '/village-kids-dashboard/icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap',
];

// ── INSTALL: pre-cache shell assets ────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean up old caches ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('vk-') && k !== SHELL_CACHE && k !== DATA_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: routing strategy ─────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Notion / Worker API calls → network-first, cache fallback
  if (url.hostname.includes('workers.dev') || url.hostname.includes('notion.so')) {
    event.respondWith(networkFirst(event.request, DATA_CACHE));
    return;
  }

  // Google Fonts → cache-first (they rarely change)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(event.request, SHELL_CACHE));
    return;
  }

  // App shell → cache-first, update in background
  if (url.pathname.startsWith('/village-kids-dashboard/')) {
    event.respondWith(staleWhileRevalidate(event.request, SHELL_CACHE));
    return;
  }

  // Everything else → network only
  event.respondWith(fetch(event.request));
});

// ── STRATEGIES ──────────────────────────────────────────────
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => {});
  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise;
}
