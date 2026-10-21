/* Install popup + service worker (shared by index.html, dua.html, tajweed.html, games.html)
   - Link khulte hi neeche se popup aata hai (Android / iOS / in-app browser sab handle)
   - "Baad mein" dabane par 1 din tak dobara nahi aata
   - Install hone ke baad kabhi nahi aata */
(function () {
    // ---------- Service worker ----------
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () {});
        });
    }

    // ---------- Helpers ----------
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    if (standalone) { lsSet('qsInstalled', '1'); return; }
    if (lsGet('qsInstalled') === '1') return;

    var SNOOZE_MS = 24 * 60 * 60 * 1000; // 1 din
    function snoozed() {
        var t = parseInt(lsGet('qsInstallSnooze') || '0', 10);
        return t && Date.now() - t < SNOOZE_MS;
    }

    var ua = navigator.userAgent || '';
    var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /android/i.test(ua);
    // Facebook / Instagram / WhatsApp / Snapchat / Line etc. ke andar ka browser — yahan install nahi hota
    var inApp = /FBAN|FBAV|FB_IAB|Instagram|Snapchat|Line\/|MicroMessenger|Twitter|; wv\)|GSA\//i.test(ua);
    // iPhone par sirf Safari install karwa sakta hai
    var iosNotSafari = isIOS && /CriOS|FxiOS|EdgiOS|OPiOS|GSA/i.test(ua);

    var deferred = null;
    var root = null, titleEl, msgEl, stepsEl, mainBtn, laterBtn;

    // ---------- UI ----------
    function css() {
        var st = document.createElement('style');
        st.textContent =
            '#qsInst{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:flex-end;justify-content:center;' +
            'background:rgba(4,16,12,.62);opacity:0;transition:opacity .25s;font-family:Figtree,Poppins,system-ui,sans-serif}' +
            '#qsInst.show{opacity:1}' +
            '#qsInst .qs-sheet{width:100%;max-width:460px;background:#FFFDF6;color:#1F2A25;border-radius:26px 26px 0 0;' +
            'border-top:4px solid #D9B65A;padding:26px 20px calc(20px + env(safe-area-inset-bottom));text-align:center;' +
            'box-shadow:0 -14px 50px rgba(0,0,0,.45);transform:translateY(100%);transition:transform .4s cubic-bezier(.2,.9,.3,1)}' +
            '#qsInst.show .qs-sheet{transform:translateY(0)}' +
            '#qsInst .qs-ico{width:76px;height:76px;border-radius:20px;border:2px solid #D9B65A;box-shadow:0 8px 22px rgba(0,0,0,.3);' +
            'margin:-64px auto 10px;display:block;background:#0A2E24;object-fit:cover}' +
            '#qsInst h2{font-size:21px;line-height:1.25;color:#0A2E24;margin:0 0 6px;font-weight:700}' +
            '#qsInst p{font-size:14px;line-height:1.55;color:#55645C;margin:0 0 4px}' +
            '#qsInst ul{list-style:none;padding:0;margin:12px 0 4px;text-align:left;font-size:13.5px;color:#1F2A25}' +
            '#qsInst li{padding:5px 2px}' +
            '#qsInst ol{margin:12px 0 4px;padding:12px 14px 12px 34px;text-align:left;font-size:14px;line-height:1.7;background:#F4F1E3;border-radius:14px}' +
            '#qsInst button{border:none;cursor:pointer;font-family:inherit;font-weight:700;border-radius:14px;width:100%;min-height:50px;font-size:16px}' +
            '#qsInst .qs-main{background:linear-gradient(180deg,#17614B,#0F4C3A);color:#fff;margin-top:14px;box-shadow:0 6px 16px rgba(15,76,58,.35)}' +
            '#qsInst .qs-main:active{transform:translateY(1px)}' +
            '#qsInst .qs-later{background:transparent;color:#55645C;margin-top:6px;font-size:14px;font-weight:600;min-height:44px}' +
            '@media (prefers-reduced-motion:reduce){#qsInst,#qsInst .qs-sheet{transition:none}}';
        document.head.appendChild(st);
    }

    function build() {
        if (root) return;
        css();
        root = document.createElement('div');
        root.id = 'qsInst';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-labelledby', 'qsInstTitle');
        root.innerHTML =
            '<div class="qs-sheet">' +
              '<img class="qs-ico" src="icon-192.png" alt="">' +
              '<h2 id="qsInstTitle">Quraan Ustad app install karein</h2>' +
              '<p id="qsInstMsg">Home screen par app ki tarah kholein.</p>' +
              '<ul id="qsInstPerks">' +
                '<li>⚡ Ek tap mein khule, browser ki zaroorat nahi</li>' +
                '<li>📴 Internet ke baghair bhi chale</li>' +
                '<li>🔥 Roz ka sabaq aur streak saath rahe</li>' +
              '</ul>' +
              '<div id="qsInstSteps"></div>' +
              '<button class="qs-main" id="qsInstMain">📲 Install karein</button>' +
              '<button class="qs-later" id="qsInstLater">Baad mein</button>' +
            '</div>';
        document.body.appendChild(root);
        titleEl = document.getElementById('qsInstTitle');
        msgEl = document.getElementById('qsInstMsg');
        stepsEl = document.getElementById('qsInstSteps');
        mainBtn = document.getElementById('qsInstMain');
        laterBtn = document.getElementById('qsInstLater');

        mainBtn.onclick = onMain;
        laterBtn.onclick = later;
        root.addEventListener('click', function (e) { if (e.target === root) later(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') later(); });
        render();
        // transition chalane ke liye agle frame mein show
        requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('show'); }); });
    }

    // Halat ke hisaab se text/button badlo
    function render() {
        if (!root) return;
        stepsEl.innerHTML = '';
        mainBtn.style.display = '';
        if (inApp) {
            titleEl.textContent = 'Browser mein kholein';
            msgEl.textContent = 'Is browser mein install nahi ho sakta. Chrome / Safari mein kholne par install ka button milega.';
            mainBtn.textContent = isAndroid ? '🌐 Chrome mein kholein' : '🔗 Link copy karein';
        } else if (iosNotSafari) {
            titleEl.textContent = 'Safari mein kholein';
            msgEl.textContent = 'iPhone par app sirf Safari se install hoti hai. Link copy karke Safari mein kholein.';
            mainBtn.textContent = '🔗 Link copy karein';
        } else if (isIOS) {
            msgEl.textContent = 'Safari mein ye 3 kaam karein:';
            stepsEl.innerHTML = '<ol><li>Neeche <b>Share ⬆️</b> dabayen</li><li><b>"Add to Home Screen"</b> chunein</li><li><b>Add</b> dabayen</li></ol>';
            mainBtn.textContent = 'Samajh gaya 👍';
        } else if (deferred) {
            mainBtn.textContent = '📲 Install karein';
        } else {
            // Event abhi tak nahi aaya (ya browser support nahi karta) — button dabane par menu ka tareeqa dikhao
            mainBtn.textContent = '📲 Install karein';
        }
    }

    function onMain() {
        if (deferred) {
            var d = deferred; deferred = null;
            hide();
            d.prompt();
            d.userChoice.then(function (r) {
                if (r && r.outcome === 'accepted') lsSet('qsInstalled', '1');
                else lsSet('qsInstallSnooze', String(Date.now()));
            }).catch(function () {});
            return;
        }
        if (inApp && isAndroid) { openInChrome(); return; }
        if (inApp || iosNotSafari) { copyLink(); return; }
        if (isIOS) { later(); return; }
        // Android/desktop jahan native prompt abhi tayyar nahi
        titleEl.textContent = 'Menu se install karein';
        msgEl.textContent = '';
        perks(false);
        stepsEl.innerHTML = '<ol><li>Browser ka menu <b>⋮</b> kholein</li><li><b>"Install app"</b> ya <b>"Add to Home screen"</b> chunein</li></ol>';
        mainBtn.style.display = 'none';
        laterBtn.textContent = 'Theek hai';
    }

    function perks(show) { var p = document.getElementById('qsInstPerks'); if (p) p.style.display = show ? '' : 'none'; }

    function openInChrome() {
        var u = location.href.replace(/^https?:\/\//, '');
        var scheme = location.protocol.replace(':', '');
        location.href = 'intent://' + u + '#Intent;scheme=' + scheme + ';package=com.android.chrome;end';
        setTimeout(copyLink, 1200); // intent na chale to link copy ho jaye
    }

    function copyLink() {
        var done = function () { msgEl.textContent = '✅ Link copy ho gaya. Ab Chrome / Safari kholkar paste karein.'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(location.href).then(done, function () { msgEl.textContent = 'Link: ' + location.href; });
        } else { msgEl.textContent = 'Link: ' + location.href; }
    }

    function later() {
        lsSet('qsInstallSnooze', String(Date.now()));
        hide();
    }

    function hide() {
        if (!root) return;
        root.classList.remove('show');
        var r = root;
        setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 350);
        root = null;
    }

    // ---------- Events ----------
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferred = e;
        if (root) render(); else if (!snoozed()) build();
    });
    window.addEventListener('appinstalled', function () {
        deferred = null;
        lsSet('qsInstalled', '1');
        hide();
    });

    // ---------- Page khulte hi popup ----------
    function init() {
        if (snoozed()) return;
        if (window.qsSplashActive) {
            // Splash chal raha hai — uske hatne ke baad popup dikhao
            window.addEventListener('qs-splash-done', function () { setTimeout(build, 400); });
            setTimeout(build, 4200); // safety
        } else {
            setTimeout(build, 600);
        }
    }
    if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
