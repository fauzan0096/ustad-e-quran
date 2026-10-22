/* Suno / Roko — sab pages ke liye ek jaisa awaaz ka system
   - Arabic (lang:'ar'): pehle Qari ki asli recording (qari.js), na mile to phone ki awaaz
   - Urdu: phone ki awaaz */
(function () {
    var synth = window.speechSynthesis;
    var current = { btn: null, token: 0 };
    var pill = null, watch = null, audio = null;
    // Bahut chhoti khaali awaaz — iPhone par audio "unlock" karne ke liye (tap ke andar chalani padti hai)
    var SILENT = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

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
        current.btn = null;
        if (pill) pill.classList.remove('show');
        if (watch) { clearInterval(watch); watch = null; }
    }

    function stopAudio() {
        if (!audio) return;
        audio.onended = audio.onerror = audio.onplaying = null;
        try { audio.pause(); } catch (e) {}
    }

    function stop() {
        current.token++;              // chalti hui har cheez ko "purani" bana do
        if (synth) synth.cancel();
        stopAudio();
        reset();
    }

    // ---------- Phone ki awaaz ----------
    function robot(text, opt, my) {
        if (my !== current.token) return;
        if (!synth) { reset(); return; }
        var u = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ').trim());
        u.lang = opt.lang === 'ar' ? 'ar-SA' : 'ur-PK';
        u.rate = opt.rate || 0.85;
        u.onend = u.onerror = function () { if (current.token === my) reset(); };
        synth.speak(u);
        if (watch) clearInterval(watch);
        // Kuch phones par onend nahi aata — khud check karo
        watch = setInterval(function () {
            if (current.token !== my) { clearInterval(watch); watch = null; return; }
            if (!synth.speaking && !synth.pending) reset();
        }, 600);
    }

    // ---------- Qari ki recording ----------
    function playQari(urls, opt, my, fallback) {
        var i = 0, started = false;
        audio.onplaying = function () { started = true; };
        audio.onended = function () {
            if (my !== current.token || audio.src !== urls[i]) return;
            i++; next();
        };
        audio.onerror = function () {
            if (my !== current.token || audio.src !== urls[i]) return;
            if (!started) fallback(); else { i++; next(); }
        };
        function next() {
            if (my !== current.token) return;
            if (i >= urls.length) { reset(); return; }
            audio.src = urls[i];
            audio.playbackRate = opt.audioRate || 1;
            var p = audio.play();
            if (p && p.catch) p.catch(function () {
                if (my !== current.token) return;
                if (!started) fallback(); else { i++; next(); }
            });
        }
        next();
    }

    function speak(text, opt) {
        opt = opt || {};
        if (!text) return;
        var useQari = opt.lang === 'ar' && !!window.QSQari && !!window.Audio;
        if (!synth && !useQari) return;
        var btn = opt.btn || null;
        // Wohi button dobara dabaya = roko
        if (btn && current.btn === btn) { stop(); return; }
        stop();
        var my = ++current.token;
        current.btn = btn;
        if (btn) {
            if (btn.tagName === 'BUTTON') {
                if (!btn.dataset.qsIdle) btn.dataset.qsIdle = btn.innerHTML;
                btn.innerHTML = '⏹ Roko';
                btn.classList.add('qs-on');
            } else {
                btn.classList.add('qs-text');
            }
        }
        ensurePill().classList.add('show');

        if (!useQari) { robot(text, opt, my); return; }

        // Tap ke andar hi audio unlock karo (iPhone ke liye zaroori)
        if (!audio) audio = new Audio();
        try { audio.src = SILENT; var pr = audio.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {}

        var once = false;
        function fallback() { if (once) return; once = true; robot(text, opt, my); }
        window.QSQari.resolve(text, opt.ctx).then(function (urls) {
            if (my !== current.token) return;
            if (urls && urls.length) playQari(urls, opt, my, fallback);
            else fallback();
        }, function () { if (my === current.token) fallback(); });
    }

    window.QSpeech = { speak: speak, stop: stop };
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
})();
