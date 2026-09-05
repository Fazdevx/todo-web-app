// =============================================================
//  sw.js  -  Service Worker PWA para Vite/React (Galileo Agenda)
// =============================================================
const CACHE_NAME = 'galileo-agenda-v1';

// Solo cacheamos el shell mínimo de la app
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ---- Install: cachear el shell ----
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
});

// ---- Activate: limpiar caches viejos ----
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ---- Fetch: estrategia por tipo de recurso ----
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // 1) Peticiones a Appwrite → siempre red, nunca cache
  if (url.host.includes('appwrite.io')) {
    return; // dejar pasar sin interceptar
  }

  // 2) Peticiones de navegación (HTML) → Network-first con fallback a index.html
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // 3) Assets estáticos de Vite (/assets/*.js, /assets/*.css) → Cache-first
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((resp) => {
          if (resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return resp;
        });
      })
    );
    return;
  }

  // 4) Todo lo demás → red directamente
});
