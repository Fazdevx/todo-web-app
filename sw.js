// =============================================================
//  sw.js  -  Service worker basico (cache + offline)
// =============================================================
const CACHE = 'agenda-v3';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/styles.css',
    './js/config.js',
    './js/api.js',
    './js/auth.js',
    './js/app.js',
    './js/screens-auth.js',
    './js/screens-agenda.js',
    './js/screens-editor.js',
    './js/screens-calendar.js',
    './js/screens-settings.js',
    './icons/icon.svg',
    'https://cdn.jsdelivr.net/npm/appwrite@13.0.0',
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    // Network-first para Appwrite, JS y CSS (siempre datos frescos)
    if (url.host.includes('appwrite') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
        return;
    }
    // Cache-first para otros assets estaticos
    e.respondWith(
        caches.match(e.request).then(cached =>
            cached || fetch(e.request).then(resp => {
                if (e.request.method === 'GET' && resp.ok) {
                    const copy = resp.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy));
                }
                return resp;
            })
        )
    );
});
