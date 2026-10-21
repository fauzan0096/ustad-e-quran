/* Install popup + service worker (shared by index.html and dua.html) */
(function () {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () {});
        });
    }

    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    if (standalone) return;

    var deferred = null;
    var ua = navigator.userAgent || '';
    var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var bar = null, msgEl = null, btnEl = null;

    function dismissed() { try { return sessionStorage.getItem('installDismissed') === '1'; } catch (e) { return false; } }

    function helpText() {
        if (isIOS) return 'Safari mein neeche Share ⬆️ dabayen, phir "Add to Home Screen" chunein.';
        return 'Browser menu (⋮) kholein, phir "Install app" ya "Add to Home screen" chunein.';
    }

    function build() {
        if (bar || dismissed()) return;
        var st = document.createElement('style');
        st.textContent =
            '#installBar{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:flex;align-items:center;gap:12px;' +
            'padding:max(10px,env(safe-area-inset-top)) 14px 10px;background:linear-gradient(135deg,#0F4C3A,#1a7a5c);color:#fff;' +
            'border-bottom:3px solid #D4AF37;box-shadow:0 6px 22px rgba(0,0,0,.35);font-family:Poppins,sans-serif;' +
            'transform:translateY(-110%);animation:ibIn .45s ease .1s forwards}' +
            '@keyframes ibIn{to{transform:translateY(0)}}' +
            '#installBar img{width:46px;height:46px;border-radius:11px;flex:0 0 auto;box-shadow:0 2px 8px rgba(0,0,0,.3)}' +
            '#installBar .ib-t{flex:1;min-width:0;line-height:1.35}' +
            '#installBar .ib-t b{display:block;font-size:14px}' +
            '#installBar .ib-t span{font-size:11.5px;opacity:.92;display:block}' +
            '#installBar button{border:none;cursor:pointer;font-weight:700;border-radius:20px;font-size:13px}' +
            '#installBtn{background:#D4AF37;color:#0F3B2D;padding:9px 18px}' +
            '#installClose{background:rgba(255,255,255,.18);color:#fff;width:30px;height:30px;font-size:15px;flex:0 0 auto}';
        document.head.appendChild(st);

        bar = document.createElement('div');
        bar.id = 'installBar';
        bar.innerHTML =
            '<img src="icon-192.png" alt="">' +
            '<div class="ib-t"><b>📲 Quraan Ustad install karein</b><span id="installMsg">Home screen par app ki tarah kholein, offline bhi chalegi.</span></div>' +
            '<button id="installBtn">Install</button>' +
            '<button id="installClose" aria-label="Band">✕</button>';
        document.body.appendChild(bar);
        msgEl = document.getElementById('installMsg');
        btnEl = document.getElementById('installBtn');

        btnEl.onclick = function () {
            if (deferred) {
                deferred.prompt();
                deferred.userChoice.then(function () { deferred = null; hide(); });
            } else {
                msgEl.textContent = helpText();
                btnEl.style.display = 'none';
            }
        };
        document.getElementById('installClose').onclick = function () {
            try { sessionStorage.setItem('installDismissed', '1'); } catch (e) {}
            hide();
        };
    }

    function hide() { if (bar) { bar.style.display = 'none'; } }

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferred = e;
        build();
    });
    window.addEventListener('appinstalled', function () { deferred = null; hide(); });

    function init() {
        // Beforeinstallprompt na aaye (iOS / kuch browsers) to bhi popup dikhao
        build();
    }
    if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
