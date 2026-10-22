/* Suno / Roko — sab pages ke liye ek jaisa awaaz ka system
   - Arabic (lang:'ar'): jo hissa Quran ka ho wo Qari ki asli recording (qari.js) se; baaki (hadees ki dua) phone ki awaaz se
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
    // Ek tukda phone ki awaaz mein bolo; khatam hone par done() chalta hai
    function say(text, opt, my, done) {
        if (my !== current.token) return;
        text = String(text || '').replace(/\s+/g, ' ').trim();
        if (!text || !synth) { done(); return; }
        var fin = false;
        function end() { if (fin) return; fin = true; if (watch) { clearInterval(watch); watch = null; } if (current.token === my) done(); }
        var u = new SpeechSynthesisUtterance(text);
        u.lang = opt.lang === 'ar' ? 'ar-SA' : 'ur-PK';
        u.rate = opt.rate || 0.85;
        u.onend = u.onerror = end;
        synth.speak(u);
        if (watch) clearInterval(watch);
        // Kuch phones par onend nahi aata — khud check karo
        watch = setInterval(function () {
            if (current.token !== my) { clearInterval(watch); watch = null; return; }
            if (!synth.speaking && !synth.pending) end();
        }, 600);
    }
    function robot(text, opt, my) { say(text, opt, my, function () { if (my === current.token) reset(); }); }

    // ---------- Qari ki recording ----------
    // Ek clip: p.u = [pehla link, vikalp link ...]. Pehla na chale to agla try hota hai.
    function playClip(p, opt, my, done) {
        var c = 0, started = false, settled = false;
        function detach() { audio.onplaying = audio.onended = audio.onerror = null; }
        function finish(ok) { if (settled) return; settled = true; detach(); done(ok); }
        function tryNext() {
            if (my !== current.token || settled) return;
            if (c >= p.u.length) { finish(false); return; }
            started = false;
            audio.src = p.u[c++];
            audio.playbackRate = opt.audioRate || 1;
            var pr = audio.play();
            if (pr && pr.catch) pr.catch(function () { if (my === current.token && !started) tryNext(); });
        }
        audio.onplaying = function () { started = true; };
        audio.onended = function () { if (my === current.token) finish(true); };
        audio.onerror = function () {
            if (my !== current.token) return;
            if (!started) tryNext(); else finish(true);
        };
        tryNext();
    }
    // parts: [{u:[links], x:text} (Qari), {t:text} (phone)] ek ke baad ek
    function playParts(parts, text, opt, my) {
        var i = 0, played = false;
        function next() {
            if (my !== current.token) return;
            if (i >= parts.length) { reset(); return; }
            var p = parts[i++];
            if (p.u) {
                playClip(p, opt, my, function (ok) {
                    if (my !== current.token) return;
                    if (ok) { played = true; next(); }
                    else if (!played) robot(text, opt, my);          // Qari ki recording bilkul nahi chali (net?) — poora text phone se
                    else say(p.x, opt, my, next);                    // beech mein ek clip na chali — sirf wo hissa phone se
                });
            } else say(p.t, opt, my, next);
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

        window.QSQari.plan(text, opt.ctx).then(function (parts) {
            if (my !== current.token) return;
            if (parts && parts.length) playParts(parts, text, opt, my);
            else robot(text, opt, my);                                // Quran mein nahi mila — phone ki awaaz
        }, function () { if (my === current.token) robot(text, opt, my); });
    }

    window.QSpeech = { speak: speak, stop: stop };
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
})();
