/* Shared UI helpers — sab pages par:
   1) Splash screen (logo + bismillah), ek session mein ek hi baar
   2) Arabic/Urdu text ka size (A- / A+), sab pages par ek hi setting
   3) Figtree font (index jaisa) */
(function () {
    var root = document.documentElement;
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

    // ---------- Text scale (--scale) ----------
    var scale = parseFloat(lsGet('textScale') || '1');
    if (!(scale >= 0.8 && scale <= 1.6)) scale = 1;
    root.style.setProperty('--scale', scale);

    window.QSUI = {
        changeScale: function (d) {
            scale = Math.min(1.6, Math.max(0.8, Math.round((scale + d) * 10) / 10));
            lsSet('textScale', scale);
            root.style.setProperty('--scale', scale);
            var s = document.getElementById('qsScaleVal');
            if (s) s.textContent = Math.round(scale * 100) + '%';
        }
    };

    // ---------- CSS ----------
    var st = document.createElement('style');
    st.textContent =
        /* Pages jahan scale pehle se nahi lagta (index, games) */
        '.grid-container .arabic{font-size:calc(42px*var(--scale,1))}' +
        '.grid-container .urdu{font-size:calc(21px*var(--scale,1))}' +
        '.exam-q .exam-ar{font-size:calc(34px*var(--scale,1))}' +
        '.today-card .t-ar{font-size:calc(40px*var(--scale,1))}' +
        '.today-card .t-ur{font-size:calc(20px*var(--scale,1))}' +
        '.list-item .li-ar{font-size:calc(28px*var(--scale,1))}' +
        '.mem-card span.ar{font-size:calc(18px*var(--scale,1))}' +
        /* Dropdown mein size row (index) */
        '.qs-size-row{display:flex;align-items:center;gap:8px;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid var(--border);font-size:13px}' +
        '.qs-size-row b{flex:1;font-weight:600}' +
        '.qs-size-row button{width:44px!important;min-height:40px!important;padding:0!important;background:var(--soft-bg)!important;color:var(--text)!important;border:1.5px solid var(--border)!important;border-radius:10px!important;font-weight:700;cursor:pointer}' +
        '.qs-size-row span{min-width:42px;text-align:center;color:var(--text-light);font-size:12px}' +
        /* Splash */
        '#qsSplash{position:fixed;inset:0;z-index:2147483600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;' +
        'background:radial-gradient(120% 90% at 50% 0%,#17614B 0%,#0A2E24 70%);color:#fff;text-align:center;transition:opacity .45s;font-family:Amiri,serif}' +
        '#qsSplash.out{opacity:0;pointer-events:none}' +
        '#qsSplash img{width:112px;height:112px;border-radius:50%;border:3px solid #D9B65A;box-shadow:0 12px 34px rgba(0,0,0,.45);object-fit:cover;animation:qsPop .7s cubic-bezier(.2,.9,.3,1.2) both}' +
        '#qsSplash .bis{font-size:30px;line-height:1.8;color:#D9B65A;margin-top:14px;animation:qsUp .7s .25s both}' +
        '#qsSplash .nm{font-size:40px;font-weight:700;line-height:1.1;animation:qsUp .7s .4s both}' +
        '#qsSplash .sub{font-family:Figtree,system-ui,sans-serif;font-size:13px;letter-spacing:.5px;opacity:.8;animation:qsUp .7s .55s both}' +
        '@keyframes qsPop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}' +
        '@keyframes qsUp{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}' +
        '@media (prefers-reduced-motion:reduce){#qsSplash *{animation:none!important}#qsSplash{transition:none}}';
    (document.head || root).appendChild(st);

    // ---------- Figtree font (jo pages mein nahi hai) ----------
    var fl = document.createElement('link');
    fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap';
    (document.head || root).appendChild(fl);

    // ---------- Splash ----------
    window.qsSplashActive = false;
    if (ssGet('qsSplashShown') !== '1') {
        ssSet('qsSplashShown', '1');
        window.qsSplashActive = true;
        var sp = document.createElement('div');
        sp.id = 'qsSplash';
        sp.innerHTML =
            '<img src="icon-192.png" alt="">' +
            '<div class="bis">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' +
            '<div class="nm">Quraan Ustad</div>' +
            '<div class="sub">Quran aur Duaa seekhein</div>';
        root.appendChild(sp); // body ka intezaar nahi — foran dikhe

        var gone = false;
        var done = function () {
            if (gone) return; gone = true;
            sp.classList.add('out');
            window.qsSplashActive = false;
            setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 500);
            try { window.dispatchEvent(new Event('qs-splash-done')); } catch (e) {}
        };
        var minTime = new Promise(function (r) { setTimeout(r, 1500); });
        var loaded = new Promise(function (r) {
            if (document.readyState === 'complete') r(); else window.addEventListener('load', r);
        });
        Promise.all([minTime, loaded]).then(done);
        setTimeout(done, 3500);         // load atka to bhi 3.5 sec mein hat jaye
        sp.addEventListener('click', done); // tap karke skip
    }

    // ---------- Index: dropdown mein "Arabic size" ----------
    function addSizeRow() {
        var drop = document.getElementById('userDrop');
        if (!drop || document.getElementById('qsScaleVal')) return;
        var row = document.createElement('div');
        row.className = 'qs-size-row';
        row.innerHTML = '<b>Arabic size</b><button type="button" aria-label="Chhota">A-</button><span id="qsScaleVal">' + Math.round(scale * 100) + '%</span><button type="button" aria-label="Bada">A+</button>';
        var btns = row.querySelectorAll('button');
        btns[0].onclick = function (e) { e.stopPropagation(); QSUI.changeScale(-0.1); };
        btns[1].onclick = function (e) { e.stopPropagation(); QSUI.changeScale(0.1); };
        drop.insertBefore(row, drop.querySelector('button'));
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addSizeRow); else addSizeRow();
})();
