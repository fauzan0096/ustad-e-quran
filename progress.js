/* Batch 3 — index.html ke liye:
   1) Levels aur Badges (streak, din mukammal, full marks, dohrai, pasandida)
   2) Share card: lafz ya badge ki sundar tasveer banakar WhatsApp par bhejna
   Ye file index.html ke main script ke BAAD load hoti hai. */
(function () {
    // ---------- storage helpers ----------
    // Profile ke hisaab se alag save hone wali keys (index.html ka pk() 'p_<profile>_<key>' banata hai)
    var PER = { currentDay: 1, streak: 1, bestStreak: 1, bookmarks: 1, perfectExams: 1, revisionsDone: 1, badgesEarned: 1 };
    function K(k) {
        try { if (PER[k] && typeof pk === 'function' && typeof activeProfile !== 'undefined' && activeProfile) return pk(k); } catch (e) {}
        return k;
    }
    function lsGet(k) { try { return localStorage.getItem(K(k)); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(K(k), v); } catch (e) {} }
    function lsJSON(k, d) { try { var v = JSON.parse(lsGet(k)); return v || d; } catch (e) { return d; } }
    function num(k) { return parseInt(lsGet(k), 10) || 0; }
    function toast(m) { if (typeof showToast === 'function') showToast(m); }

    // ---------- Levels ----------
    var LEVELS = [
        { n: 'Mubtadi',     i: '🌱', min: 0 },
        { n: 'Talib-e-Ilm', i: '📘', min: 50 },
        { n: 'Mutaalim',    i: '📗', min: 150 },
        { n: 'Mahir',       i: '⭐', min: 300 },
        { n: 'Ustad',       i: '👑', min: 450 }
    ];

    // ---------- Badges ----------
    var BADGES = [
        { id: 's3',  i: '🔥', n: '3 din ki streak',        d: 'Lagatar 3 din app kholi',               t: function (s) { return s.streak >= 3; } },
        { id: 's7',  i: '🔥', n: '7 din ki streak',        d: 'Poora ek hafta roz aaye',               t: function (s) { return s.streak >= 7; } },
        { id: 's30', i: '🌙', n: '30 din ki streak',       d: 'Poora ek mahina roz aaye',              t: function (s) { return s.streak >= 30; } },
        { id: 'd1',  i: '🌟', n: 'Pehla qadam',            d: 'Pehla din mukammal kiya',               t: function (s) { return s.days >= 1; } },
        { id: 'd10', i: '📚', n: 'Pehle 10 din mukammal',  d: '100 lafz seekh liye',                   t: function (s) { return s.days >= 10; } },
        { id: 'd25', i: '🧭', n: 'Aadha safar',            d: '25 din mukammal',                       t: function (s) { return s.days >= 25; } },
        { id: 'd50', i: '🏆', n: 'Course mukammal',        d: 'Sab din mukammal, Mashallah!',          t: function (s) { return s.days >= s.total; } },
        { id: 'p1',  i: '💯', n: 'Full marks',             d: 'Exam mein 10/10 aaye',                  t: function (s) { return s.perfect >= 1; } },
        { id: 'p5',  i: '🎯', n: '5 baar full marks',      d: 'Exam mein 5 baar 10/10',                t: function (s) { return s.perfect >= 5; } },
        { id: 'r1',  i: '🔁', n: 'Dohrai mukammal',        d: 'Dohrai mein sab lafz sahi',             t: function (s) { return s.rev >= 1; } },
        { id: 'f10', i: '❤️', n: '10 pasandida',           d: '10 lafz pasandida mein jode',           t: function (s) { return s.favs >= 10; } }
    ];

    function state() {
        var total = (typeof courseData !== 'undefined' && courseData.length) ? courseData.length : 50;
        var prog = Math.max(1, num('currentDay') || 1);          // asli progress (admin ka dekhna nahi ginta)
        var days = Math.min(total, prog - 1);
        var words = 0;
        if (typeof courseData !== 'undefined') courseData.forEach(function (d) { if (d.day <= days) words += d.words.length; });
        var streak = num('streak');
        var best = Math.max(num('bestStreak'), streak);
        if (best !== num('bestStreak')) lsSet('bestStreak', best);
        return { total: total, days: days, words: words, streak: Math.max(streak, best), cur: streak, best: best,
                 favs: lsJSON('bookmarks', []).length, perfect: num('perfectExams'), rev: num('revisionsDone') };
    }

    function levelOf(words) {
        var idx = 0;
        for (var i = 0; i < LEVELS.length; i++) if (words >= LEVELS[i].min) idx = i;
        return idx;
    }

    function earnedIds(s) { return BADGES.filter(function (b) { return b.t(s); }).map(function (b) { return b.id; }); }

    // ---------- CSS ----------
    var st = document.createElement('style');
    st.textContent =
        '.share-ico{position:absolute;top:8px;left:8px;width:40px;height:40px;border-radius:50%;border:none;background:transparent;font-size:18px;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center}' +
        '.share-ico:active{transform:scale(.9)}' +
        '.today-card .share-ico{background:rgba(255,255,255,.14)}' +
        '#levelStrip{max-width:1200px;margin:10px auto 0;padding:0 16px}' +
        '.lv-strip{width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:var(--card-bg);border:1px solid var(--border);box-shadow:var(--shadow);cursor:pointer;text-align:left;color:var(--text);min-height:64px}' +
        '.lv-strip:active{transform:scale(.99)}' +
        '.lv-ico{font-size:30px;flex:0 0 auto}' +
        '.lv-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}' +
        '.lv-main b{font-size:14px}' +
        '.lv-bar{display:block;height:6px;border-radius:6px;background:var(--border);overflow:hidden}' +
        '.lv-bar u{display:block;height:100%;text-decoration:none;background:linear-gradient(90deg,var(--primary),var(--gold-bright));border-radius:6px;transition:width .5s}' +
        '.lv-main small{font-size:11.5px;color:var(--text-light)}' +
        '.lv-bdg{flex:0 0 auto;font-size:12px;font-weight:700;padding:6px 10px;border-radius:14px;background:var(--soft-bg);color:var(--text)}' +
        '.bd-sum{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0 4px}' +
        '.bd-sum span{font-size:12.5px;font-weight:600;padding:6px 12px;border-radius:14px;background:var(--soft-bg);color:var(--text)}' +
        '.bd-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}' +
        '.bd{position:relative;text-align:center;padding:14px 8px 12px;border-radius:16px;border:1px solid var(--border);background:var(--soft-bg)}' +
        '.bd.on{border-color:var(--secondary);background:linear-gradient(180deg,rgba(217,182,90,.18),rgba(217,182,90,.04))}' +
        '.bd .bi{font-size:36px;line-height:1.2}' +
        '.bd:not(.on) .bi{filter:grayscale(1);opacity:.35}' +
        '.bd b{display:block;font-size:13px;margin-top:4px;color:var(--text)}' +
        '.bd small{display:block;font-size:11px;color:var(--text-light);margin-top:2px;line-height:1.35}' +
        '.bd:not(.on) b,.bd:not(.on) small{opacity:.6}' +
        '.bd .bs{margin-top:8px;border:none;background:var(--primary);color:#fff;border-radius:12px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;min-height:32px}' +
        '[data-theme="dark"] .bd .bs{background:var(--gold-bright);color:#2A2008}';
    document.head.appendChild(st);

    // ---------- Level strip ----------
    function renderStrip(s) {
        var row = document.querySelector('.quick-row');
        if (!row) return;
        var el = document.getElementById('levelStrip');
        if (!el) { el = document.createElement('div'); el.id = 'levelStrip'; row.parentNode.insertBefore(el, row.nextSibling); }
        var li = levelOf(s.words), lv = LEVELS[li], nx = LEVELS[li + 1];
        var pct = nx ? Math.round((s.words - lv.min) / (nx.min - lv.min) * 100) : 100;
        var sub = nx ? (s.words + ' / ' + nx.min + ' lafz • agla: ' + nx.n) : (s.words + ' lafz • Sab levels mukammal 🎉');
        el.innerHTML = '<button class="lv-strip" id="lvBtn" aria-label="Badges kholein">' +
            '<span class="lv-ico">' + lv.i + '</span>' +
            '<span class="lv-main"><b>Level ' + (li + 1) + ' · ' + lv.n + '</b><i class="lv-bar"><u style="width:' + pct + '%"></u></i><small>' + sub + '</small></span>' +
            '<span class="lv-bdg">🏅 ' + earnedIds(s).length + '/' + BADGES.length + '</span></button>';
        document.getElementById('lvBtn').onclick = openBadges;
    }

    // ---------- Naye badge ka pata ----------
    function checkNew(s) {
        var now = earnedIds(s);
        var seen = lsJSON('badgesEarned', []);
        var fresh = now.filter(function (id) { return seen.indexOf(id) < 0; });
        if (fresh.length) {
            lsSet('badgesEarned', JSON.stringify(seen.concat(fresh)));
            var b = BADGES.filter(function (x) { return x.id === fresh[0]; })[0];
            toast('🎉 Naya badge: ' + b.i + ' ' + b.n + (fresh.length > 1 ? ' (+' + (fresh.length - 1) + ' aur)' : ''));
        }
    }

    function refresh() {
        var s = state();
        renderStrip(s);
        checkNew(s);
        return s;
    }

    // ---------- Badges modal ----------
    function modal() {
        var m = document.getElementById('badgeModal');
        if (m) return m;
        m = document.createElement('div');
        m.id = 'badgeModal';
        m.className = 'modal hidden';
        m.innerHTML = '<div class="modal-content"><span class="close-btn" id="bdClose">&times;</span>' +
            '<h2 id="bdTitle" style="text-align:center;color:var(--ink)">🏅 Meri Progress</h2>' +
            '<div class="bd-sum" id="bdSum"></div><div class="bd-grid" id="bdGrid"></div></div>';
        document.body.appendChild(m);
        document.getElementById('bdClose').onclick = function () { m.classList.add('hidden'); };
        m.addEventListener('click', function (e) { if (e.target === m) m.classList.add('hidden'); });
        return m;
    }

    function openBadges() {
        var s = refresh(), m = modal(), li = levelOf(s.words), got = earnedIds(s);
        document.getElementById('bdSum').innerHTML =
            '<span>' + LEVELS[li].i + ' ' + LEVELS[li].n + '</span>' +
            '<span>🔥 Streak ' + s.cur + ' (best ' + s.best + ')</span>' +
            '<span>📖 ' + s.words + ' lafz</span>';
        document.getElementById('bdGrid').innerHTML = BADGES.map(function (b) {
            var on = got.indexOf(b.id) >= 0;
            return '<div class="bd ' + (on ? 'on' : '') + '"><div class="bi">' + (on ? b.i : '🔒') + '</div><b>' + b.n + '</b><small>' + b.d + '</small>' +
                (on ? '<button class="bs" data-bshare="' + b.id + '">📤 Share</button>' : '') + '</div>';
        }).join('');
        m.classList.remove('hidden');
    }

    // ---------- Share card (canvas) ----------
    var W = 1080, H = 1350, GOLD = '#D9B65A';

    function rr(ctx, x, y, w, h, r) {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
        else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    }

    function fitText(ctx, text, font, maxW, startPx, minPx, weight) {
        var px = startPx;
        do { ctx.font = (weight || '') + ' ' + px + 'px ' + font; if (ctx.measureText(text).width <= maxW) break; px -= 4; } while (px > minPx);
        return px;
    }

    function wrapLines(ctx, text, maxW) {
        var words = String(text).split(/\s+/), lines = [], cur = '';
        words.forEach(function (w) {
            var t = cur ? cur + ' ' + w : w;
            if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
        });
        if (cur) lines.push(cur);
        return lines;
    }

    async function loadFonts() {
        try {
            await Promise.all([
                document.fonts.load('700 80px Amiri', 'اللَّه'),
                document.fonts.load('700 50px "Noto Nastaliq Urdu"', 'اللہ'),
                document.fonts.load('700 40px Figtree', 'Ab')
            ]);
        } catch (e) {}
    }

    function base(ctx) {
        var g = ctx.createRadialGradient(W / 2, 0, 80, W / 2, 0, H);
        g.addColorStop(0, '#17614B'); g.addColorStop(1, '#0A2E24');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(217,182,90,.12)'; ctx.lineWidth = 2;
        for (var y = 0; y < H; y += 108) for (var x = 0; x < W; x += 108) {
            ctx.strokeRect(x + 27, y + 27, 54, 54);
            ctx.save(); ctx.translate(x + 54, y + 54); ctx.rotate(Math.PI / 4); ctx.strokeRect(-27, -27, 54, 54); ctx.restore();
        }
        ctx.strokeStyle = GOLD; ctx.lineWidth = 6; rr(ctx, 40, 40, W - 80, H - 80, 36); ctx.stroke();
        ctx.strokeStyle = 'rgba(217,182,90,.5)'; ctx.lineWidth = 2; rr(ctx, 62, 62, W - 124, H - 124, 26); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
        ctx.fillStyle = GOLD; ctx.font = '700 58px Amiri, serif';
        ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', W / 2, 168);
        ctx.fillStyle = 'rgba(217,182,90,.5)'; ctx.fillRect(W / 2 - 90, 232, 180, 3);
    }

    function footer(ctx) {
        ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(217,182,90,.5)'; ctx.fillRect(W / 2 - 90, H - 262, 180, 3);
        ctx.fillStyle = '#fff'; ctx.font = '700 66px Amiri, serif';
        ctx.fillText('Quraan Ustad', W / 2, H - 196);
        ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '500 30px Figtree, system-ui, sans-serif';
        ctx.fillText('Quran aur Duaa seekhein', W / 2, H - 134);
    }

    async function drawWord(w) {
        await loadFonts();
        var c = document.createElement('canvas'); c.width = W; c.height = H;
        var ctx = c.getContext('2d');
        base(ctx);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.direction = 'ltr'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '600 30px Figtree, system-ui, sans-serif';
        ctx.fillText('QURAN KA LAFZ', W / 2, 330);
        // Arabic
        ctx.direction = 'rtl'; ctx.fillStyle = '#fff';
        fitText(ctx, w.a, 'Amiri, serif', W - 220, 230, 90, '700');
        ctx.fillText(w.a, W / 2, 560);
        // Roman
        ctx.direction = 'ltr'; ctx.fillStyle = GOLD;
        fitText(ctx, w.r, 'Figtree, system-ui, sans-serif', W - 200, 76, 40, '700');
        ctx.fillText(w.r, W / 2, 770);
        // Urdu
        ctx.direction = 'rtl'; ctx.fillStyle = '#fff';
        ctx.font = '700 70px "Noto Nastaliq Urdu", serif';
        var lines = wrapLines(ctx, w.u, W - 200).slice(0, 3);
        var y0 = 930 - (lines.length - 1) * 55;
        lines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, y0 + i * 110); });
        footer(ctx);
        return c;
    }

    async function drawBadge(b) {
        await loadFonts();
        var c = document.createElement('canvas'); c.width = W; c.height = H;
        var ctx = c.getContext('2d');
        base(ctx);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '600 30px Figtree, system-ui, sans-serif';
        ctx.fillText('NAYA BADGE', W / 2, 330);
        ctx.font = '300px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        ctx.fillText(b.i, W / 2, 600);
        ctx.fillStyle = GOLD;
        fitText(ctx, b.n, 'Amiri, serif', W - 200, 96, 50, '700');
        ctx.fillText(b.n, W / 2, 860);
        ctx.fillStyle = '#fff'; ctx.font = '500 42px Figtree, system-ui, sans-serif';
        wrapLines(ctx, b.d, W - 240).slice(0, 2).forEach(function (ln, i) { ctx.fillText(ln, W / 2, 960 + i * 58); });
        footer(ctx);
        return c;
    }

    async function shareCanvas(canvas, name, text) {
        var blob = await new Promise(function (r) { canvas.toBlob(r, 'image/png'); });
        if (!blob) { toast('❌ Tasveer nahi ban saki'); return; }
        var file = new File([blob], name, { type: 'image/png' });
        var link = location.origin + location.pathname.replace(/[^/]*$/, '');
        try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: text + '\n' + link });
                return;
            }
        } catch (e) { if (e && e.name === 'AbortError') return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        toast('📥 Tasveer save ho gayi — ab WhatsApp se bhej dein');
    }

    async function shareWord(a) {
        var w = (typeof findWord === 'function') ? findWord(a) : null;
        if (!w) return;
        toast('🖼️ Tasveer ban rahi hai...');
        var c = await drawWord(w);
        await shareCanvas(c, 'quraan-ustad-lafz.png', w.a + ' — ' + w.u);
    }

    async function shareBadge(id) {
        var b = BADGES.filter(function (x) { return x.id === id; })[0];
        if (!b) return;
        toast('🖼️ Tasveer ban rahi hai...');
        var c = await drawBadge(b);
        await shareCanvas(c, 'quraan-ustad-badge.png', b.i + ' ' + b.n + ' — Quraan Ustad');
    }

    // ---------- Events ----------
    document.addEventListener('click', function (e) {
        var s = e.target.closest && e.target.closest('.share-ico');
        if (s) { e.stopPropagation(); shareWord(s.dataset.share); return; }
        var bs = e.target.closest && e.target.closest('[data-bshare]');
        if (bs) { e.stopPropagation(); shareBadge(bs.dataset.bshare); }
    });

    // ---------- Public ----------
    window.QSProgress = {
        refresh: refresh,
        open: openBadges,
        onExam: function (score, total, type) {
            if (total && score === total) {
                lsSet('perfectExams', num('perfectExams') + 1);
                if (type === 'revision') lsSet('revisionsDone', num('revisionsDone') + 1);
            }
            refresh();
        },
        _drawWord: drawWord, _drawBadge: drawBadge
    };

    if (document.getElementById('mainApp') && !document.getElementById('mainApp').classList.contains('hidden')) refresh();
})();
