// ==========================================
// SERVICE WORKER — Auto Update Version
// Network-First for HTML/CSS/JS
// Cache-First for Images
// Audio (azan + nasheed) = alag audio cache se (Range support), baaki audio browser seedha network se
// ==========================================

// v46: themes.js (kharidi theme har page par + 3 naye special themes), Bazm-e-Fahm games.html ke andar
// v45: backup.js (Backup/Restore), offline audio (azan + nasheed, range support), offline Google Fonts, privacy.html cache
// v44: Bazm-e-Fahm game games page mein jora (bazm.html)
// v43: app ka naam badal kar Fahm-ul-Quran (ÙÙÙ Ø§ÙÙØ±Ø¢Ù)
// v42: certificate — jhoota 'Sanad ki jaanch' hata, 'Completion Certificate' naam, disclaimer
// v41: onboarding.js (welcome slides, sirf pehli baar); games se Shab-e-Barat/Miraj ke sawal hataye
// v40: ui.js + install.js + progress.js ek file (app.js) mein; QSSFX sounds.js mein
// v39: speech.js + qari.js + games-audio.js ek file (sounds.js) mein
// v38: Roz marra ki 26 duaein (Hisnul Muslim), namaz.js dua aur asma pages mein
// v37: Tajweed ke 38 qawaid (18 naye), iPhone status bar ka dhundhla hissa theek
// v36: ayat Day 1-50 (lafz 1-500) poore
// v35: ayat Day 1-30 + 41-57 (dono versions mila diye)
// v34: Naya dashboard (maqsad > shortcuts > namaz/yaad > ayat > safar > sabaq), nasheed har game mein, Silver/Gold exam mein anbiya ke naam nahi
// v33: Namaz panel back-gesture, azan calendar (1 din se 1 saal), chhote namaz/yaad cards
// v32: Android app ke liye namaz.js bridge (azan app band hone par bhi)
// v31: Mahine ka hisaab (5 boxes, 2 mahine ka data), azan ki awaaz (3 mp3)
// v30: Shop mein 16 stickers (hamesha ke liye, naam ke baazu mein), theme dobara lagana, namaz.js (azan lock + roz ki namaz)
// v29: naam ka font Playfair Display + Aref Ruqaa
// v28: app ke naam ka naya design (Reem Kufi)
// v27: Kamzor lafz revision, roz ki yaad-dehani (.ics), Sanad No. + jaanch
// v26: 92 padav ka safar (Silver beech mein, Gold aakhir mein), Qari sirf ayat par, ek language button, naya naam-font, ayat offline download
// v25: Day 11-20 (lafz 101-200) ki ayat + har ayat par Mishary ki mp3 ⬇ Download button
// v24: Day 1-10 ke har lafz ke saath Quran ki ayat (wordAyat.js), lafz highlight + hawala + Qari Mishary
// v23: Silver (500 lafz) aur Final (900 lafz) milestone exam, 80% pass, Day 51+ lock
// v22: Qari ki awaaz har Quran ke hisse par (multi-ayat, teeno Qul, Ayatul Kursi) + dua mein Favourites — cache badalna zaroori hai
// (v21: naya login (pura naam + multi-user profiles) aur certificate naam fix)
// NOTE: sirf Cache Storage badalta hai, users ki history (localStorage) ko koi asar nahi
const CACHE_NAME = 'quran-ustad-auto-v46';
// Download ki hui ayat ki recordings (sounds.js) — ye cache kabhi delete nahi karna
// Audio (azan + nasheed) aur fonts ke alag caches — ye bhi version badalne par delete nahi hote
const AUDIO_CACHE = 'fq-audio-v1';
const FONT_CACHE = 'fq-fonts-v1';
const KEEP_CACHES = [CACHE_NAME, 'qs-mishary-v1', AUDIO_CACHE, FONT_CACHE];
const AUDIO_ASSETS = ['./azan-aksa.mp3', './azan-sweet.mp3', './azan-3.mp3', './nasheed.mp3'];

const ASSETS = [
    './',
    './index.html',
    './courseData.js',
    './wordAyat.js',
    './dua.html',
    './tajweed.html',
    './games.html',
    './asma.html',
    './manifest.json',
    './icon.png',
    './icon-192.png',
    './icon-maskable.png',
    './signature.png',
    './app.js',
    './theme.css',
    './namaz.js',
    './sounds.js',
    './onboarding.js',
    './backup.js',
    './themes.js',
    './privacy.html'
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
        ).then(() =>
            // Azan + nasheed offline ke liye (ek baar save, version badalne par dobara nahi)
            caches.open(AUDIO_CACHE).then(cache =>
                Promise.all(AUDIO_ASSETS.map(url =>
                    cache.match(url).then(hit => hit || cache.add(url)).catch(err => console.warn('Audio skip:', url))
                ))
            )
        )
    );
});

// ===== ACTIVATE: Purana cache delete karo (purana audio cache bhi) =====
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => !KEEP_CACHES.includes(k)).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ===== FETCH: Smart Strategy =====
self.addEventListener('fetch', (e) => {
    const request = e.request;
    const url = new URL(request.url);

    // 🔤 Google Fonts (CSS + font files): pehli baar net se, phir offline bhi (stale-while-revalidate)
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        e.respondWith(
            caches.open(FONT_CACHE).then(cache =>
                cache.match(request).then(hit => {
                    const net = fetch(request).then(res => {
                        if (res && (res.status === 200 || res.type === 'opaque')) cache.put(request, res.clone());
                        return res;
                    }).catch(() => hit);
                    return hit || net;
                })
            )
        );
        return;
    }

    // Baaki sirf same-origin handle karo
    if (url.origin !== location.origin) return;

    // 🎵 Audio: saved azan/nasheed cache se (Range support ke saath), warna browser seedha network se
    if (/\.(mp3|ogg|m4a|wav)$/i.test(url.pathname)) {
        e.respondWith(serveAudio(request));
        return;
    }
    if (request.headers.has('range')) return;

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


// ===== Audio ko cache se do (Range request bhi chalti hai, warna seek/play nahi chalta) =====
async function serveAudio(request) {
    const cache = await caches.open(AUDIO_CACHE);
    const hit = await cache.match(request.url, { ignoreSearch: true });
    if (!hit) {
        try { return await fetch(request); }
        catch (err) { return new Response('', { status: 503, statusText: 'Offline' }); }
    }
    const range = request.headers.get('range');
    if (!range) return hit;
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (!m) return hit;
    const buf = await hit.arrayBuffer();
    const size = buf.byteLength;
    let start = m[1] === '' ? Math.max(0, size - parseInt(m[2], 10)) : parseInt(m[1], 10);
    let end = (m[1] === '' || m[2] === '') ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
    if (isNaN(start) || isNaN(end) || start > end || start >= size) {
        return new Response('', { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
    }
    return new Response(buf.slice(start, end + 1), {
        status: 206,
        statusText: 'Partial Content',
        headers: {
            'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg',
            'Content-Length': String(end - start + 1),
            'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
            'Accept-Ranges': 'bytes'
        }
    });
}
