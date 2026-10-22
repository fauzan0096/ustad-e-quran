// ==========================================
// SERVICE WORKER — Auto Update Version
// Network-First for HTML/CSS/JS
// Cache-First for Images
// Audio (nasheed.mp3) = SW se bypass, browser seedha network se chalata hai
// ==========================================

// v20: naya login (pura naam + multi-user profiles) aur certificate naam fix — cache badalna zaroori hai
// NOTE: sirf Cache Storage badalta hai, users ki history (localStorage) ko koi asar nahi
const CACHE_NAME = 'quran-ustad-auto-v20';

const ASSETS = [
    './',
    './index.html',
    './courseData.js',
    './dua.html',
    './tajweed.html',
    './games.html',
    './games-audio.js',
    './asma.html',
    './manifest.json',
    './icon.png',
    './icon-192.png',
    './icon-maskable.png',
    './signature.png',
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
        caches.open(CACHE_NAME).then(cache =>
            // Ek file na mile to bhi baaki cache ho jayein (addAll sab fail kar deta hai)
            Promise.all(ASSETS.map(url =>
                cache.add(url).catch(err => console.warn('Cache skip:', url))
            ))
        )
    );
});

// ===== ACTIVATE: Purana cache delete karo (purana audio cache bhi) =====
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

    // 🎵 Audio = SW ko beech mein mat daalo (range requests browser khud sambhalta hai)
    if (/\.(mp3|ogg|m4a|wav)$/i.test(url.pathname) || request.headers.has('range')) return;

    const isHTML = request.headers.get('accept')?.includes('text/html');
    const isJS = url.pathname.endsWith('.js');
    const isCSS = url.pathname.endsWith('.css');
    const isJSON = url.pathname.endsWith('.json');

    // 🔥 HTML / JS / CSS / JSON = NETWORK FIRST
    // Matlab: Pehle internet se naya version lao, agar fail ho toh cache se do
    if (isHTML || isJS || isCSS || isJSON) {
        e.respondWith(
            // cache:'no-cache' = browser ka purana HTTP cache skip, GitHub par upload hote hi naya version aaye
            fetch(request, { cache: 'no-cache' })
                .then(response => {
                    // Naya version mila — cache mein update kar do
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => {
                    // Internet nahi hai — cache se do (?v=... wale link bhi mil jayein)
                    return caches.match(request, { ignoreSearch: true })
                        .then(hit => hit || (request.mode === 'navigate' ? caches.match('./index.html') : undefined));
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
