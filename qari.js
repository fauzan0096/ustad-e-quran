/* Qari ki asli awaaz — Quran ke lafz aur ayat ke liye (word-by-word recitation, Quran.com)
   Kaam ka tareeqa:
   1) Poora Quran ka text (harakat ke saath) ek baar Quran.com se aata hai aur phone mein save ho jaata hai.
   2) App ka Arabic lafz / jumla Quran mein dhoondha jaata hai.
   3) Milne par har lafz ki recording ka link Quran.com se liya jaata hai aur recording chalti hai.
   4) Jo Quran mein nahi (jaise "بَ بِ بُ", hadees ki dua) ya net na ho to purani phone wali awaaz chalti hai.
   Ek baar mil gaya link phone mein yaad rehta hai. */
(function () {
    var API = 'https://api.quran.com/api/v4/';
    var AUDIO_BASE = 'https://audio.qurancdn.com/';       // Quran.com ka official base (wbw/... ke liye)
    var EXPECT = window.QSQARI_EXPECT || 6236;            // Quran ki kul ayaat
    var CACHE_KEY = 'qariCache3', CACHE_MAX = 600;
    var WAIT_MS = 2500;                                   // pehli baar Quran text aane ka intezaar

    // ---------- Normalize ----------
    var MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/g;
    function loose(s) {
        return String(s).replace(/ـ/g, '').replace(MARKS, '')
            .replace(/[ٱأإآ]/g, 'ا').replace(/[ىېێیۍ]/g, 'ي').replace(/ک/g, 'ك').replace(/[ہھ]/g, 'ه').replace(/ۃ/g, 'ة')
            .replace(/[^ء-ي]/g, '');
    }
    function strict(s) {
        return String(s).replace(/ـ/g, '').replace(/[ؐ-ؚۖ-ۭ]/g, '')
            .replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي')
            .replace(/([^ً-ٰٟ])([ً-ٰٟ]+)/g, function (m, b, d) { return b + d.split('').sort().join(''); });
    }
    // Lafz ka "dhancha": harakat ke saath, magar aakhri harf ki harkat (waqf/irab) aur khanjari alif ignore
    function stem(s) { return strict(s).replace(/\u0670/g, '').replace(/[\u064B-\u065F]+$/, ''); }
    function toks(text) {
        return String(text).split(/\s+/).map(function (t) { return { o: t, l: loose(t) }; }).filter(function (x) { return x.l; });
    }

    // ---------- Storage ----------
    var mem = {};                                         // key -> [paths] ya 0 (nahi mila)
    var ls = (function () {
        try { var v = JSON.parse(localStorage.getItem(CACHE_KEY)); return (v && typeof v === 'object') ? v : {}; } catch (e) { return {}; }
    })();
    function saveLS() {
        try {
            var keys = Object.keys(ls);
            if (keys.length > CACHE_MAX) keys.slice(0, keys.length - CACHE_MAX).forEach(function (k) { delete ls[k]; });
            localStorage.setItem(CACHE_KEY, JSON.stringify(ls));
        } catch (e) {}
    }

    // ---------- IndexedDB (Quran text) ----------
    function idb() {
        return new Promise(function (res, rej) {
            try {
                var r = indexedDB.open('qs-quran', 1);
                r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
                r.onsuccess = function () { res(r.result); };
                r.onerror = function () { rej(r.error); };
            } catch (e) { rej(e); }
        });
    }
    function idbGet(k) {
        return idb().then(function (db) {
            return new Promise(function (res, rej) {
                var q = db.transaction('kv').objectStore('kv').get(k);
                q.onsuccess = function () { res(q.result || null); };
                q.onerror = function () { rej(q.error); };
            });
        }).catch(function () { return null; });
    }
    function idbSet(k, v) {
        return idb().then(function (db) {
            return new Promise(function (res) {
                var tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k);
                tx.oncomplete = function () { res(); }; tx.onerror = function () { res(); };
            });
        }).catch(function () {});
    }

    // ---------- Quran text ----------
    var quran = null, loading = null;
    function getJSON(url) {
        return fetch(url).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }
    function fetchAll() {
        return getJSON(API + 'quran/verses/imlaei').then(function (j) {
            if (j && j.verses && j.verses.length === EXPECT) return j.verses;
            throw new Error('adhoora');
        }).catch(function () {
            // Ek saath na aaye to surah-by-surah
            var out = new Array(114), n = 0;
            function worker() {
                if (n >= 114) return Promise.resolve();
                var c = ++n;
                return getJSON(API + 'quran/verses/imlaei?chapter_number=' + c).then(function (j) { out[c - 1] = j.verses || []; }).then(worker);
            }
            return Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]).then(function () {
                var all = [].concat.apply([], out);
                if (all.length !== EXPECT) throw new Error('adhoora');
                return all;
            });
        });
    }
    function build(list) {                                // list: [[key, text], ...]
        return list.map(function (e) {
            var t = toks(e[1]);
            return { k: e[0], o: t.map(function (x) { return x.o; }), l: t.map(function (x) { return x.l; }) };
        });
    }
    function ensure() {
        if (quran) return Promise.resolve(quran);
        if (loading) return loading;
        loading = idbGet('text-v1').then(function (saved) {
            if (saved && saved.length === EXPECT) return saved;
            return fetchAll().then(function (verses) {
                var list = verses.map(function (v) { return [v.verse_key, v.text_imlaei]; });
                idbSet('text-v1', list);
                return list;
            });
        }).then(function (list) { quran = build(list); return quran; })
          .catch(function (e) { loading = null; throw e; });
        return loading;
    }

    // ---------- Quran mein dhoondhna ----------
    function strictScore(vo, start, ptoks) {
        var s = 0;
        for (var j = 0; j < ptoks.length; j++) if (strict(vo[start + j]) === strict(ptoks[j].o)) s++;
        return s;
    }
    // Poora jumla (lafz-ba-lafz barabar) — behtareen match
    function findPhrase(ptoks) {
        var n = ptoks.length, P = ptoks.map(function (x) { return x.l; }), best = null;
        for (var vi = 0; vi < quran.length; vi++) {
            var L = quran[vi].l;
            if (L.length < n) continue;
            for (var i = 0; i <= L.length - n; i++) {
                if (L[i] !== P[0]) continue;
                var ok = true;
                for (var j = 1; j < n; j++) if (L[i + j] !== P[j]) { ok = false; break; }
                if (!ok) continue;
                var sc = strictScore(quran[vi].o, i, ptoks);
                if (!best || sc > best.sc) best = { v: quran[vi], i: i, n: n, sc: sc };
                if (sc === n) return best;                // pura harakat-samet mil gaya
            }
        }
        return best;
    }
    // Ek lafz — jumle (ctx) ke andar, warna poore Quran mein
    function locateInSpan(span, la, orig) {
        var pick = -1, j;
        for (j = 0; j < span.n && pick < 0; j++) if (span.v.l[span.i + j] === la) pick = j;
        for (j = 0; j < span.n && pick < 0; j++) if (span.v.l[span.i + j] === 'ال' + la) pick = j;
        // aage 1-2 harf (و، ف، ب، ل...) laga ho to bhi chalega, lekin beech ka ya peeche ka hissa nahi
        for (j = 0; j < span.n && pick < 0; j++) { var tk = span.v.l[span.i + j], d = tk.length - la.length; if (d >= 1 && d <= 2 && tk.slice(d) === la) pick = j; }
        return pick < 0 ? null : { v: span.v, t: span.i + pick };
    }
    function findWordAnywhere(la, orig) {
        // Sirf wohi lafz jo harakat ke saath bhi barabar ho (warna galat lafz chal sakta hai, jaise الحَكَم / الحُكْم)
        var so = stem(orig);
        for (var vi = 0; vi < quran.length; vi++) {
            var L = quran[vi].l;
            for (var i = 0; i < L.length; i++) {
                if (L[i] === la && stem(quran[vi].o[i]) === so) return { v: quran[vi], t: i };
            }
        }
        return null;
    }

    // ---------- Audio ka link (Quran.com API se) ----------
    var vcache = {};
    function verseWords(key) {
        if (vcache[key]) return vcache[key];
        vcache[key] = getJSON(API + 'verses/by_key/' + key + '?words=true&word_fields=text_imlaei,audio_url').then(function (j) {
            return ((j.verse && j.verse.words) || []).filter(function (w) { return w.char_type_name === 'word' && w.audio_url; });
        }).catch(function (e) { delete vcache[key]; throw e; });
        return vcache[key];
    }
    function audioPath(key, t, l) {                       // t = lafz ka number (0 se), l = uska loose roop
        return verseWords(key).then(function (ws) {
            var w = ws[t];
            if (w && loose(w.text_imlaei) === l) return w.audio_url;
            var bestIdx = -1;                             // number thoda alag ho to sab se qareeb wala wahi lafz
            ws.forEach(function (x, idx) {
                if (loose(x.text_imlaei) === l && (bestIdx < 0 || Math.abs(idx - t) < Math.abs(bestIdx - t))) bestIdx = idx;
            });
            return bestIdx >= 0 ? ws[bestIdx].audio_url : null;
        });
    }

    // ---------- Resolve ----------
    // text: Arabic lafz/jumla. ctx (optional): wo jumla jisme ye lafz aata hai (jaise mashq).
    // Wapas: [relative audio paths] ya null
    function lineToPaths(line, ctx) {
        var pt = toks(line);
        if (!pt.length) return Promise.resolve(null);
        var span = null, hit = null;
        if (pt.length === 1) {
            if (ctx) {
                var ct = toks(ctx);
                var cs = ct.length ? findPhrase(ct) : null;
                if (cs) hit = locateInSpan(cs, pt[0].l, line);
            }
            if (!hit) hit = findWordAnywhere(pt[0].l, line);
            if (!hit) return Promise.resolve(null);
            return audioPath(hit.v.k, hit.t, pt[0].l).then(function (p) { return p ? [p] : null; });
        }
        span = findPhrase(pt);
        if (!span) return Promise.resolve(null);
        return Promise.all(pt.map(function (x, j) { return audioPath(span.v.k, span.i + j, x.l); })).then(function (ps) {
            return ps.every(Boolean) ? ps : null;
        });
    }

    function compute(text, ctx) {
        var lines = String(text).split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
        if (!lines.length) return Promise.resolve(null);
        if (lines.length === 1) return lineToPaths(lines[0], ctx);
        // Kayi lines (dua): har line Quran ki ho tabhi Qari, warna poori dua phone ki awaaz mein
        return Promise.all(lines.map(function (ln) { return lineToPaths(ln, null); })).then(function (parts) {
            return parts.every(Boolean) ? [].concat.apply([], parts) : null;
        });
    }

    function resolve(text, ctx) {
        text = String(text || '').trim();
        if (!text) return Promise.resolve(null);
        var key = strict(text) + '|' + (ctx ? strict(ctx) : '');
        function out(p) { return p ? p.map(function (x) { return AUDIO_BASE + x; }) : null; }
        if (key in mem) return Promise.resolve(out(mem[key]));
        if (key in ls) { mem[key] = ls[key]; return Promise.resolve(out(ls[key])); }

        var ready = quran ? Promise.resolve(quran)
            : Promise.race([ensure(), new Promise(function (r) { setTimeout(function () { r(null); }, WAIT_MS); })]);
        return ready.then(function (q) {
            if (!q) return null;                          // Quran text abhi aaya nahi — is baar phone ki awaaz
            return compute(text, ctx).then(function (p) {
                mem[key] = p || 0; ls[key] = p || 0; saveLS();   // nahi mila to bhi yaad rakho (dobara na dhoondhe)
                return out(p);
            });
        }).catch(function () { return null; });           // net nahi / API band — yaad mat rakho, phone ki awaaz
    }

    window.QSQari = { resolve: resolve, ensure: ensure };

    // Page khulte hi chupke se Quran text le aao (agar pehle se saved na ho)
    function warm() {
        try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) {}
        ensure().catch(function () {});
    }
    if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 }); else setTimeout(warm, 1500);
})();
