// ==========================================
// SERVICE WORKER — Auto Update Version
// Network-First for HTML/CSS/JS
// Cache-First for Images
// ==========================================

const CACHE_NAME = 'quran-ustad-auto-v6';

const ASSETS = [
    './',
    './index.html',
    './courseData.js',
    './dua.html',
    './tajweed.html',
    './games.html',
    './asma.html',
    './manifest.json',
    './icon.png',
    './icon-192.png',
    './install.js',
    './speech.js',
    './ui.js',
    './theme.css',
    './progress.js',
    './qari.js'
];

// ===== INSTALL: Naya SW foran ready ho =====
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Purane SW ko wait mat karo, foran replace karo
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// ===== ACTIVATE: Purana cache delete karo =====
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ===== FETCH: Smart Strategy =====
self.addEventListener('fetch', (e) => {
    const request = e.request;
    const url = new URL(request.url);

    // Sirf same-origin handle karo
    if (url.origin !== location.origin) return;

    const isHTML = request.headers.get('accept')?.includes('text/html');
    const isJS = url.pathname.endsWith('.js');
    const isCSS = url.pathname.endsWith('.css');
    const isJSON = url.pathname.endsWith('.json');

    // 🔥 HTML / JS / CSS / JSON = NETWORK FIRST
    // Matlab: Pehle internet se naya version lao, agar fail ho toh cache se do
    if (isHTML || isJS || isCSS || isJSON) {
        e.respondWith(
            fetch(request)
                .then(response => {
                    // Naya version mila — cache mein update kar do
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => {
                    // Internet nahi hai — cache se do
                    return caches.match(request);
                })
        );
        return;
    }

    // 🖼️ Images / Fonts / Icons = CACHE FIRST
    // Matlab: Pehle cache se do (fast), agar nahi mila toh internet se lao
    e.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            }).catch(() => cached);
        })
    );
});
