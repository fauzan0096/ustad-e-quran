/* Suno / Roko — sab pages ke liye ek jaisa awaaz ka system */
(function () {
    var synth = window.speechSynthesis;
    var current = { btn: null, utt: null };
    var pill = null, watch = null;

    var css = document.createElement('style');
    css.textContent =
        '.qs-pill{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(120px);' +
        'background:#c62828;color:#fff;border:none;padding:12px 26px;border-radius:30px;font-size:15px;font-weight:700;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:99990;cursor:pointer;transition:transform .25s;font-family:inherit}' +
        '.qs-pill.show{transform:translateX(-50%) translateY(0)}' +
        '.qs-pill:active{transform:translateX(-50%) scale(.95)}' +
        '.qs-on{outline:3px solid #c62828 !important;outline-offset:2px;background:#c62828 !important;color:#fff !important}' +
        '.qs-text{background:rgba(212,175,55,.25) !important;border-radius:10px}';
    document.head.appendChild(css);

    function ensurePill() {
        if (pill) return pill;
        pill = document.createElement('button');
        pill.className = 'qs-pill';
        pill.textContent = '⏹ Roko';
        pill.onclick = stop;
        document.body.appendChild(pill);
        return pill;
    }

    function reset() {
        var b = current.btn;
        if (b) {
            b.classList.remove('qs-on', 'qs-text', 'playing');
            if (b.dataset.qsIdle) b.innerHTML = b.dataset.qsIdle;
        }
        current.btn = null; current.utt = null;
        if (pill) pill.classList.remove('show');
        if (watch) { clearInterval(watch); watch = null; }
    }

    function stop() {
        if (synth) synth.cancel();
        reset();
    }

    function speak(text, opt) {
        opt = opt || {};
        if (!synth || !text) return;
        var btn = opt.btn || null;
        // Wohi button dobara dabaya = roko
        if (btn && current.btn === btn) { stop(); return; }
        stop();
        var u = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ').trim());
        u.lang = opt.lang === 'ar' ? 'ar-SA' : 'ur-PK';
        u.rate = opt.rate || 0.85;
        current.btn = btn; current.utt = u;
        if (btn) {
            if (btn.tagName === 'BUTTON') {
                if (!btn.dataset.qsIdle) btn.dataset.qsIdle = btn.innerHTML;
                btn.innerHTML = '⏹ Roko';
                btn.classList.add('qs-on');
            } else {
                btn.classList.add('qs-text');
            }
        }
        u.onend = u.onerror = function () { if (current.utt === u) reset(); };
        synth.speak(u);
        ensurePill().classList.add('show');
        // Kuch phones par onend nahi aata — khud check karo
        watch = setInterval(function () {
            if (!synth.speaking && !synth.pending) reset();
        }, 600);
    }

    window.QSpeech = { speak: speak, stop: stop };
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
})();
