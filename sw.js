// ==========================================
// SERVICE WORKER — Auto Update Version
// Network-First for HTML/CSS/JS
// Cache-First for Images
// Cache-First + Range support for Audio (nasheed.mp3)
// ==========================================

const CACHE_NAME = 'quran-ustad-auto-v13';
// Audio ka alag cache: app update par bhaari mp3 dobara download na ho
const AUDIO_CACHE = 'quran-ustad-audio-v1';

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

// ===== ACTIVATE: Purana cache delete karo =====
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME && k !== AUDIO_CACHE).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ===== AUDIO (nasheed): Range request support =====
// iOS/Safari ko 206 Partial Content chahiye, warna cache se audio play nahi hota
async function audioResponse(request) {
    const cache = await caches.open(AUDIO_CACHE);
    let res = await cache.match(request.url);
    if (!res) {
        try {
            // Poori file mangwao (Range header ke bagair) aur cache kar lo
            const full = await fetch(request.url);
            if (!full.ok) return full;
            await cache.put(request.url, full.clone());
            res = full;
        } catch (err) {
            return new Response('', { status: 404, statusText: 'Audio offline' });
        }
    }
    const range = request.headers.get('range');
    if (!range) return res;

    const buf = await res.arrayBuffer();
    const size = buf.byteLength;
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : size - 1;
    if (end >= size) end = size - 1;
    if (start > end) {
        return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    return new Response(buf.slice(start, end + 1), {
        status: 206,
        headers: {
            'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Content-Length': String(end - start + 1),
            'Accept-Ranges': 'bytes'
        }
    });
}

// ===== FETCH: Smart Strategy =====
self.addEventListener('fetch', (e) => {
    const request = e.request;
    const url = new URL(request.url);

    // Sirf same-origin handle karo
    if (url.origin !== location.origin) return;

    // 🎵 Audio = alag handler (range support)
    if (/\.(mp3|ogg|m4a|wav)$/i.test(url.pathname)) {
        e.respondWith(audioResponse(request));
        return;
    }

    const isHTML = request.headers.get('accept')?.includes('text/html');
    const isJS = url.pathname.endsWith('.js');
    const isCSS = url.pathname.endsWith('.css');
    const isJSON = url.pathname.endsWith('.json');

    // 🔥 HTML / JS / CSS / JSON = NETWORK FIRST
    // Matlab: Pehle internet se naya version lao, agar fail ho toh cache se do
    if (isHTML || isJS || isCSS || isJSON) {
        e.respondWith(
            // cache:'no-cache' = browser ka 10 minute wala purana HTTP cache bhi skip,
            // taake GitHub par upload karte hi naya version foran aaye
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
                    return caches.match(request, { ignoreSearch: true });
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
