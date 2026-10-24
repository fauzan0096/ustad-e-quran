// ==========================================
// backup.js — Progress Backup / Restore (bina login, bina server)
// - Poora progress (sab profiles, XP, streak, exam, namaz, favourites, theme...) ek .json file mein
// - Nayi phone par wahi file restore karein, phir apne naam se login karein
// - Data kisi server par nahi jaata
// Use: FQBackup.open()   (Backup / Restore wali window)
// ==========================================
(function () {
    'use strict';

    var APP_ID = 'Fahm-ul-Quran';
    var FORMAT = 1;
    // Ye keys backup mein nahi jaatin: login session, aur cache/andar ki cheezein
    var SKIP_EXACT = { isLoggedIn: 1, userRole: 1, userId: 1, activeProfile: 1 };
    var SKIP_PREFIX = ['qariCache', 'fq_'];
    var LAST_KEY = 'fq_lastBackup';
    var SINCE_KEY = 'fq_bkSince';
    var NAG_KEY = 'fq_bkNagAt';
    var DAY = 86400000;

    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    function skipKey(k) {
        if (SKIP_EXACT[k]) return true;
        for (var i = 0; i < SKIP_PREFIX.length; i++) if (k.indexOf(SKIP_PREFIX[i]) === 0) return true;
        return false;
    }

    // Chhota checksum (file adhoori ya kharab ho to pakad lein)
    function checksum(str) {
        var h = 0x811c9dc5;
        for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
        return h.toString(16);
    }

    function readProfiles(src) {
        try { var v = JSON.parse(src); return Array.isArray(v) ? v.filter(function (p) { return p && p.id && p.name; }) : []; }
        catch (e) { return []; }
    }

    // ---------- Export ----------
    function collect() {
        var data = {};
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && !skipKey(k)) data[k] = localStorage.getItem(k);
            }
        } catch (e) {}
        return data;
    }

    function buildBackup() {
        var data = collect();
        return {
            app: APP_ID,
            format: FORMAT,
            created: new Date().toISOString(),
            profiles: readProfiles(data.profiles).map(function (p) { return p.name; }),
            check: checksum(JSON.stringify(data)),
            data: data
        };
    }

    function hasProgress() {
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && k.indexOf('p_') === 0) return true;
            }
        } catch (e) {}
        return false;
    }

    function fileName() {
        var d = new Date();
        function p(n) { return (n < 10 ? '0' : '') + n; }
        return 'Fahm-ul-Quran-backup-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '.json';
    }

    function markBackedUp() { lsSet(LAST_KEY, String(Date.now())); }

    function saveFile(mode) {
        if (!hasProgress()) { say('ℹ️ Abhi backup karne layak progress nahi hai. Pehle thoda sabaq karein.', 'warn'); return; }
        var json = JSON.stringify(buildBackup());
        var name = fileName();
        var blob = new Blob([json], { type: 'application/json' });

        // Android app (WebView): seedha Downloads mein
        if (mode !== 'share' && window.AndroidNS && typeof window.AndroidNS.saveDataUrl === 'function') {
            var fr = new FileReader();
            fr.onloadend = function () { try { window.AndroidNS.saveDataUrl(fr.result, name); markBackedUp(); render(); } catch (e) { say('❌ Backup save nahi ho saka.', 'err'); } };
            fr.readAsDataURL(blob);
            return;
        }

        // Share (WhatsApp / Drive / Files)
        if (mode === 'share') {
            try {
                var f = new File([blob], name, { type: 'application/json' });
                if (navigator.canShare && navigator.canShare({ files: [f] })) {
                    navigator.share({ files: [f], title: 'Fahm-ul-Quran backup' })
                        .then(function () { markBackedUp(); render(); })
                        .catch(function (e) { if (e && e.name !== 'AbortError') say('❌ Share nahi ho saka. "Download" try karein.', 'err'); });
                    return;
                }
            } catch (e) {}
            say('ℹ️ Is device par share nahi chal raha. "Download" dabayein.', 'warn');
            return;
        }

        // Aam browser: download
        try {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = name; a.style.display = 'none';
            document.body.appendChild(a); a.click();
            setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
            markBackedUp();
            say('✅ Backup file ban gayi: ' + name + '\nIse kisi safe jagah rakhein (Drive / WhatsApp / email).', 'ok');
            render();
        } catch (e) { say('❌ Backup file nahi ban saki.', 'err'); }
    }

    // ---------- Restore ----------
    var pending = null; // parse ho chuki file

    function parseBackup(text) {
        var obj;
        try { obj = JSON.parse(text); } catch (e) { return { err: 'Ye file sahi backup nahi lagti (padhi nahi ja saki).' }; }
        if (!obj || obj.app !== APP_ID || typeof obj.data !== 'object' || obj.data === null || Array.isArray(obj.data))
            return { err: 'Ye Fahm-ul-Quran ki backup file nahi hai.' };
        if (obj.format > FORMAT) return { err: 'Ye backup naye version ki hai. Pehle app update karein.' };
        var keys = Object.keys(obj.data);
        for (var i = 0; i < keys.length; i++) {
            if (typeof obj.data[keys[i]] !== 'string' || keys[i].length > 200)
                return { err: 'Backup file kharab hai.' };
        }
        if (obj.check && obj.check !== checksum(JSON.stringify(obj.data)))
            return { err: 'Backup file adhoori ya badli hui hai (check match nahi hua). Dobara banayi hui file use karein.' };
        if (!keys.some(function (k) { return k.indexOf('p_') === 0; }))
            return { err: 'Is backup mein koi progress nahi mila.' };
        return { ok: obj };
    }

    function applyRestore(obj) {
        var data = obj.data;
        // Profiles: purani + backup wali, id ke hisaab se mila do
        var local = readProfiles(lsGet('profiles'));
        var incoming = readProfiles(data.profiles);
        var seen = {}; var merged = [];
        incoming.concat(local).forEach(function (p) { if (!seen[p.id]) { seen[p.id] = 1; merged.push(p); } });

        var count = 0;
        Object.keys(data).forEach(function (k) {
            if (skipKey(k) || k === 'profiles') return;
            lsSet(k, data[k]); count++;
        });
        lsSet('profiles', JSON.stringify(merged));
        return count;
    }

    function pickFile() {
        var inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = '.json,application/json,text/plain,*/*';
        inp.style.display = 'none';
        inp.onchange = function () {
            var f = inp.files && inp.files[0];
            inp.remove();
            if (!f) return;
            if (f.size > 20 * 1024 * 1024) { say('❌ File bahut badi hai.', 'err'); return; }
            var fr = new FileReader();
            fr.onload = function () {
                var r = parseBackup(String(fr.result));
                if (r.err) { pending = null; say('❌ ' + r.err, 'err'); return; }
                pending = r.ok; renderConfirm();
            };
            fr.onerror = function () { say('❌ File padhi nahi ja saki.', 'err'); };
            fr.readAsText(f);
        };
        document.body.appendChild(inp);
        inp.click();
    }

    // ---------- UI ----------
    var overlay, box, msgEl;

    function css() {
        if (document.getElementById('fqbStyle')) return;
        var s = document.createElement('style');
        s.id = 'fqbStyle';
        s.textContent =
            '#fqbOv{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit}' +
            '#fqbBox{background:var(--card-bg,#fff);color:var(--text,#222);border-radius:18px;max-width:420px;width:100%;max-height:90vh;overflow:auto;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.45);text-align:left;direction:ltr;border:1px solid var(--border,#ddd)}' +
            '#fqbBox h3{margin:0 0 6px;font-size:20px;color:var(--primary,#0F4C3A)}' +
            '#fqbBox p,#fqbBox li{font-size:14px;line-height:1.55;margin:6px 0}' +
            '#fqbBox ul{padding-left:18px;margin:6px 0}' +
            '#fqbBox button{width:100%;padding:13px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;margin-top:10px;border:none}' +
            '#fqbBox .fqb-main{background:var(--primary,#0F4C3A);color:#fff}' +
            '#fqbBox .fqb-alt{background:transparent;color:var(--primary,#0F4C3A);border:1.5px solid var(--primary,#0F4C3A)}' +
            '#fqbBox .fqb-gold{background:linear-gradient(180deg,#E3C36E,#C79E3F);color:#2A2008}' +
            '#fqbBox .fqb-close{background:transparent;color:var(--text-light,#777);font-weight:600}' +
            '#fqbBox .fqb-msg{white-space:pre-line;padding:10px 12px;border-radius:10px;font-size:13px;margin-top:10px}' +
            '#fqbBox .fqb-ok{background:#e6f6ec;color:#14532d}#fqbBox .fqb-err{background:#fde8e8;color:#8a1c1c}#fqbBox .fqb-warn{background:#fff6dd;color:#6b4e00}' +
            '#fqbBox .fqb-meta{font-size:12px;color:var(--text-light,#777)}' +
            '#fqbBar{position:fixed;left:12px;right:12px;bottom:14px;z-index:99998;background:var(--card-bg,#fff);color:var(--text,#222);border:1.5px solid var(--primary,#0F4C3A);border-radius:14px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.3);font-size:14px;max-width:460px;margin:0 auto}' +
            '#fqbBar .row{display:flex;gap:8px;margin-top:8px}' +
            '#fqbBar button{flex:1;padding:9px;border-radius:10px;font-weight:700;cursor:pointer;border:none;font-size:13px}' +
            '#fqbBar .go{background:var(--primary,#0F4C3A);color:#fff}#fqbBar .no{background:transparent;color:var(--text-light,#777);border:1px solid var(--border,#ccc)}';
        document.head.appendChild(s);
    }

    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

    function fmtDate(ms) {
        try { return new Date(ms).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch (e) { return new Date(ms).toISOString().slice(0, 16).replace('T', ' '); }
    }

    function say(text, kind) {
        if (!box) { try { alert(text); } catch (e) {} return; }
        if (!msgEl) { msgEl = el('div', 'fqb-msg'); box.appendChild(msgEl); }
        msgEl.className = 'fqb-msg fqb-' + (kind || 'ok');
        msgEl.textContent = text;
    }

    function open() {
        css(); close();
        overlay = el('div'); overlay.id = 'fqbOv';
        box = el('div'); box.id = 'fqbBox';
        overlay.appendChild(box);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        document.body.appendChild(overlay);
        pending = null;
        render();
    }

    function close() {
        if (overlay) overlay.remove();
        overlay = box = msgEl = null;
    }

    function btn(cls, text, fn) { var b = el('button', cls, text); b.type = 'button'; b.onclick = fn; return b; }

    function render() {
        if (!box) return;
        box.innerHTML = ''; msgEl = null;
        box.appendChild(el('h3', '', '💾 Backup / Restore'));
        var last = parseInt(lsGet(LAST_KEY), 10);
        var names = readProfiles(lsGet('profiles')).map(function (p) { return p.name; });
        box.appendChild(el('p', '', 'Apna sara progress ek file mein save karein, aur nayi phone par wapas laayein. <b>Free hai, login ya server ki zaroorat nahi.</b>'));
        box.appendChild(el('p', 'fqb-meta',
            (names.length ? 'Is phone ki profiles: ' + esc(names.join(', ')) + '<br>' : '') +
            (last ? 'Aakhri backup: ' + esc(fmtDate(last)) : 'Abhi tak backup nahi liya.')));

        box.appendChild(btn('fqb-main', '⬇️ Backup file banayein', function () { saveFile('download'); }));
        if (navigator.canShare && !window.AndroidNS) box.appendChild(btn('fqb-alt', '📤 Share karein (WhatsApp / Drive)', function () { saveFile('share'); }));
        box.appendChild(btn('fqb-gold', '📂 Backup file se restore karein', pickFile));
        box.appendChild(el('p', 'fqb-meta', 'Tip: file ko WhatsApp “Mujhe message” / Google Drive / email par rakh lein. Phone badalte waqt wahi file restore karein, phir apne <b>usi naam</b> se login karein.'));
        box.appendChild(btn('fqb-close', 'Band karein', close));
    }

    function renderConfirm() {
        if (!box || !pending) return;
        box.innerHTML = ''; msgEl = null;
        var b = pending;
        var when = b.created ? Date.parse(b.created) : NaN;
        box.appendChild(el('h3', '', '📂 Restore ki tasdeeq'));
        box.appendChild(el('p', '',
            'Backup ki tareekh: <b>' + esc(isNaN(when) ? 'maloom nahi' : fmtDate(when)) + '</b>'));
        var prof = (b.profiles && b.profiles.length) ? b.profiles : readProfiles(b.data.profiles).map(function (p) { return p.name; });
        if (prof.length) box.appendChild(el('p', '', 'Profiles: <b>' + esc(prof.join(', ')) + '</b>'));
        box.appendChild(el('ul', '',
            '<li>Backup wali profiles ka progress is phone par <b>badal jayega</b>.</li>' +
            '<li>Is phone ki baaki profiles (jo backup mein nahi) <b>safe rahengi</b>.</li>'));
        box.appendChild(btn('fqb-main', '✅ Haan, restore karein', function () {
            var n = applyRestore(pending);
            var loggedIn = lsGet('isLoggedIn') === 'true';
            pending = null;
            box.innerHTML = '';
            box.appendChild(el('h3', '', '✅ Restore ho gaya'));
            box.appendChild(el('p', '', n + ' cheezein wapas aa gayin.' + (loggedIn ? ' App dobara khul rahi hai…' : ' Ab apne <b>usi naam</b> se login karein, aapka progress mil jayega.')));
            setTimeout(function () { location.reload(); }, 1600);
        }));
        box.appendChild(btn('fqb-close', 'Cancel', function () { pending = null; render(); }));
    }

    // ---------- Yaad-dehani (hafte mein ek baar, sirf jab progress ho) ----------
    function nagIfNeeded() {
        try {
            if (lsGet('isLoggedIn') !== 'true' || !hasProgress()) return;
            var now = Date.now();
            var since = parseInt(lsGet(SINCE_KEY), 10);
            if (!since) { lsSet(SINCE_KEY, String(now)); return; }
            var last = parseInt(lsGet(LAST_KEY), 10) || 0;
            var ref = last || since;
            var limit = last ? 7 * DAY : 3 * DAY;      // pehla backup 3 din baad, phir har hafta
            if (now - ref < limit) return;
            var shown = parseInt(lsGet(NAG_KEY), 10) || 0;
            if (now - shown < DAY) return;             // din mein ek baar se zyada nahi
            lsSet(NAG_KEY, String(now));
            css();
            var bar = el('div'); bar.id = 'fqbBar';
            bar.innerHTML = '💾 ' + (last ? 'Aapne kaafi din se backup nahi liya.' : 'Aapne abhi tak progress ka backup nahi liya.') + ' Phone badalne par progress bach jayega.';
            var row = el('div', 'row');
            row.appendChild(btn('go', 'Backup lein', function () { bar.remove(); open(); }));
            row.appendChild(btn('no', 'Baad mein', function () { bar.remove(); }));
            bar.appendChild(row);
            document.body.appendChild(bar);
        } catch (e) {}
    }

    // ---------- Storage ko browser se delete hone se bachana ----------
    function persist() {
        try {
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persisted().then(function (p) { if (!p) navigator.storage.persist(); }).catch(function () {});
            }
        } catch (e) {}
    }

    window.FQBackup = { open: open, close: close, exportNow: function () { saveFile('download'); }, hasProgress: hasProgress, _t: { buildBackup: buildBackup, parseBackup: parseBackup, applyRestore: applyRestore } };

    function init() {
        persist();
        if (document.getElementById('mainApp')) setTimeout(nagIfNeeded, 6000);   // sirf main app page par
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
