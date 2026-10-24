/* namaz.js — Quraan Ustad
   🕌 Azan ke waqt 20 min ka lock   📋 Roz ek baar "poori namaz padhi?"   📅 Azan alarms (Calendar)
   Install: har page ke <head> mein ek line:  <script src="namaz.js" defer></script>
   Dhyan: web app phone ko system-level lock nahi kar sakti. Ye lock APP ke andar chalta hai
   (azan ke 20 min tak app khulte hi poori screen band rehti hai, reload se bhi nahi hatti). */
(function () {
    'use strict';

    var LOCK_MIN = 20;
    var HOLD_MS = 5000;
    var PR = [
        { k: 'Fajr',    n: 'Fajr',    i: '🌅' },
        { k: 'Dhuhr',   n: 'Zuhr',    i: '☀️' },
        { k: 'Asr',     n: 'Asr',     i: '🌤️' },
        { k: 'Maghrib', n: 'Maghrib', i: '🌇' },
        { k: 'Isha',    n: 'Isha',    i: '🌙' }
    ];

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

    // ---------- lock ----------
    function lockOn() { return lsGet('ns_on') !== '0'; }
    function skipKey(date, k) { return date + '_' + k; }
    function bypassed(date, k) { return (jget('ns_skip', [])).indexOf(skipKey(date, k)) >= 0; }
    function addBypass(date, k) { var a = jget('ns_skip', []); a.push(skipKey(date, k)); jset('ns_skip', a.slice(-12)); }

    var testUntil = 0;
    function activeWindow() {
        var T = getTimes(); if (!T) return null;
        var now = Date.now(), found = null;
        [-1, 0].forEach(function (off) {              // kal ki Isha raat 12 ke baad tak chale to bhi pakde
            var base = new Date(); base.setDate(base.getDate() + off);
            PR.forEach(function (p) {
                var m = toMin(T.t[p.k]); if (m == null) return;
                var s = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, m, 0, 0).getTime();
                var e = s + LOCK_MIN * 60000;
                if (now >= s && now < e && !bypassed(dstr(base), p.k)) found = { p: p, start: s, end: e, date: dstr(base) };
            });
        });
        return found;
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

    var CSS =
        '.ns-lock{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center;color:#fff;' +
        'background:radial-gradient(120% 90% at 50% 0%,#17614B 0%,#06201A 75%);font-family:Figtree,system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}' +
        '.ns-lock .ns-ar{font-family:Amiri,serif;font-size:34px;color:#D9B65A;line-height:1.7;direction:rtl}' +
        '.ns-lock .ns-ic{font-size:64px;animation:nsPulse 2.4s ease-in-out infinite}' +
        '.ns-lock h2{margin:0;font-size:26px}' +
        '.ns-lock .ns-sub{font-size:15px;opacity:.85;line-height:1.7;max-width:340px}' +
        '.ns-lock .ns-count{font-size:56px;font-weight:800;letter-spacing:2px;font-variant-numeric:tabular-nums;color:#fff;margin:4px 0}' +
        '.ns-lock .ns-dua{max-width:360px;background:rgba(255,255,255,.08);border:1px solid rgba(217,182,90,.4);border-radius:16px;padding:12px 14px}' +
        '.ns-lock .ns-dua .ar{font-family:Amiri,serif;font-size:20px;line-height:2;direction:rtl;color:#fff}' +
        '.ns-lock .ns-dua small{display:block;font-size:11.5px;opacity:.75;line-height:1.6;margin-top:4px}' +
        '.ns-hold{margin-top:10px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.35);border-radius:14px;padding:10px 16px;font-size:12.5px;opacity:.75;background:transparent;color:#fff;cursor:pointer}' +
        '.ns-hold i{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(217,182,90,.45)}' +
        '.ns-hold span{position:relative}' +
        '@keyframes nsPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}' +
        '@media (prefers-reduced-motion:reduce){.ns-lock .ns-ic{animation:none}}' +

        '.ns-modal{position:fixed;inset:0;background:rgba(4,16,12,.72);backdrop-filter:blur(4px);z-index:2500;display:flex;justify-content:center;align-items:center;padding:16px}' +
        '.ns-box{background:var(--card-bg,#fffdf6);color:var(--text,#1F2A25);width:100%;max-width:480px;max-height:90vh;overflow-y:auto;border-radius:22px;border:1px solid var(--border,#D9D6C3);border-top:4px solid var(--secondary,#B8923A);padding:20px 16px 18px;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.4);font-family:Figtree,system-ui,sans-serif;text-align:left}' +
        '.ns-box h2{margin:0 0 4px;padding:0 36px;text-align:center;font-size:20px;color:var(--ink,#0A2E24)}' +
        '.ns-x{position:absolute;top:10px;right:12px;width:34px;height:34px;border-radius:50%;border:none;background:var(--soft-bg,#F4F1E3);color:var(--text,#1F2A25);font-size:20px;cursor:pointer}' +
        '.ns-next{text-align:center;font-size:13px;color:var(--text-light,#55645C);margin-bottom:10px;line-height:1.7}' +
        '.ns-next b{color:var(--text,#1F2A25);font-size:15px}' +
        '.ns-row{display:flex;align-items:center;gap:8px;padding:8px 10px;margin:6px 0;border-radius:14px;background:var(--soft-bg,#F4F1E3);border:1.5px solid transparent}' +
        '.ns-row.done{border-color:var(--primary,#0F4C3A);background:rgba(15,76,58,.1)}' +
        '.ns-row .nm{flex:1;font-weight:700;font-size:14px}' +
        '.ns-row input[type=time]{padding:6px 8px;border:1px solid var(--border,#D9D6C3);border-radius:10px;background:var(--card-bg,#fff);color:var(--text,#1F2A25);font:600 14px Figtree,sans-serif}' +
        '.ns-tick{width:42px;height:42px;border-radius:50%;border:2px solid var(--border,#D9D6C3);background:transparent;font-size:20px;cursor:pointer;color:var(--text,#1F2A25);flex:0 0 auto}' +
        '.ns-row.done .ns-tick{background:var(--primary,#0F4C3A);border-color:var(--primary,#0F4C3A);color:#fff}' +
        '.ns-sec{font-weight:800;font-size:13px;margin:14px 0 6px;color:var(--text-light,#55645C)}' +
        '.ns-stat{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:8px 0}' +
        '.ns-stat span{font-size:12.5px;font-weight:700;padding:6px 12px;border-radius:14px;background:var(--soft-bg,#F4F1E3)}' +
        '.ns-week{display:flex;justify-content:space-between;gap:4px;margin:6px 0}' +
        '.ns-week div{flex:1;text-align:center;font-size:10.5px;color:var(--text-light,#55645C)}' +
        '.ns-week div b{display:block;font-size:20px;line-height:1.4}' +
        '.ns-btn{display:block;width:100%;margin-top:8px;padding:12px 14px;border:none;border-radius:14px;font-weight:700;font-size:14px;cursor:pointer;background:linear-gradient(180deg,#17614B,var(--primary,#0F4C3A));color:#fff;font-family:inherit}' +
        '.ns-btn.gold{background:linear-gradient(180deg,#E3C36E,#C79E3F);color:#2A2008}' +
        '.ns-btn.ghost{background:transparent;color:var(--text,#1F2A25);border:1.5px solid var(--border,#D9D6C3)}' +
        '.ns-set{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 2px;font-size:13.5px}' +
        '.ns-set select{padding:7px 8px;border-radius:10px;border:1px solid var(--border,#D9D6C3);background:var(--card-bg,#fff);color:var(--text,#1F2A25);font:600 13px Figtree,sans-serif}' +
        '.ns-note{font-size:11.5px;line-height:1.7;color:var(--text-light,#55645C);margin-top:8px}' +
        '.rp-boxes{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:8px 0}' +
        '.rp-box{background:var(--soft-bg,#F4F1E3);border-radius:12px;padding:8px 4px;text-align:center}' +
        '.rp-n{font-size:11px;font-weight:700}.rp-v{font-size:19px;font-weight:800;margin-top:2px}.rp-v small{font-size:10px;font-weight:600;color:var(--text-light,#55645C)}' +
        '.rp-bar{height:5px;border-radius:5px;background:var(--border,#D9D6C3);overflow:hidden;margin:4px 4px}.rp-bar u{display:block;height:100%;background:#2e9d62;border-radius:5px}' +
        '.rp-m{font-size:10px;color:#c0392b;font-weight:700}' +
        '.rp-scroll{overflow-x:auto;padding-bottom:4px}.rp-t{border-collapse:separate;border-spacing:2px;margin:0 auto}' +
        '.rp-t th{font-size:9px;font-weight:600;color:var(--text-light,#55645C);min-width:16px}.rp-t th.rn{font-size:14px;position:sticky;left:0;background:var(--card-bg,#fff)}' +
        '.rp-c{display:block;width:16px;height:16px;border-radius:4px;border:none;padding:0}.rp-c.y{background:#2e9d62}.rp-c.n{background:#d64545}.rp-c.x{background:var(--soft-bg,#ddd);opacity:.7}' +
        '.ns-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0}' +
        '.ns-chip{padding:10px 14px;border-radius:22px;border:2px solid var(--border,#D9D6C3);background:var(--soft-bg,#F4F1E3);font-weight:700;font-size:14px;cursor:pointer;color:var(--text,#1F2A25);font-family:inherit}' +
        '.ns-chip.on{background:var(--primary,#0F4C3A);border-color:var(--primary,#0F4C3A);color:#fff}' +
        '#namazCard .ns-card{margin:12px auto 0;background:var(--card-bg,#fffdf6);border:1px solid var(--border,#D9D6C3);border-radius:16px;padding:14px 16px;box-shadow:var(--shadow);display:flex;align-items:center;gap:12px;cursor:pointer;width:100%;text-align:left;color:var(--text,#1F2A25);font-family:inherit}' +
        '#namazCard .ns-card .ic{font-size:30px}#namazCard .ns-card .mid{flex:1;min-width:0}' +
        '#namazCard .ns-card b{display:block;font-size:15px}#namazCard .ns-card small{display:block;font-size:12px;color:var(--text-light,#55645C);margin-top:2px;line-height:1.6}' +
        '#namazCard .ns-dots{font-size:15px;letter-spacing:2px;white-space:nowrap}';
    var styled = false;
    function injectCSS() { if (styled) return; styled = true; var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

    // ---------- lock screen ----------
    var lockEl = null, holdT = null, holdStart = 0, currentWin = null;
    function fmtCount(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }

    function showLock(w) {
        injectCSS();
        if (!lockEl) {
            lockEl = document.createElement('div');
            lockEl.className = 'ns-lock'; lockEl.id = 'nsLock';
            lockEl.setAttribute('role', 'alertdialog'); lockEl.setAttribute('aria-modal', 'true');
            lockEl.innerHTML =
                '<div class="ns-ic" id="nsIc"></div>' +
                '<div class="ns-ar">حَيَّ عَلَى الصَّلَاةِ</div>' +
                '<h2 id="nsTitle"></h2>' +
                '<div class="ns-sub" id="nsSub"></div>' +
                '<div class="ns-count" id="nsCount">20:00</div>' +
                '<div class="ns-dua"><div class="ar">اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ</div>' +
                '<small>Azan ke baad ki dua — pehle ye padhein, phir namaz ki taiyari karein 🤲</small></div>' +
                '<button class="ns-hold" id="nsHold" type="button"><i></i><span>Zaroori kaam? Yahan 5 second dabaye rakhein</span></button>';
            document.body.appendChild(lockEl);
            document.documentElement.style.overflow = 'hidden';
            try { document.querySelectorAll('audio').forEach(function (a) { a.pause(); }); if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
            try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
            var hold = lockEl.querySelector('#nsHold'), bar = hold.querySelector('i');
            var stop = function () { clearInterval(holdT); holdT = null; bar.style.width = '0'; };
            hold.addEventListener('pointerdown', function (e) {
                e.preventDefault(); holdStart = Date.now(); clearInterval(holdT);
                holdT = setInterval(function () {
                    var f = (Date.now() - holdStart) / HOLD_MS; bar.style.width = Math.min(100, f * 100) + '%';
                    if (f >= 1) { stop(); if (currentWin) { if (!currentWin.test) addBypass(currentWin.date, currentWin.p.k); else testUntil = 0; } hideLock(); toast('Lock hata diya — namaz zaroor padhein 🤲'); }
                }, 80);
            });
            ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { hold.addEventListener(ev, stop); });
            hold.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        }
        var firstShow = !currentWin || currentWin.p.k !== w.p.k;
        currentWin = w;
        if (firstShow && (w.test || Date.now() - w.start < 60000)) playAzan();
        lockEl.querySelector('#nsIc').textContent = w.p.i;
        lockEl.querySelector('#nsTitle').textContent = w.test ? 'Lock ka test' : w.p.n + ' ki azan ho gayi';
        lockEl.querySelector('#nsSub').textContent = w.test ? 'Aise lock dikhega. 10 second mein apne aap khul jayega.' : 'Phone/App 20 minute ke liye band hai. Namaz padhein, phir wapas aayein — Allah qubool farmaye 🤍';
        lockEl.querySelector('#nsCount').textContent = fmtCount(w.end - Date.now());
    }
    function hideLock() {
        if (!lockEl) return;
        clearInterval(holdT); holdT = null; stopAzan();
        lockEl.remove(); lockEl = null; currentWin = null;
        document.documentElement.style.overflow = '';
    }

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
                '<div class="ns-chips">' + PR.map(function (p, i) { return '<button type="button" class="ns-chip ' + (arr[i] ? 'on' : '') + '" data-i="' + i + '">' + p.i + ' ' + p.n + (arr[i] ? ' ✓' : '') + '</button>'; }).join('') + '</div>' +
                '<button type="button" class="ns-btn gold" data-a="all">✅ Alhamdulillah, sab padhi (+25 XP)</button>' +
                '<button type="button" class="ns-btn" data-a="save">💾 Jo tick kiya wo save karein</button>' +
                '<button type="button" class="ns-btn ghost" data-a="later">Baad mein</button></div>';
        }
        function close() { if (askEl) { askEl.remove(); askEl = null; } renderCard(); setTimeout(maybeAsk, 600); }
        function finish() {
            var xp = saveDay(date, arr);
            if (isFull(arr)) { toast('🌟 MashaAllah! Poori namaz' + (xp ? ' — +25 XP' : '') + ' • 🔥 ' + streak() + ' din'); try { window.QSSFX && QSSFX.win(); } catch (e) {} }
            else toast('Jazakallah. Jo reh gayi uski qaza padh lein, kal poori koshish karein 🤍');
            close();
        }
        askEl.addEventListener('click', function (e) {
            var c = e.target.closest ? e.target.closest('[data-i]') : null;
            if (c) { var i = +c.dataset.i; arr[i] = arr[i] ? 0 : 1; draw(); return; }
            var b = e.target.closest ? e.target.closest('[data-a]') : null;
            if (!b) return;
            if (b.dataset.a === 'all') { arr = [1, 1, 1, 1, 1]; finish(); }
            else if (b.dataset.a === 'save') finish();
            else close();
        });
        draw(); document.body.appendChild(askEl);
    }

    // ---------- Calendar alarms (.ics) ----------
    function icsDate(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
    function makeICS() {
        var loc = jget('ns_loc', null);
        if (!loc) { toast('Pehle "Location se waqt lein" dabayein'); return Promise.resolve(); }
        var now = new Date(), months = [[now.getFullYear(), now.getMonth() + 1]];
        months.push(now.getMonth() === 11 ? [now.getFullYear() + 1, 1] : [now.getFullYear(), now.getMonth() + 2]);
        toast('📅 Waqt jama ho rahe hain...');
        return Promise.all(months.map(function (ym) {
            return fetch(apiURL('calendar/' + ym[0] + '/' + ym[1], loc)).then(function (r) { return r.json(); }).then(function (j) { return j.data; });
        })).then(function (arrs) {
            var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Quraan Ustad//Namaz//EN', 'CALSCALE:GREGORIAN'];
            var today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(), n = 0;
            arrs.forEach(function (days) {
                days.forEach(function (day) {
                    var g = day.date.gregorian.date.split('-');            // DD-MM-YYYY
                    var base = new Date(+g[2], +g[1] - 1, +g[0]);
                    if (base.getTime() < today0) return;
                    PR.forEach(function (p) {
                        var m = toMin(day.timings[p.k]); if (m == null) return;
                        var s = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, m, 0), e = new Date(s.getTime() + LOCK_MIN * 60000);
                        L.push('BEGIN:VEVENT', 'UID:ns-' + icsDate(s) + '-' + p.k + '@quraan-ustad', 'DTSTAMP:' + icsDate(new Date()),
                            'DTSTART:' + icsDate(s), 'DTEND:' + icsDate(e), 'SUMMARY:🕌 ' + p.n + ' ki azan — namaz ka waqt',
                            'DESCRIPTION:Namaz padhein, phir Quraan Ustad kholein 🤲',
                            'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:' + p.n + ' ki azan', 'END:VALARM', 'END:VEVENT');
                        n++;
                    });
                });
            });
            L.push('END:VCALENDAR');
            var blob = new Blob([L.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'azan-alarms.ics';
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
            toast('📥 ' + n + ' azan alarm ki file ban gayi — kholkar Calendar mein add karein');
        }).catch(function () { toast('❌ Internet nahi ya waqt nahi mile'); });
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
    function closeReport() { if (repEl) { repEl.remove(); repEl = null; } setTimeout(maybeAsk, 600); }
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
        }
        repTab = tab || 0; drawReport();
        if (auto) { var m = monthOf(-repTab), k = monthKey(m.y, m.m), r = jget(P('namazReported'), []); if (r.indexOf(k) < 0) { r.push(k); jset(P('namazReported'), r.slice(-6)); } }
    }
    function drawReport() {
        if (!repEl) return;
        var mo = monthOf(-repTab), st = monthStats(mo.y, mo.m), log = getLog(), todayS = dayOff(0);
        var pct = st.total ? Math.round(st.prayed * 100 / st.total) : 0;
        var verdict = !st.days ? 'Is mahine ka koi din abhi gina nahi gaya.' :
            pct >= 95 ? '🌟 MashaAllah! Bohot behtareen mahina — Allah qubool farmaye.' :
            pct >= 75 ? '👍 Achha raha. Thodi aur koshish — chhooti hui namazein qaza padh lein.' :
            pct >= 40 ? '🤍 Koi baat nahi, agle mahine himmat karein. Chhooti hui namazein qaza padh lein.' :
            '🤲 Allah se dua karein ke namaz ki aadat de. Aaj se hi shuru kar lein — har namaz ginti mein aayegi.';
        var boxes = PR.map(function (p, i) {
            var pp = st.days ? Math.round(st.per[i] * 100 / st.days) : 0;
            return '<div class="rp-box"><div class="rp-n">' + p.i + ' ' + p.n + '</div><div class="rp-v">' + st.per[i] + '<small>/' + st.days + '</small></div>' +
                '<div class="rp-bar"><u style="width:' + pp + '%"></u></div><div class="rp-m">❌ ' + (st.days - st.per[i]) + ' chhooti</div></div>';
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
        repEl.innerHTML = '<div class="ns-box">' +
            '<button class="ns-x" data-a="rclose" aria-label="Band">&times;</button>' +
            '<h2>📊 ' + MONTHS[mo.m] + ' ' + mo.y + ' ka hisaab</h2>' +
            '<div class="ns-chips" style="margin:8px 0"><button class="ns-chip ' + (repTab === 0 ? 'on' : '') + '" data-rm="0">Is mahine</button><button class="ns-chip ' + (repTab === 1 ? 'on' : '') + '" data-rm="1">Pichla mahina</button></div>' +
            '<div class="ns-stat"><span>✅ ' + st.prayed + ' padhi</span><span>❌ ' + st.missed + ' chhooti</span><span>📈 ' + pct + '%</span><span>🌟 ' + st.full + ' din poori</span></div>' +
            '<div class="ns-next">' + verdict + '<br><small>Kul ' + st.total + ' namazein (' + st.days + ' din × 5)</small></div>' +
            '<div class="rp-boxes">' + boxes + '</div>' +
            '<div class="ns-sec">DIN-BA-DIN (box dabakar badal sakte hain)</div>' +
            '<div class="rp-scroll"><table class="rp-t">' + head + rows + '</table></div>' +
            '<div class="ns-note">🟩 padhi • 🟥 chhooti • ⬜ abhi baaki. Sirf is mahine aur pichle mahine ka data rakha jata hai.</div>' +
            '<button class="ns-btn ghost" data-a="rclose">Theek hai</button></div>';
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
    function closePanel() { if (panelEl) { panelEl.remove(); panelEl = null; } renderCard(); }

    function openPanel() {
        injectCSS();
        if (panelEl) return;
        panelEl = document.createElement('div'); panelEl.className = 'ns-modal'; panelEl.id = 'nsPanel';
        panelEl.addEventListener('click', onPanelClick);
        panelEl.addEventListener('change', onPanelChange);
        document.body.appendChild(panelEl);
        drawPanel();
    }

    function drawPanel() {
        if (!panelEl) return;
        var T = getTimes(), today = dayOff(0), arr = dayArr(today), nx = nextPrayer(), loc = jget('ns_loc', null);
        var week = '', o;
        var dn = ['Itwar', 'Peer', 'Mangal', 'Budh', 'Jumeraat', 'Jumma', 'Hafta'];
        for (o = 6; o >= 0; o--) { var dd = new Date(); dd.setDate(dd.getDate() - o); var cc = count(dayArr(dstr(dd))); week += '<div><b>' + (cc === 5 ? '🟢' : cc > 0 ? '🟡' : '⚪') + '</b>' + dn[dd.getDay()].slice(0, 4) + '</div>'; }

        panelEl.innerHTML = '<div class="ns-box">' +
            '<button class="ns-x" data-a="close" aria-label="Band">&times;</button>' +
            '<h2>🕌 Namaz ka Hisaab</h2>' +
            '<div class="ns-next">' + (nx ? 'Agli namaz: <b>' + nx.p.i + ' ' + nx.p.n + '</b> • ' + fmt12(nx.time) + '<br>' + untilText(nx.at - Date.now()) + ' baaki' : 'Azan ke waqt set karein 👇') + '</div>' +
            '<div class="ns-stat"><span>✅ Aaj ' + count(arr) + '/5</span><span>🔥 Poori namaz ' + streak() + ' din</span></div>' +
            PR.map(function (p, i) {
                return '<div class="ns-row ' + (arr[i] ? 'done' : '') + '"><span class="nm">' + p.i + ' ' + p.n + '</span>' +
                    '<input type="time" data-t="' + p.k + '" value="' + esc(T ? T.t[p.k] : '') + '" aria-label="' + p.n + ' ka waqt">' +
                    '<button class="ns-tick" data-p="' + i + '" aria-label="' + p.n + ' padh li">' + (arr[i] ? '✓' : '') + '</button></div>';
            }).join('') +
            '<div class="ns-note">Time box = azan ka waqt (badal sakte hain). ✓ = aaj padh li. Poori 5 par +25 XP.</div>' +
            '<button class="ns-btn gold" data-a="report">📊 Mahine ka hisaab (5 boxes)</button>' +
            '<div class="ns-sec">PICHLE 7 DIN</div><div class="ns-week">' + week + '</div>' +
            '<div class="ns-sec">SETTINGS</div>' +
            '<button class="ns-btn gold" data-a="loc">📍 ' + (loc ? 'Waqt dobara lein (location se)' : 'Location se azan ke waqt lein') + '</button>' +
            '<div class="ns-set"><span>🔒 Azan par 20 min lock</span><input type="checkbox" id="nsOn" ' + (lockOn() ? 'checked' : '') + ' style="width:22px;height:22px"></div>' +
            '<div class="ns-set"><span>🔊 Azan ki awaaz</span><select id="nsSnd">' + ['aksa', 'sweet', 'third', 'off'].map(function (k) { return '<option value="' + k + '" ' + (sndPref() === k ? 'selected' : '') + '>' + SND_NAME[k] + '</option>'; }).join('') + '</select></div>' +
            '<button class="ns-btn ghost" data-a="snd">▶️ Awaaz sunein</button>' +
            '<div class="ns-set"><span>Asr ka hisaab</span><select id="nsSchool"><option value="1" ' + (school() === '1' ? 'selected' : '') + '>Hanafi</option><option value="0" ' + (school() === '0' ? 'selected' : '') + '>Shafi / Maliki / Hanbali</option></select></div>' +
            '<button class="ns-btn ghost" data-a="ics">📅 Phone Calendar mein azan alarm (2 mahine)</button>' +
            '<button class="ns-btn ghost" data-a="test">🧪 Lock ka test (10 sec)</button>' +
            '<div class="ns-note">ℹ️ Web app phone ko system-level lock nahi kar sakti. Ye lock app ke <b>andar</b> chalta hai: azan ke 20 min tak app khulte hi poori screen band rehti hai (reload se bhi nahi hatti). App band ho tab bhi yaad dilane ke liye upar wala <b>Calendar alarm</b> lagayein.' + (isAdmin() ? '<br>👑 Admin par lock nahi lagta (sirf test chalta hai).' : '') + '</div>' +
            '</div>';
    }

    function onPanelClick(e) {
        if (e.target === panelEl) { closePanel(); return; }
        var t = e.target.closest ? e.target.closest('[data-p],[data-a]') : null; if (!t) return;
        if (t.dataset.p != null) {
            var i = +t.dataset.p, d = dayOff(0), arr = dayArr(d); arr[i] = arr[i] ? 0 : 1;
            var xp = saveDay(d, arr);
            if (isFull(arr)) toast('🌟 MashaAllah! Aaj ki poori namaz' + (xp ? ' • +25 XP' : ''));
            drawPanel(); return;
        }
        var a = t.dataset.a;
        if (a === 'close') closePanel();
        else if (a === 'test') { testUntil = Date.now() + 10000; closePanel(); tick(); }
        else if (a === 'ics') makeICS();
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
        if (t.id === 'nsOn') { lsSet('ns_on', t.checked ? '1' : '0'); toast(t.checked ? '🔒 Azan lock chalu' : 'Azan lock band'); tick(); return; }
        if (t.id === 'nsSnd') { lsSet('ns_snd', t.value); stopAzan(); playAzan(); return; }
        if (t.id === 'nsSchool') { lsSet('ns_school', t.value); if (jget('ns_loc', null)) refreshTimes(true).then(function () { drawPanel(); }); return; }
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
        var dots = arr.map(function (v) { return v ? '🟢' : '⚪'; }).join('');
        var main = T && nx ? ('<b>Agli: ' + nx.p.i + ' ' + nx.p.n + ' • ' + fmt12(nx.time) + '</b><small>' + untilText(nx.at - Date.now()) + ' baaki • 🔥 ' + streak() + ' din poori namaz</small>')
                           : '<b>Azan ke waqt set karein</b><small>Tap karein — location se waqt aa jayenge, azan par 20 min lock lagega</small>';
        var html = '<button type="button" class="ns-card" id="nsCardBtn"><span class="ic">🕌</span><span class="mid">' + main + '</span><span class="ns-dots">' + dots + '</span></button>';
        if (box.dataset.h !== html) { box.innerHTML = html; box.dataset.h = html; document.getElementById('nsCardBtn').onclick = openPanel; }
    }

    // ---------- main tick ----------
    function tick() {
        var w = null;
        if (testUntil > Date.now()) w = { p: { n: 'Test', i: '🧪', k: 'test' }, start: Date.now(), end: testUntil, test: true, date: '' };
        else if (lockOn() && !isAdmin()) w = activeWindow();
        if (w) showLock(w);
        else if (lockEl) {
            var wasReal = currentWin && !currentWin.test; hideLock();
            if (wasReal) { toast('🤲 Namaz ke baad: Allah qubool farmaye'); setTimeout(maybeAsk, 1500); }
        }
        if (lockEl && currentWin) lockEl.querySelector('#nsCount').textContent = fmtCount(currentWin.end - Date.now());
        renderCard();
    }

    function maybeAsk() {
        if (lockEl || askEl || panelEl || repEl || window.qsSplashActive) return;
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
        document.addEventListener('visibilitychange', function () { if (!document.hidden) { tick(); refreshTimes(false); setTimeout(maybeAsk, 800); } });
        // pehli baar: waqt set karne ki yaad (ek baar)
        setTimeout(function () {
            if (loggedIn() && !getTimes() && !jget('ns_loc', null) && lsGet('ns_setupAsked') !== '1' && !lockEl && !window.qsSplashActive) {
                lsSet('ns_setupAsked', '1'); openPanel();
            } else maybeAsk();
        }, 2800);
    }

    window.NS = { open: openPanel, test: function () { testUntil = Date.now() + 10000; tick(); }, _report: openReport, _times: getTimes, _active: activeWindow };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
