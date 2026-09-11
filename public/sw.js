const CACHE_NAME = 'galileo-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

// ---- Install: cache the app shell ----
// Use allSettled + per-URL fetch so a single hiccup (e.g. logo) does not
// fail the whole install. Anything not cached here is filled in at runtime.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    Promise.allSettled(
      STATIC_ASSETS.map(async (asset) => {
        try {
          const res = await fetch(asset);
          if (res.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(asset, res);
          }
        } catch {
          // Network hiccup on install: runtime fallback will hydrate the cache.
        }
      })
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Returns the cached app shell, or a valid 503 Response as a last resort.
// Every respondWith() below must resolve to a real Response object -
// resolving to `undefined` throws "Failed to convert value to 'Response'".
async function offlineFallback() {
  const cache = await caches.open(CACHE_NAME);
  const shell = await cache.match('/index.html');
  return shell || new Response('Estás sin conexión', { status: 503, statusText: 'Service Unavailable' });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only serve GET for the app's own origin. Cross-origin requests
  // (Appwrite API, Google Fonts, images) are left to the browser's normal
  // network stack - never intercepted, never cached, never rejected here.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to the cached app shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        } catch {
          return offlineFallback();
        }
      })()
    );
    return;
  }

  // Same-origin static assets (JS/CSS/images): cache-first, then network with
  // runtime cache hydration, then the offline shell as a final fallback.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      } catch {
        return offlineFallback();
      }
    })()
  );
});
