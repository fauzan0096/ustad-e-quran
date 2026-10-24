/* namaz.js — Fahm-ul-Quran
   🕌 Azan ki awaaz   📋 Roz ek baar "poori namaz padhi?"   📅 Azan alarms (Calendar)
   Install: har page ke <head> mein ek line:  <script src="namaz.js" defer></script>
   (Azan ke waqt koi screen/phone lock nahi lagta.) */
(function () {
    'use strict';

    var EVENT_MIN = 20;                           // Calendar event ki lambai (sirf yaad dahani)
    var PR = [
        { k: 'Fajr',    n: 'Fajr',    i: '🌅' },
        { k: 'Dhuhr',   n: 'Zuhr',    i: '☀️' },
        { k: 'Asr',     n: 'Asr',     i: '🌤️' },
        { k: 'Maghrib', n: 'Maghrib', i: '🌇' },
        { k: 'Isha',    n: 'Isha',    i: '🌙' }
    ];

    // ---------- Android app (window.AndroidNS) ----------
    var NATIVE = (window.AndroidNS && typeof window.AndroidNS.configure === 'function') ? window.AndroidNS : null;
    var lastSync = '';
    function syncNative() {
        if (!NATIVE) return;
        try {
            var T = getTimes(), loc = jget('ns_loc', null);
            var j = JSON.stringify({ times: T ? T.t : null, lat: loc ? String(loc.lat) : null, lng: loc ? String(loc.lng) : null,
                school: school(), auto: !!(T && !T.manual && loc), sound: sndPref() });
            if (j !== lastSync) { lastSync = j; NATIVE.configure(j); }
        } catch (e) {}
    }

    // ---------- storage ----------
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function jget(k, d) { try { var v = JSON.parse(lsGet(k)); return v == null ? d : v; } catch (e) { return d; } }
    function jset(k, v) { lsSet(k, JSON.stringify(v)); }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function dstr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function dayOff(o) { var d = new Date(); d.setDate(d.getDate() + o); return dstr(d); }
    function loggedIn() { return lsGet('isLoggedIn') === 'true' && !!lsGet('activeProfile'); }
    function isAdmin() { return loggedIn() && lsGet('userRole') === 'admin'; }
    function P(k) { return 'p_' + lsGet('activeProfile') + '_' + k; }   // index.html ke pk() jaisa
    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

    function toast(m) {
        if (typeof window.showToast === 'function') { try { window.showToast(m); return; } catch (e) {} }
        var t = document.getElementById('toast');
        if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
        t.className = 'toast show'; t.textContent = m;
        clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 3200);
    }

    // ---------- waqt (azan ke time) ----------
    function getTimes() { var o = jget('ns_times', null); return o && o.t ? o : null; }
    function toMin(s) { var m = /^(\d{1,2}):(\d{2})/.exec(s || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; }
    function fmt12(s) {
        var m = toMin(s); if (m == null) return '--:--';
        var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM';
        return ((h % 12) || 12) + ':' + pad(mm) + ' ' + ap;
    }
    function school() { return lsGet('ns_school') === '0' ? '0' : '1'; }   // 1 = Hanafi (default), 0 = Shafi

    function apiURL(path, loc) { return 'https://api.aladhan.com/v1/' + path + (path.indexOf('?') < 0 ? '?' : '&') + 'latitude=' + loc.lat + '&longitude=' + loc.lng + '&school=' + school(); }
    function clean(t) { var o = {}; PR.forEach(function (p) { o[p.k] = String(t[p.k]).slice(0, 5); }); return o; }

    var fetching = false;
    function refreshTimes(force) {
        var loc = jget('ns_loc', null), T = getTimes(), today = dstr(new Date());
        if (!loc) return Promise.resolve(false);
        if (!force && T && (T.manual || T.date === today)) return Promise.resolve(false);
        if (fetching) return Promise.resolve(false);
        fetching = true;
        var d = new Date();
        var path = 'timings/' + pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear();
        return fetch(apiURL(path, loc)).then(function (r) { return r.json(); }).then(function (j) {
            jset('ns_times', { date: today, t: clean(j.data.timings), manual: false });
            fetching = false; return true;
        }).catch(function () { fetching = false; return false; });   // net nahi — pichle waqt chalte rahenge (farq ~1 min/din)
    }

    function askLocation() {
        return new Promise(function (res, rej) {
            if (!navigator.geolocation) { rej(new Error('nogeo')); return; }
            navigator.geolocation.getCurrentPosition(function (p) {
                var loc = { lat: +p.coords.latitude.toFixed(4), lng: +p.coords.longitude.toFixed(4) };
                jset('ns_loc', loc); res(loc);
            }, function (e) { rej(e); }, { timeout: 15000, maximumAge: 3600000 });
        });
    }

    // Azan apne aap: waqt aate hi (pehle 60 sec mein) ek baar bajti hai
    function azanTick() {
        if (NATIVE) return;                       // app mein azan Android service bajati hai
        var T = getTimes(); if (!T || sndPref() === 'off') return;
        var now = Date.now();
        PR.forEach(function (p) {
            var m = toMin(T.t[p.k]); if (m == null) return;
            var d = new Date(); var s0 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, m, 0, 0).getTime();
            var key = dstr(d) + '_' + p.k;
            if (now >= s0 && now < s0 + 60000 && lsGet('ns_played') !== key) { lsSet('ns_played', key); playAzan(); toast('🕌 ' + p.n + ' ki azan'); }
        });
    }
    function nextPrayer() {
        var T = getTimes(); if (!T) return null;
        var now = new Date(), best = null;
        for (var off = 0; off <= 1 && !best; off++) {
            PR.forEach(function (p) {
                var m = toMin(T.t[p.k]); if (m == null) return;
                var s = new Date(now.getFullYear(), now.getMonth(), now.getDate() + off, 0, m, 0, 0).getTime();
                if (s > now.getTime() && (!best || s < best.at)) best = { p: p, at: s, time: T.t[p.k] };
            });
        }
        return best;
    }
    function untilText(ms) {
        var m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60);
        return h ? h + ' ghanta ' + (m % 60) + ' min' : m + ' min';
    }

    // ---------- Back button / swipe-back: sirf popup band ho, page peeche na jaye ----------
    var layers = [], ignorePop = 0;
    function openLayer(name, closeFn) {
        var ok = false;
        try { history.pushState({ nsLayer: name }, ''); ok = true; } catch (e) {}
        layers.push({ n: name, c: closeFn, h: ok });
    }
    function dropLayer(name) {                    // popup X / bahar tap se band hua — uska history entry hata do
        for (var i = layers.length - 1; i >= 0; i--) {
            if (layers[i].n === name) {
                var had = layers[i].h; layers.splice(i, 1);
                if (had) { ignorePop++; try { history.back(); } catch (e) { ignorePop--; } }
                return;
            }
        }
    }
    window.addEventListener('popstate', function () {
        if (ignorePop > 0) { ignorePop--; return; }
        var top = layers.pop(); if (top) top.c();
    });
    // Screen ke kinare (left/right) se andar ki taraf swipe = wapas (back)
    function edgeSwipe(el, onClose) {
        var sx = 0, sy = 0, side = 0;
        el.addEventListener('touchstart', function (e) {
            var t = e.touches[0]; sx = t.clientX; sy = t.clientY;
            side = t.clientX < 22 ? 1 : (t.clientX > window.innerWidth - 22 ? -1 : 0);
        }, { passive: true });
        el.addEventListener('touchend', function (e) {
            if (!side) return;
            var t = e.changedTouches[0];
            if ((t.clientX - sx) * side > 80 && Math.abs(t.clientY - sy) < 60) onClose();
            side = 0;
        }, { passive: true });
    }

    var CSS =

        '.ns-modal{position:fixed;inset:0;background:rgba(4,16,12,.72);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);z-index:2500;display:flex;justify-content:center;align-items:flex-end;padding:0}' +
        '.ns-box,.ns-box *{box-sizing:border-box}' +
        '.ns-box{background:var(--card-bg,#fffdf6);color:var(--text,#1F2A25);width:100%;max-width:520px;max-height:calc(100vh - 48px);max-height:calc(100dvh - 48px);overflow-y:auto;border-radius:22px 22px 0 0;border:1px solid var(--border,#D9D6C3);border-bottom:none;border-top:4px solid var(--secondary,#B8923A);padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));position:relative;box-shadow:0 -12px 40px rgba(0,0,0,.35);font-family:Figtree,system-ui,sans-serif;text-align:left;animation:nsUp .22s ease-out}' +
        '.ns-box.full{height:calc(100vh - 48px);height:calc(100dvh - 48px);max-height:none;display:flex;flex-direction:column;padding:0;overflow:hidden}' +
        '@keyframes nsUp{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}' +
        '@media (min-width:600px){.ns-modal{align-items:center;padding:16px}.ns-box{border-radius:22px;border-bottom:1px solid var(--border,#D9D6C3);max-height:90vh}.ns-box.full{height:min(86vh,780px)}}' +
        '.ns-head{position:relative;flex:0 0 auto;padding:16px 60px 12px;text-align:center;border-bottom:1px solid var(--border,#D9D6C3)}' +
        '.ns-head:before{content:\'\';display:block;width:42px;height:4px;border-radius:4px;background:var(--border,#D9D6C3);margin:-8px auto 8px}' +
        '.ns-head h2,.ns-box>h2{margin:0;font-size:19px;line-height:1.3;color:var(--ink,#0A2E24);text-align:center}' +
        '.ns-box>h2{margin-bottom:4px}' +
        '.ns-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:12px 16px calc(22px + env(safe-area-inset-bottom,0px))}' +
        '.ns-x{position:absolute;top:12px;right:12px;width:40px;height:40px;border-radius:50%;border:none;background:var(--soft-bg,#F4F1E3);color:var(--text,#1F2A25);font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}' +
        '.ns-next{text-align:center;font-size:13px;color:var(--text-light,#55645C);margin:2px 0 10px;line-height:1.7}' +
        '.ns-next b{color:var(--text,#1F2A25);font-size:15px}' +
        '.ns-stat{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}' +
        '.ns-stat span{display:flex;align-items:center;justify-content:center;min-height:40px;padding:6px 8px;border-radius:12px;background:var(--soft-bg,#F4F1E3);font-size:13px;font-weight:700;text-align:center}' +
        '.ns-row{display:grid;grid-template-columns:minmax(0,1fr) 112px 46px;align-items:center;gap:10px;height:58px;padding:0 10px;margin:8px 0;border-radius:14px;background:var(--soft-bg,#F4F1E3);border:1.5px solid transparent}' +
        '.ns-row.done{border-color:var(--primary,#0F4C3A);background:rgba(15,76,58,.1)}' +
        '.ns-row .nm{display:flex;align-items:center;gap:8px;min-width:0;font-weight:700;font-size:14px;white-space:nowrap}' +
        '.ns-row .nm i{font-style:normal;font-size:20px;width:26px;text-align:center;flex:0 0 auto}' +
        '.ns-row input[type=time]{width:112px;height:40px;padding:0 8px;border:1px solid var(--border,#D9D6C3);border-radius:10px;background:var(--card-bg,#fff);color:var(--text,#1F2A25);font:600 14px Figtree,sans-serif;text-align:center}' +
        '.ns-tick{width:44px;height:44px;border-radius:50%;border:2px solid var(--border,#D9D6C3);background:transparent;font-size:20px;cursor:pointer;color:var(--text,#1F2A25);display:flex;align-items:center;justify-content:center;padding:0}' +
        '.ns-row.done .ns-tick{background:var(--primary,#0F4C3A);border-color:var(--primary,#0F4C3A);color:#fff}' +
        '.ns-sec{font-weight:800;font-size:12.5px;letter-spacing:.3px;margin:18px 0 6px;color:var(--text-light,#55645C)}' +
        '.ns-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin:6px 0}' +
        '.ns-week div{text-align:center;font-size:10.5px;color:var(--text-light,#55645C)}' +
        '.ns-week div b{display:block;font-size:20px;line-height:1.4}' +
        '.ns-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;min-height:48px;margin-top:10px;padding:10px 14px;border:none;border-radius:14px;font-weight:700;font-size:14px;line-height:1.3;text-align:center;cursor:pointer;background:linear-gradient(180deg,#17614B,var(--primary,#0F4C3A));color:#fff;font-family:inherit}' +
        '.ns-btn.gold{background:linear-gradient(180deg,#E3C36E,#C79E3F);color:#2A2008}' +
        '.ns-btn.ghost{background:transparent;color:var(--text,#1F2A25);border:1.5px solid var(--border,#D9D6C3)}' +
        '.ns-set{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:52px;padding:6px 2px;font-size:14px}' +
        '.ns-set select{width:150px;height:40px;padding:0 8px;border-radius:10px;border:1px solid var(--border,#D9D6C3);background:var(--card-bg,#fff);color:var(--text,#1F2A25);font:600 13px Figtree,sans-serif}' +
        '.ns-note{font-size:11.5px;line-height:1.7;color:var(--text-light,#55645C);margin-top:8px}' +
        '.ns-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0}' +
        '.ns-chips.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}' +
        '.ns-chips.grid .ns-chip:last-child:nth-child(odd){grid-column:1/-1}' +
        '.ns-chips.sm{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:8px 0}' +
        '.ns-chip{display:flex;align-items:center;justify-content:center;min-height:44px;padding:8px 10px;border-radius:22px;border:2px solid var(--border,#D9D6C3);background:var(--soft-bg,#F4F1E3);font-weight:700;font-size:14px;cursor:pointer;color:var(--text,#1F2A25);font-family:inherit;text-align:center}' +
        '.ns-chips.sm .ns-chip{min-height:40px;font-size:13px;border-width:1.5px}' +
        '.ns-chip.on{background:var(--primary,#0F4C3A);border-color:var(--primary,#0F4C3A);color:#fff}' +
        '.ns-num{display:flex;align-items:center;justify-content:center;gap:8px;margin:8px 0 2px;font-size:13px}' +
        '.ns-num input{width:84px;height:40px;padding:0 8px;border:1px solid var(--border,#D9D6C3);border-radius:10px;background:var(--card-bg,#fff);color:var(--text,#1F2A25);font:700 15px Figtree,sans-serif;text-align:center}' +
        '.rp-boxes{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:10px 0}' +
        '.rp-box{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:3px;min-height:98px;padding:8px 2px;background:var(--soft-bg,#F4F1E3);border-radius:12px;text-align:center}' +
        '.rp-e{font-size:18px;line-height:1}.rp-n{font-size:10.5px;font-weight:700;white-space:nowrap}' +
        '.rp-v{font-size:17px;font-weight:800;line-height:1.1}.rp-v small{font-size:10px;font-weight:600;color:var(--text-light,#55645C)}' +
        '.rp-bar{width:80%;height:5px;border-radius:5px;background:var(--border,#D9D6C3);overflow:hidden}.rp-bar u{display:block;height:100%;background:#2e9d62;border-radius:5px}' +
        '.rp-m{font-size:9.5px;color:#c0392b;font-weight:700;white-space:nowrap}' +
        '.rp-scroll{overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch}.rp-t{border-collapse:separate;border-spacing:3px;margin:0 auto}' +
        '.rp-t th{font-size:9px;font-weight:600;color:var(--text-light,#55645C);min-width:22px}.rp-t th.rn{font-size:15px;position:sticky;left:0;background:var(--card-bg,#fff);min-width:28px}' +
        '.rp-c{display:block;width:22px;height:22px;border-radius:6px;border:none;padding:0}.rp-c.y{background:#2e9d62}.rp-c.n{background:#d64545}.rp-c.x{background:var(--soft-bg,#ddd);opacity:.7}' +
        '#namazCard{display:flex;min-width:0}' +
        '#namazCard .ns-card{flex:1;min-width:0;min-height:68px;margin:0;display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--card-bg,#fffdf6);border:1px solid var(--border,#D9D6C3);border-radius:16px;box-shadow:var(--shadow);cursor:pointer;text-align:left;color:var(--text,#1F2A25);font-family:inherit}' +
        '#namazCard .ns-card .ic{font-size:24px;line-height:1;flex:0 0 auto}' +
        '#namazCard .ns-card .mid{flex:1;min-width:0}' +
        '#namazCard .ns-card b{display:block;font-size:13px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '#namazCard .ns-card small{display:block;font-size:11.5px;color:var(--text-light,#55645C);margin-top:2px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}';
    var styled = false;
    function injectCSS() { if (styled) return; styled = true; var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }


    // ---------- namaz ka hisaab (log) ----------
    function getLog() { return jget(P('namazLog'), {}); }
    function dayArr(date) { var a = getLog()[date]; return (a && a.length === 5) ? a.slice() : [0, 0, 0, 0, 0]; }
    function isFull(a) { return !!a && a.length === 5 && a.every(Boolean); }
    function count(a) { return a.filter(Boolean).length; }
    function streak() {
        var l = getLog(), n = 0, o = isFull(l[dayOff(0)]) ? 0 : 1;
        for (; ; o++) { if (isFull(l[dayOff(-o)])) n++; else break; }
        return n;
    }
    function saveDay(date, arr) {
        var l = getLog(); l[date] = arr;
        // Sirf 2 mahine ka data: is mahine + pichla mahina (usse purana hat jata hai)
        var cut = new Date(); cut.setDate(1); cut.setMonth(cut.getMonth() - 1); var cutS = dstr(cut);
        Object.keys(l).forEach(function (k) { if (k < cutS) delete l[k]; });
        jset(P('namazLog'), l);
        var s = streak(), best = parseInt(lsGet(P('namazBest')), 10) || 0;
        if (s > best) lsSet(P('namazBest'), s);
        var gotXP = false;
        if (isFull(arr)) {
            var got = jget(P('namazXP'), []);
            if (got.indexOf(date) < 0) {
                got.push(date); jset(P('namazXP'), got.slice(-120));
                if (!isAdmin()) {
                    if (typeof window.addXP === 'function') { try { window.addXP(25); } catch (e) {} }
                    else lsSet(P('xp'), (parseInt(lsGet(P('xp')), 10) || 0) + 25);
                    gotXP = true;
                }
            }
        }
        try { if (window.QSProgress && QSProgress.refresh) QSProgress.refresh(); } catch (e) {}
        return gotXP;
    }

    // ---------- roz ka sawal ----------
    var askEl = null;
    function sinceDate() { var s = lsGet(P('namazSince')); if (!s) { s = dayOff(0); lsSet(P('namazSince'), s); } return s; }
    function askedDate(d) { return (jget(P('namazAsked'), [])).indexOf(d) >= 0; }
    function markAsked(d) { var a = jget(P('namazAsked'), []); a.push(d); jset(P('namazAsked'), a.slice(-20)); }

    function pendingAsk() {
        if (!loggedIn()) return null;
        var since = sinceDate(), today = dayOff(0), y = dayOff(-1), log = getLog();
        if (since <= y && !log[y] && !askedDate(y)) return y;
        var T = getTimes();
        if (T && !log[today] && !askedDate(today)) {
            var m = toMin(T.t.Isha), now = new Date();
            if (m != null && now.getHours() * 60 + now.getMinutes() >= m) return today;
        }
        return null;
    }

    function openAsk(date) {
        if (askEl || document.getElementById('nsPanel')) return;
        injectCSS(); markAsked(date);
        var arr = dayArr(date), isToday = date === dayOff(0);
        askEl = document.createElement('div'); askEl.className = 'ns-modal'; askEl.id = 'nsAsk';
        function draw() {
            askEl.innerHTML = '<div class="ns-box">' +
                '<h2>🕌 ' + (isToday ? 'Aaj' : 'Kal') + ' ki namaz</h2>' +
                '<div class="ns-next">' + (isToday ? 'Aaj' : 'Kal') + ' ki saari namazein padh li? Sach batayein — ye sirf aapke liye hai 🤍</div>' +
                '<div class="ns-chips grid">' + PR.map(function (p, i) { return '<button type="button" class="ns-chip ' + (arr[i] ? 'on' : '') + '" data-i="' + i + '">' + p.i + ' ' + p.n + (arr[i] ? ' ✓' : '') + '</button>'; }).join('') + '</div>' +
                '<button type="button" class="ns-btn gold" data-a="all">✅ Alhamdulillah, sab padhi (+25 XP)</button>' +
                '<button type="button" class="ns-btn" data-a="save">💾 Jo tick kiya wo save karein</button>' +
                '<button type="button" class="ns-btn ghost" data-a="later">Baad mein</button></div>';
        }
        function close(fromBack) { if (askEl) { askEl.remove(); askEl = null; if (!fromBack) dropLayer('ask'); } renderCard(); setTimeout(maybeAsk, 600); }
        function finish() {
            var xp = saveDay(date, arr);
            if (isFull(arr)) { toast('🌟 MashaAllah! Poori namaz' + (xp ? ' — +25 XP' : '') + ' • 🔥 ' + streak() + ' din'); try { window.QSSFX && QSSFX.win(); } catch (e) {} }
            else toast('Jazakallah. Jo reh gayi uski qaza padh lein, kal poori koshish karein 🤍');
            close();
        }
        askEl.addEventListener('click', function (e) {
            if (e.target === askEl) { close(); return; }
            var c = e.target.closest ? e.target.closest('[data-i]') : null;
            if (c) { var i = +c.dataset.i; arr[i] = arr[i] ? 0 : 1; draw(); return; }
            var b = e.target.closest ? e.target.closest('[data-a]') : null;
            if (!b) return;
            if (b.dataset.a === 'all') { arr = [1, 1, 1, 1, 1]; finish(); }
            else if (b.dataset.a === 'save') finish();
            else close();
        });
        draw(); document.body.appendChild(askEl);
        openLayer('ask', function () { close(true); });
        edgeSwipe(askEl, function () { close(); });
    }

    // ---------- Calendar alarms (.ics) ----------
    // Jitne din chahiye utne hi (1 din se 1 saal tak). Waqt wahi jo aapne boxes mein rakha hai.
    var ICS_PRESETS = [[1, '1 din'], [7, '7 din'], [30, '1 mahina'], [90, '3 mahine'], [180, '6 mahine'], [365, '1 saal']];
    function icsDays() { var v = parseInt(lsGet('ns_icsDays'), 10); return (v >= 1 && v <= 366) ? v : 30; }
    function setIcsDays(v) { v = parseInt(v, 10); if (!(v >= 1)) v = 30; if (v > 366) v = 366; lsSet('ns_icsDays', String(v)); return v; }
    // UTC mein likhte hain: Calendar apps mein waqt bilkul wahi dikhta hai jo phone par hai (floating time kuch apps galat padhte hain)
    function icsUTC(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; }

    function monthsNeeded(dates) {
        var seen = {}, out = [];
        dates.forEach(function (d) { var k = d.getFullYear() + '-' + d.getMonth(); if (!seen[k]) { seen[k] = 1; out.push([d.getFullYear(), d.getMonth() + 1]); } });
        return out;
    }
    function fetchMonthTimes(loc, months) {      // { 'YYYY-MM-DD': {Fajr:'05:10', ...} }
        var map = {}, i = 0;
        function one(ym) {
            return fetch(apiURL('calendar/' + ym[0] + '/' + ym[1], loc)).then(function (r) { return r.json(); }).then(function (j) {
                j.data.forEach(function (day) {
                    var g = day.date.gregorian.date.split('-');          // DD-MM-YYYY
                    map[g[2] + '-' + g[1] + '-' + g[0]] = clean(day.timings);
                });
            });
        }
        function next() {
            var batch = months.slice(i, i + 3); i += 3;
            if (!batch.length) return Promise.resolve(map);
            return Promise.all(batch.map(one)).then(next);
        }
        return next();
    }

    function makeICS() {
        var T = getTimes(), loc = jget('ns_loc', null);
        if (!T) { toast('Pehle azan ke waqt set karein (location se ya khud bharein)'); return Promise.resolve(); }
        var days = icsDays(), today0 = new Date(); today0.setHours(0, 0, 0, 0);
        var todayS = dstr(today0), dates = [];
        for (var i = 0; i < days; i++) { var d = new Date(today0); d.setDate(today0.getDate() + i); dates.push(d); }
        // Khud bhare waqt (manual) = har din wahi waqt. Location wale waqt = har din ka asli waqt (roz thoda badalta hai)
        var useApi = !T.manual && !!loc && days > 1;
        toast('📅 Waqt jama ho rahe hain...');
        return (useApi ? fetchMonthTimes(loc, monthsNeeded(dates)) : Promise.resolve(null)).then(function (map) {
            var now = Date.now(), n = 0, stamp = icsUTC(new Date());
            var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fahm-ul-Quran//Namaz//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Azan ke waqt'];
            dates.forEach(function (base) {
                var ds = dstr(base);
                var t = (ds === todayS && T.date === todayS) ? T.t : ((map && map[ds]) || T.t);   // aaj ka = bilkul wahi jo app mein dikh raha hai
                PR.forEach(function (p) {
                    var m = toMin(t[p.k]); if (m == null) return;
                    var s = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, m, 0, 0);
                    if (s.getTime() <= now) return;                                                  // guzra hua waqt nahi
                    var e = new Date(s.getTime() + EVENT_MIN * 60000), at = fmt12(t[p.k]);
                    L.push('BEGIN:VEVENT', 'UID:ns-' + icsUTC(s) + '-' + p.k + '@quraan-ustad', 'DTSTAMP:' + stamp,
                        'DTSTART:' + icsUTC(s), 'DTEND:' + icsUTC(e), 'SUMMARY:🕌 ' + p.n + ' ki azan • ' + at,
                        'DESCRIPTION:' + p.n + ' ka waqt ' + at + '. Namaz padhein phir Fahm-ul-Quran kholein 🤲', 'TRANSP:TRANSPARENT',
                        'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:' + p.n + ' ki azan ' + at, 'END:VALARM', 'END:VEVENT');
                    n++;
                });
            });
            L.push('END:VCALENDAR');
            if (!n) { toast('Is muddat mein koi naya alarm nahi bana'); return; }
            var blob = new Blob([L.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'azan-alarms.ics';
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
            toast('📥 ' + days + ' din ke ' + n + ' azan alarm ki file ban gayi — kholkar Calendar mein add karein');
        }).catch(function () { toast('❌ Internet nahi ya waqt nahi mile — net chalakar dobara dabayein, ya khud waqt bharein'); });
    }

    // ---------- azan ki awaaz ----------
    var SND = { aksa: 'azan-aksa.mp3', sweet: 'azan-sweet.mp3', third: 'azan-3.mp3' };
    var SND_NAME = { off: '🔇 Awaaz band', aksa: 'Azan Al-Aqsa', sweet: 'Meethi Azan', third: 'Azan 3' };
    function sndPref() { var v = lsGet('ns_snd'); return (v === 'off' || SND[v]) ? v : 'aksa'; }
    var audioEl = null;
    function stopAzan() { if (audioEl) { try { audioEl.pause(); } catch (e) {} audioEl = null; } }
    function playAzan() {
        var v = sndPref(); if (v === 'off') return;
        stopAzan();
        try { audioEl = new Audio(SND[v]); var p = audioEl.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }

    // ---------- mahine ka hisaab ----------
    var MONTHS = ['Janwari', 'Farwari', 'March', 'April', 'May', 'June', 'July', 'August', 'Sitambar', 'Aktoobar', 'Navambar', 'Disambar'];
    function monthKey(y, m) { return y + '-' + pad(m + 1); }
    function isaPassed() {
        var T = getTimes(), mi = T ? toMin(T.t.Isha) : null, n = new Date();
        return mi != null && n.getHours() * 60 + n.getMinutes() >= mi;
    }
    function monthStats(y, m) {
        var since = sinceDate(), todayS = dayOff(0), log = getLog();
        var dim = new Date(y, m + 1, 0).getDate(), per = [0, 0, 0, 0, 0], days = 0, full = 0;
        for (var d = 1; d <= dim; d++) {
            var ds = y + '-' + pad(m + 1) + '-' + pad(d);
            if (ds < since || ds > todayS) continue;
            if (ds === todayS && !isaPassed()) continue;      // aaj ka din Isha ke baad ginte hain
            days++;
            var a = (log[ds] && log[ds].length === 5) ? log[ds] : [0, 0, 0, 0, 0];
            a.forEach(function (v, i) { if (v) per[i]++; });
            if (isFull(a)) full++;
        }
        var prayed = per.reduce(function (x, y2) { return x + y2; }, 0), total = days * 5;
        return { y: y, m: m, dim: dim, days: days, per: per, prayed: prayed, total: total, missed: total - prayed, full: full };
    }
    function monthOf(off) { var n = new Date(); var d = new Date(n.getFullYear(), n.getMonth() + off, 1); return { y: d.getFullYear(), m: d.getMonth() }; }

    var repEl = null, repTab = 0;
    function closeReport(fromBack) { if (repEl) { repEl.remove(); repEl = null; if (!fromBack) dropLayer('report'); } setTimeout(maybeAsk, 600); }
    function openReport(tab, auto) {
        injectCSS();
        if (!repEl) {
            repEl = document.createElement('div'); repEl.className = 'ns-modal'; repEl.id = 'nsReport';
            repEl.style.zIndex = 2600;
            repEl.addEventListener('click', function (e) {
                if (e.target === repEl) { closeReport(); return; }
                var t = e.target.closest ? e.target.closest('[data-rm],[data-rc],[data-a]') : null; if (!t) return;
                if (t.dataset.rm != null) { repTab = +t.dataset.rm; drawReport(); return; }
                if (t.dataset.rc) {                                   // grid ka box: us din ki namaz tick/untick
                    var p = t.dataset.rc.split('|'), arr = dayArr(p[0]); arr[+p[1]] = arr[+p[1]] ? 0 : 1; saveDay(p[0], arr); drawReport(); return;
                }
                if (t.dataset.a === 'rclose') closeReport();
            });
            document.body.appendChild(repEl);
            openLayer('report', function () { closeReport(true); });
            edgeSwipe(repEl, function () { closeReport(); });
        }
        repTab = tab || 0; drawReport();
        if (auto) { var m = monthOf(-repTab), k = monthKey(m.y, m.m), r = jget(P('namazReported'), []); if (r.indexOf(k) < 0) { r.push(k); jset(P('namazReported'), r.slice(-6)); } }
    }
    function drawReport() {
        if (!repEl) return;
        var sc0 = repEl.querySelector('.ns-body'), keep = sc0 ? sc0.scrollTop : 0;
        var mo = monthOf(-repTab), st = monthStats(mo.y, mo.m), log = getLog(), todayS = dayOff(0);
        var pct = st.total ? Math.round(st.prayed * 100 / st.total) : 0;
        var verdict = !st.days ? 'Is mahine ka koi din abhi gina nahi gaya.' :
            pct >= 95 ? '🌟 MashaAllah! Bohot behtareen mahina — Allah qubool farmaye.' :
            pct >= 75 ? '👍 Achha raha. Thodi aur koshish — chhooti hui namazein qaza padh lein.' :
            pct >= 40 ? '🤍 Koi baat nahi, agle mahine himmat karein. Chhooti hui namazein qaza padh lein.' :
            '🤲 Allah se dua karein ke namaz ki aadat de. Aaj se hi shuru kar lein — har namaz ginti mein aayegi.';
        var boxes = PR.map(function (p, i) {
            var pp = st.days ? Math.round(st.per[i] * 100 / st.days) : 0;
            return '<div class="rp-box"><div class="rp-e">' + p.i + '</div><div class="rp-n">' + p.n + '</div><div class="rp-v">' + st.per[i] + '<small>/' + st.days + '</small></div>' +
                '<div class="rp-bar"><u style="width:' + pp + '%"></u></div><div class="rp-m">' + (st.days - st.per[i]) + ' chhooti</div></div>';
        }).join('');
        var head = '<tr><th></th>'; for (var d = 1; d <= st.dim; d++) head += '<th>' + d + '</th>'; head += '</tr>';
        var rows = PR.map(function (p, i) {
            var r = '<tr><th class="rn">' + p.i + '</th>';
            for (var d = 1; d <= st.dim; d++) {
                var ds = st.y + '-' + pad(st.m + 1) + '-' + pad(d), a = log[ds], on = a && a[i];
                var counted = ds <= todayS && ds >= sinceDate() && !(ds === todayS && !isaPassed());
                var cls = on ? 'y' : (counted ? 'n' : 'x');
                r += '<td>' + (ds <= todayS ? '<button class="rp-c ' + cls + '" data-rc="' + ds + '|' + i + '" aria-label="' + p.n + ' ' + d + '"></button>' : '<span class="rp-c x"></span>') + '</td>';
            }
            return r + '</tr>';
        }).join('');
        repEl.innerHTML = '<div class="ns-box full">' +
            '<div class="ns-head"><button class="ns-x" data-a="rclose" aria-label="Band">&times;</button><h2>📊 ' + MONTHS[mo.m] + ' ' + mo.y + '</h2></div>' +
            '<div class="ns-body">' +
            '<div class="ns-chips grid" style="margin-top:2px"><button class="ns-chip ' + (repTab === 0 ? 'on' : '') + '" data-rm="0">Is mahine</button><button class="ns-chip ' + (repTab === 1 ? 'on' : '') + '" data-rm="1">Pichla mahina</button></div>' +
            '<div class="ns-stat"><span>✅ ' + st.prayed + ' padhi</span><span>❌ ' + st.missed + ' chhooti</span><span>📈 ' + pct + '%</span><span>🌟 ' + st.full + ' din poori</span></div>' +
            '<div class="ns-next">' + verdict + '<br><small>Kul ' + st.total + ' namazein (' + st.days + ' din × 5)</small></div>' +
            '<div class="rp-boxes">' + boxes + '</div>' +
            '<div class="ns-sec">DIN-BA-DIN (box dabakar badal sakte hain)</div>' +
            '<div class="rp-scroll"><table class="rp-t">' + head + rows + '</table></div>' +
            '<div class="ns-note">🟩 padhi • 🟥 chhooti • ⬜ abhi baaki. Sirf is mahine aur pichle mahine ka data rakha jata hai.</div>' +
            '<button class="ns-btn ghost" data-a="rclose">Theek hai</button></div></div>';
        var sc1 = repEl.querySelector('.ns-body'); if (sc1) sc1.scrollTop = keep;
    }

    function pendingReport() {
        if (!loggedIn()) return null;
        var rep = jget(P('namazReported'), []), n = new Date(), pm = monthOf(-1);
        if (rep.indexOf(monthKey(pm.y, pm.m)) < 0 && monthStats(pm.y, pm.m).days > 0) return 1;       // naye mahine ki pehli baar
        var last = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
        if (n.getDate() === last && isaPassed() && rep.indexOf(monthKey(n.getFullYear(), n.getMonth())) < 0 && monthStats(n.getFullYear(), n.getMonth()).days > 0) return 0;   // mahine ke aakhri din Isha ke baad
        return null;
    }

    // ---------- panel ----------
    var panelEl = null;
    function closePanel(fromBack) { if (panelEl) { panelEl.remove(); panelEl = null; if (!fromBack) dropLayer('panel'); } renderCard(); }

    function openPanel() {
        injectCSS();
        if (panelEl) return;
        panelEl = document.createElement('div'); panelEl.className = 'ns-modal'; panelEl.id = 'nsPanel';
        panelEl.addEventListener('click', onPanelClick);
        panelEl.addEventListener('change', onPanelChange);
        document.body.appendChild(panelEl);
        openLayer('panel', function () { closePanel(true); });
        edgeSwipe(panelEl, function () { closePanel(); });
        drawPanel();
    }

    function drawPanel() {
        if (!panelEl) return;
        var sc0 = panelEl.querySelector('.ns-body'), keep = sc0 ? sc0.scrollTop : 0;
        var T = getTimes(), today = dayOff(0), arr = dayArr(today), nx = nextPrayer(), loc = jget('ns_loc', null);
        var week = '', o;
        var dn = ['Itwar', 'Peer', 'Mangal', 'Budh', 'Jumeraat', 'Jumma', 'Hafta'];
        for (o = 6; o >= 0; o--) { var dd = new Date(); dd.setDate(dd.getDate() - o); var cc = count(dayArr(dstr(dd))); week += '<div><b>' + (cc === 5 ? '🟢' : cc > 0 ? '🟡' : '⚪') + '</b>' + dn[dd.getDay()].slice(0, 4) + '</div>'; }

        var icsBox = NATIVE ? '' :
            '<div class="ns-sec">📅 PHONE CALENDAR MEIN AZAN ALARM</div>' +
            '<div class="ns-note" style="margin-top:0">Kitne din ka chahiye? Jitna chunenge utna hi banega.</div>' +
            '<div class="ns-chips sm">' + ICS_PRESETS.map(function (q) { return '<button type="button" class="ns-chip ' + (icsDays() === q[0] ? 'on' : '') + '" data-d="' + q[0] + '">' + q[1] + '</button>'; }).join('') + '</div>' +
            '<label class="ns-num">Ya apne din likhein: <input type="number" id="nsIcsN" min="1" max="366" inputmode="numeric" value="' + icsDays() + '"> din</label>' +
            '<button type="button" class="ns-btn ghost" data-a="ics">📥 <span id="nsIcsLbl">' + icsDays() + ' din</span> ka alarm banayein</button>' +
            '<div class="ns-note">Alarm mein wahi waqt jayega jo upar boxes mein hai' + (T && T.manual ? ' (aapka khud ka waqt, har din wahi)' : ' (location ke hisaab se har din ka asli waqt)') + '. Event ke naam mein waqt likha hota hai. Calendar app ki Settings mein notification <b>"event ke waqt par"</b> rakhein — kuch apps 10 min pehle bata deti hain. Calendar sirf notification deta hai, azan ki awaaz nahi.</div>';

        panelEl.innerHTML = '<div class="ns-box full">' +
            '<div class="ns-head"><button class="ns-x" data-a="close" aria-label="Band">&times;</button><h2>🕌 Namaz ka Hisaab</h2></div>' +
            '<div class="ns-body">' +
            '<div class="ns-next">' + (nx ? 'Agli namaz: <b>' + nx.p.i + ' ' + nx.p.n + '</b> • ' + fmt12(nx.time) + '<br>' + untilText(nx.at - Date.now()) + ' baaki' : 'Azan ke waqt set karein 👇') + '</div>' +
            '<div class="ns-stat"><span>✅ Aaj ' + count(arr) + '/5</span><span>🔥 Poori namaz ' + streak() + ' din</span></div>' +
            PR.map(function (p, i) {
                return '<div class="ns-row ' + (arr[i] ? 'done' : '') + '"><span class="nm"><i>' + p.i + '</i>' + p.n + '</span>' +
                    '<input type="time" data-t="' + p.k + '" value="' + esc(T ? T.t[p.k] : '') + '" aria-label="' + p.n + ' ka waqt">' +
                    '<button class="ns-tick" data-p="' + i + '" aria-label="' + p.n + ' padh li">' + (arr[i] ? '✓' : '') + '</button></div>';
            }).join('') +
            '<div class="ns-note">Time box = azan ka waqt (badal sakte hain). ✓ = aaj padh li. Poori 5 par +25 XP.</div>' +
            '<button class="ns-btn gold" data-a="report">📊 Mahine ka hisaab (5 boxes)</button>' +
            '<div class="ns-sec">PICHLE 7 DIN</div><div class="ns-week">' + week + '</div>' +
            '<div class="ns-sec">SETTINGS</div>' +
            '<button class="ns-btn gold" data-a="loc" style="margin-top:0">📍 ' + (loc ? 'Waqt dobara lein (location se)' : 'Location se azan ke waqt lein') + '</button>' +
            '<div class="ns-set"><span>🔊 Azan ki awaaz</span><select id="nsSnd">' + ['aksa', 'sweet', 'third', 'off'].map(function (k) { return '<option value="' + k + '" ' + (sndPref() === k ? 'selected' : '') + '>' + SND_NAME[k] + '</option>'; }).join('') + '</select></div>' +
            '<button class="ns-btn ghost" data-a="snd" style="margin-top:2px">▶️ Awaaz sunein</button>' +
            '<div class="ns-set"><span>Asr ka hisaab</span><select id="nsSchool"><option value="1" ' + (school() === '1' ? 'selected' : '') + '>Hanafi</option><option value="0" ' + (school() === '0' ? 'selected' : '') + '>Shafi / Maliki / Hanbali</option></select></div>' +
            icsBox +
            (NATIVE ? '<div class="ns-sec">📱 ANDROID APP</div>' +
                '<div class="ns-note" style="margin-top:0">✅ Azan app band ho tab bhi waqt par bajegi.</div>' +
                '<button class="ns-btn ghost" data-a="ntest">🧪 Azan ka test</button>' : '') +
            (NATIVE ? '<div class="ns-note">🔋 Agar azan waqt par na bajti ho to phone ki Settings → Battery mein "Fahm-ul-Quran" ko <b>Unrestricted / Autostart</b> dein (Xiaomi, Oppo, Vivo, Realme mein zaroori).</div>' : '<div class="ns-note">ℹ️ App band ho tab bhi yaad dilane ke liye upar wala <b>Calendar alarm</b> lagayein. App band hone par azan ki awaaz ke liye Android app install karein.</div>') +
            '</div></div>';
        var sc1 = panelEl.querySelector('.ns-body'); if (sc1) sc1.scrollTop = keep;
    }

    function onPanelClick(e) {
        if (e.target === panelEl) { closePanel(); return; }
        var t = e.target.closest ? e.target.closest('[data-p],[data-a],[data-d]') : null; if (!t) return;
        if (t.dataset.d != null) { setIcsDays(t.dataset.d); drawPanel(); return; }
        if (t.dataset.p != null) {
            var i = +t.dataset.p, d = dayOff(0), arr = dayArr(d); arr[i] = arr[i] ? 0 : 1;
            var xp = saveDay(d, arr);
            if (isFull(arr)) toast('🌟 MashaAllah! Aaj ki poori namaz' + (xp ? ' • +25 XP' : ''));
            drawPanel(); return;
        }
        var a = t.dataset.a;
        if (a === 'close') closePanel();
        else if (a === 'ics') { var inp = document.getElementById('nsIcsN'); if (inp && inp.value) setIcsDays(inp.value); makeICS(); }
        else if (a === 'ntest') { syncNative(); try { NATIVE.test(); } catch (e) {} }
        else if (a === 'report') openReport(0, false);
        else if (a === 'snd') { if (audioEl) stopAzan(); else playAzan(); }
        else if (a === 'loc') {
            toast('📍 Location le rahe hain...');
            askLocation().then(function () { return refreshTimes(true); }).then(function (ok) {
                toast(ok ? '✅ Azan ke waqt set ho gaye' : '❌ Waqt nahi mile — net check karein ya khud time bharein'); drawPanel(); tick();
            }).catch(function () { toast('Location ki ijazat nahi mili — aap khud azan ka time bhar sakte hain'); });
        }
    }
    function onPanelChange(e) {
        var t = e.target;
        if (t.id === 'nsSnd') { lsSet('ns_snd', t.value); stopAzan(); playAzan(); return; }
        if (t.id === 'nsSchool') { lsSet('ns_school', t.value); if (jget('ns_loc', null)) refreshTimes(true).then(function () { drawPanel(); }); return; }
        if (t.id === 'nsIcsN') {                              // redraw nahi — warna button chhoot jata hai
            var v = setIcsDays(t.value); t.value = v;
            var lb = document.getElementById('nsIcsLbl'); if (lb) lb.textContent = v + ' din';
            return;
        }
        if (t.dataset && t.dataset.t) {                       // khud se waqt badla
            var T = getTimes() || { t: { Fajr: '', Dhuhr: '', Asr: '', Maghrib: '', Isha: '' } };
            T.t[t.dataset.t] = t.value; T.manual = true; T.date = dstr(new Date());
            jset('ns_times', T); toast('✅ ' + t.dataset.t + ' ka waqt save'); drawPanel(); tick();
        }
    }

    // ---------- index par chhota card ----------
    function renderCard() {
        var box = document.getElementById('namazCard'); if (!box) return;
        injectCSS();
        var T = getTimes(), nx = nextPrayer(), arr = dayArr(dayOff(0));
        function short(ms) { var m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60); return h ? h + 'h ' + (m % 60) + 'm' : m + ' min'; }
        var main = T && nx ? ('<b>' + nx.p.n + ' • ' + fmt12(nx.time) + '</b><small>' + short(nx.at - Date.now()) + ' • aaj ' + count(arr) + '/5 ✓</small>')
                           : '<b>Azan ke waqt</b><small>Tap karke set karein</small>';
        var html = '<button type="button" class="ns-card" id="nsCardBtn"><span class="ic">🕌</span><span class="mid">' + main + '</span></button>';
        if (box.dataset.h !== html) { box.innerHTML = html; box.dataset.h = html; document.getElementById('nsCardBtn').onclick = openPanel; }
    }

    // ---------- main tick ----------
    function tick() {
        azanTick(); syncNative();
        renderCard();
    }

    function maybeAsk() {
        if (askEl || panelEl || repEl || window.qsSplashActive) return;
        if (!loggedIn()) return;
        var d = pendingAsk(); if (d) { openAsk(d); return; }
        if (repEl) return;
        var r = pendingReport(); if (r !== null) openReport(r, true);
    }

    function init() {
        // dusre tabs mein waqt/log badle to yahan bhi
        refreshTimes(false).then(function () { tick(); });
        tick();
        setInterval(tick, 1000);
        setInterval(function () { refreshTimes(false); maybeAsk(); }, 60000);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) { drawPanel(); tick(); refreshTimes(false); setTimeout(maybeAsk, 800); } });
        // pehli baar: waqt set karne ki yaad (ek baar)
        setTimeout(function () {
            if (loggedIn() && !getTimes() && !jget('ns_loc', null) && lsGet('ns_setupAsked') !== '1' && !window.qsSplashActive) {
                lsSet('ns_setupAsked', '1'); openPanel();
            } else maybeAsk();
        }, 2800);
    }

    window.NS = { open: openPanel, _ics: makeICS, _layers: function () { return layers.length; }, _report: openReport, _times: getTimes };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
