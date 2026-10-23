/* Qari ki asli awaaz — Quran ke har hisse ke liye (dua, sabak, tajweed, aaj ki ayat — kahin bhi)
   Kaam ka tareeqa:
   1) Poora Quran ka text (harakat ke saath) ek baar Quran.com se aata hai aur phone mein save ho jaata hai.
   2) App ka Arabic text poore Quran ke saath milaya jaata hai — ek surah se doosri tak, ayat ke beech se bhi.
      Spelling ka chhota farq (jaise يَئُودُهُ / يَـُٔودُهُ, السماوات / السموت) maaf hai.
   3) Jo hissa POORI ayat hai -> us ayat ki Qari ki asli recording (RECITER, neeche likha hai).
      Jo hissa ayat ka tukda hai -> Quran.com ki lafz-ba-lafz recording.
   4) Jo Quran mein nahi (hadees ki dua, "بَ بِ بُ") ya net na ho -> phone ki awaaz.
      Ek hi dua mein Quran + hadees mile hon to Quran wala hissa Qari se, baaki phone se chalta hai.
   Qari badalna ho to sirf RECITER badlein (everyayah.com ka folder naam). */
(function () {
    var API = 'https://api.quran.com/api/v4/';
    var AUDIO_BASE = 'https://audio.qurancdn.com/';       // Quran.com ka official base (wbw/... ke liye)
    // Poori ayat ki recording: pehle everyayah.com, na chale to Quran.com
    var RECITER = { name: 'Mishary Rashid Alafasy', everyayah: 'Alafasy_128kbps', qcom: 'Alafasy' };
    var VERSE_BASES = ['https://everyayah.com/data/' + RECITER.everyayah + '/', 'https://verses.quran.com/' + RECITER.qcom + '/mp3/'];
    var EXPECT = window.QSQARI_EXPECT || 6236;            // Quran ki kul ayaat
    var CACHE_KEY = 'qariCache4', CACHE_MAX = 600;        // v4: purana "nahi mila" yaad-dasht (qariCache3) ab kaam ka nahi
    var WAIT_MS = 2500;                                   // pehli baar Quran text aane ka intezaar
    var MINRUN = 5;                                       // dua ke beech Quran ka hissa kam az kam itne lafz ka ho
    try { localStorage.removeItem('qariCache3'); } catch (e) {}

    function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
    function verseUrls(key) {                             // "2:255" -> [everyayah link, Quran.com link]
        var p = key.split(':'), f = pad(p[0], 3) + pad(p[1], 3) + '.mp3';
        return VERSE_BASES.map(function (b) { return b + f; });
    }

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
    // Lafz ka "dhancha" (sirf mazboot harf): ا و ي ء ؤ ئ hata kar. Spelling ke farq (dagger alif, hamza) ko barabar karta hai.
    function skelKey(l) { var s = l.replace(/ة/g, 'ه').replace(/[اويءؤئ]/g, ''); return s || l; }

    // ---------- Storage ----------
    var mem = {};                                         // key -> [parts] ya 0 (nahi mila)
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
    var FLAT = [], IDX = Object.create(null);             // poore Quran ke lafz ek line mein (surah paar karke bhi match ke liye)
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
        FLAT = []; IDX = Object.create(null);
        return list.map(function (e, vi) {
            var t = toks(e[1]), o = [], l = [];
            t.forEach(function (x, p) {
                o.push(x.o); l.push(x.l);
                var k = skelKey(x.l);
                (IDX[k] || (IDX[k] = [])).push(FLAT.length);
                FLAT.push({ v: vi, p: p, l: x.l, k: k });
            });
            return { k: e[0], o: o, l: l };
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

    // ---------- Plan: text ko Qari / phone ke hisson mein baantna ----------
    // Wapas: [ {u:[links], x:"arabic"} (Qari), {t:"arabic"} (phone ki awaaz) ] ya null (Quran mein kuch nahi mila)
    function cleanForAudio(text) { return String(text).replace(/\([^)]*\)|\[[^\]]*\]/g, ' '); }   // "(3 بار)" jaisi hidayat Quran nahi
    function qtoks(text) {
        return toks(cleanForAudio(text)).map(function (x) { return { o: x.o, l: x.l, k: skelKey(x.l) }; });
    }
    // tk[i] se shuru hone wala sab se lamba hissa jo Quran mein (surah paar karke bhi) lagatar milta ho
    function longestRun(tk, i) {
        var cands = IDX[tk[i].k];
        if (!cands) return null;
        var best = null, rem = tk.length - i;
        for (var c = 0; c < cands.length; c++) {
            var s = cands[c], len = 0, ex = 0;
            while (len < rem && s + len < FLAT.length && FLAT[s + len].k === tk[i + len].k) {
                if (FLAT[s + len].l === tk[i + len].l) ex++;
                len++;
            }
            var bonus = FLAT[s].p === 0 ? 1 : 0;          // ayat ke shuru se ho to behtar
            if (!best || len > best.len || (len === best.len && (ex > best.ex || (ex === best.ex && bonus > best.bonus)))) {
                best = { s: s, len: len, ex: ex, bonus: bonus };
            }
            if (best.len === rem && best.ex === rem && best.bonus) break;
        }
        return best;
    }
    // Kya ye hissa sach mein Quran hai? (galat match se bachne ke liye sakht shart)
    function qualifies(run, n, whole) {
        if (!run) return false;
        var need = run.len <= 4 ? run.len : Math.ceil(run.len * 0.8);   // chhota hissa: har lafz hu-ba-hu; lamba: 80%
        if (run.ex < need) return false;
        return whole ? run.len === n : run.len >= MINRUN;
    }
    function segment(tk) {
        var n = tk.length, segs = [], rb = [], i = 0;
        function flush() { if (rb.length) { segs.push({ t: rb.map(function (x) { return x.o; }).join(' ') }); rb = []; } }
        while (i < n) {
            var r = longestRun(tk, i);
            if (qualifies(r, n, i === 0 && !!r && r.len === n)) { flush(); segs.push({ q: r, from: i }); i += r.len; }
            else { rb.push(tk[i]); i++; }
        }
        flush();
        return segs;
    }
    function txt(tk, a, b) { return tk.slice(a, b + 1).map(function (x) { return x.o; }).join(' '); }

    // Ek Quran ke hisse ko parts mein: poori ayat -> ayat ki recording, tukda -> lafz-ba-lafz
    function runParts(seg, tk, st) {
        var run = seg.q, end = run.s + run.len - 1, x = run.s, groups = [];
        while (x <= end) {
            var vi = FLAT[x].v, y = x;
            while (y + 1 <= end && FLAT[y + 1].v === vi) y++;
            groups.push({ vi: vi, a: x, b: y });
            x = y + 1;
        }
        return Promise.all(groups.map(function (g) {
            var v = quran[g.vi], p0 = FLAT[g.a].p, p1 = FLAT[g.b].p;
            var i0 = seg.from + (g.a - run.s), i1 = seg.from + (g.b - run.s);
            if (p0 === 0 && p1 === v.l.length - 1) return Promise.resolve([{ u: verseUrls(v.k), x: txt(tk, i0, i1) }]);
            var jobs = [];
            for (var p = p0; p <= p1; p++) jobs.push((function (p) {
                var word = tk[i0 + (p - p0)].o;
                return audioPath(v.k, p, v.l[p]).then(function (path) {
                    return path ? { u: [AUDIO_BASE + path], x: word } : { t: word };
                }).catch(function () { st.ok = false; return { t: word }; });
            })(p));
            return Promise.all(jobs);
        })).then(function (lists) { return [].concat.apply([], lists); });
    }
    function singleWord(tok, ctx) {
        var hit = null;
        if (ctx) {
            var ct = toks(ctx), cs = ct.length ? findPhrase(ct) : null;
            if (cs) hit = locateInSpan(cs, tok.l, tok.o);
        }
        if (!hit) hit = findWordAnywhere(tok.l, tok.o);
        if (!hit) return Promise.resolve({ parts: null, ok: true });
        return audioPath(hit.v.k, hit.t, tok.l).then(function (p) {
            return { parts: p ? [{ u: [AUDIO_BASE + p], x: tok.o }] : null, ok: true };
        });
    }
    function compute(text, ctx) {
        var tk = qtoks(text);
        if (!tk.length) return Promise.resolve({ parts: null, ok: true });
        if (tk.length === 1) return singleWord(tk[0], ctx);
        var segs = segment(tk);
        if (!segs.some(function (s) { return s.q; })) return Promise.resolve({ parts: null, ok: true });
        var st = { ok: true };
        return Promise.all(segs.map(function (s) {
            return s.q ? runParts(s, tk, st) : Promise.resolve([{ t: s.t }]);
        })).then(function (lists) { return { parts: [].concat.apply([], lists), ok: st.ok }; });
    }

    function plan(text, ctx) {
        text = String(text || '').trim();
        if (!text) return Promise.resolve(null);
        var key = 'P|' + strict(text) + '|' + (ctx ? strict(ctx) : '');
        if (key in mem) return Promise.resolve(mem[key] || null);
        if (key in ls) { mem[key] = ls[key]; return Promise.resolve(ls[key] || null); }

        var ready = quran ? Promise.resolve(quran)
            : Promise.race([ensure(), new Promise(function (r) { setTimeout(function () { r(null); }, WAIT_MS); })]);
        return ready.then(function (q) {
            if (!q) return null;                          // Quran text abhi aaya nahi — is baar phone ki awaaz
            return compute(text, ctx).then(function (res) {
                if (res.ok) { mem[key] = res.parts || 0; ls[key] = res.parts || 0; saveLS(); }   // net ki galti ho to yaad mat rakho
                return res.parts;
            });
        }).catch(function () { return null; });           // net nahi / API band — phone ki awaaz
    }

    // Purana tareeqa (sirf links ki list): tabhi jab poora text Qari se chalna ho
    function resolve(text, ctx) {
        return plan(text, ctx).then(function (parts) {
            if (!parts || !parts.every(function (p) { return p.u; })) return null;
            return [].concat.apply([], parts.map(function (p) { return p.u.slice(0, 1); }));
        });
    }

    // Ayat ka "surah:ayat" pata ho to Quran text match kiye bina seedha us ayat ki recording (net ke ilawa kuch nahi chahiye)
    function verseParts(key, text) { return [{ u: verseUrls(key), x: text || '' }]; }

    window.QSQari = { plan: plan, resolve: resolve, verseParts: verseParts, ensure: ensure, reciter: RECITER.name };

    // Page khulte hi chupke se Quran text le aao (agar pehle se saved na ho)
    function warm() {
        try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) {}
        ensure().catch(function () {});
    }
    if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 }); else setTimeout(warm, 1500);
})();
