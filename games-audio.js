// ==========================================================
// games-audio.js — Quraan Ustad Games
//  🎵 Nasheed (nasheed.mp3)   🔊 Sound effects (sahi / galat / jeet / game over)
// Install: games.html ke <head> mein ek line:
//   <script src="games-audio.js" defer></script>
// Saari awaazein WebAudio se bani hain (koi extra file nahi), sirf nasheed.mp3 chahiye.
// ==========================================================
(function () {
    'use strict';

    // ---------- helpers ----------
    function wrap(name, fn) {
        const orig = window[name];
        if (typeof orig !== 'function') return;
        window[name] = function () { return fn.call(this, orig, arguments); };
    }
    function toast(msg) {
        let t = document.getElementById('toast');
        if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
        t.className = 'toast show';
        t.textContent = msg;
        clearTimeout(toast._t);
        toast._t = setTimeout(() => t.classList.remove('show'), 3000);
    }

    // ---------- CSS ----------
    const st = document.createElement('style');
    st.textContent = `
        .toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%) translateY(20px); background: #222; color: #fff; padding: 11px 20px; border-radius: 22px; font-size: 13px; z-index: 100000; opacity: 0; transition: all .3s; max-width: 88%; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,.4); border: 1px solid #D4AF37; pointer-events: none; }
        .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        @keyframes sfxShake { 0%,100% { transform: translateX(0); } 15% { transform: translateX(-9px); } 30% { transform: translateX(8px); } 45% { transform: translateX(-6px); } 60% { transform: translateX(5px); } 75% { transform: translateX(-3px); } }
        .sfx-shake { animation: sfxShake .45s; }
        @media (prefers-reduced-motion: reduce) { .sfx-shake { animation: none; } }
    `;
    document.head.appendChild(st);

    // ==========================================================
    // 🔊 SOUND EFFECTS
    // ==========================================================
    let sfxOn = localStorage.getItem('sfxOn') !== 'false';
    let ctx = null;
    function getCtx() {
        if (!sfxOn) return null;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try {
            if (!ctx) ctx = new AC();
            if (ctx.state === 'suspended') ctx.resume();
        } catch (e) { return null; }
        return ctx;
    }
    function tone(c, o) {
        const osc = c.createOscillator(), g = c.createGain();
        const d = o.d || 0.2, t0 = c.currentTime + 0.02 + (o.t || 0);
        osc.type = o.type || 'sine';
        osc.frequency.setValueAtTime(o.f, t0);
        if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + d);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(o.vol || 0.25, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        osc.connect(g); g.connect(c.destination);
        osc.start(t0); osc.stop(t0 + d + 0.05);
    }
    function play(notes) {
        const c = getCtx();
        if (!c) return;
        try { notes.forEach(n => tone(c, n)); } catch (e) {}
    }
    function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

    const sfx = {
        // ✅ sahi jawab: chhoti "ding"
        correct() {
            play([
                { f: 880, t: 0, d: 0.18, type: 'sine', vol: 0.25 },
                { f: 1319, t: 0.11, d: 0.5, type: 'sine', vol: 0.25 },
                { f: 2638, t: 0.11, d: 0.3, type: 'sine', vol: 0.06 }
            ]);
            buzz(30);
        },
        // ❌ galat jawab: buzzer + gira hua "womp"
        wrong() {
            play([
                { f: 80, f2: 40, t: 0, d: 0.3, type: 'sine', vol: 0.4 },
                { f: 233, f2: 117, t: 0, d: 0.4, type: 'square', vol: 0.13 },
                { f: 185, f2: 92, t: 0.28, d: 0.6, type: 'sawtooth', vol: 0.13 }
            ]);
            buzz([120, 60, 120]);
        },
        // 😢 game over: udaas "wah wah wah wahhh"
        over() {
            play([
                { f: 392, t: 0, d: 0.35, type: 'sawtooth', vol: 0.12 },
                { f: 370, t: 0.38, d: 0.35, type: 'sawtooth', vol: 0.12 },
                { f: 349, t: 0.76, d: 0.35, type: 'sawtooth', vol: 0.12 },
                { f: 330, f2: 262, t: 1.14, d: 1.0, type: 'sawtooth', vol: 0.12 }
            ]);
        },
        // 🏆 jeet: fanfare + chord + sitare
        win() {
            const n = [];
            [523, 659, 784, 1047].forEach((f, i) => n.push({ f, t: i * 0.13, d: 0.28, type: 'triangle', vol: 0.25 }));
            [523, 659, 784, 1047].forEach(f => n.push({ f, t: 0.6, d: 1.3, type: 'sine', vol: 0.16 }));
            [1568, 2093, 1760, 2349, 2093].forEach((f, i) => n.push({ f, t: 0.65 + i * 0.12, d: 0.35, type: 'sine', vol: 0.07 }));
            play(n);
            buzz([60, 40, 60, 40, 140]);
        },
        // 🧠 memory: match / miss / tick
        match() { play([{ f: 660, t: 0, d: 0.14, type: 'sine', vol: 0.22 }, { f: 990, t: 0.1, d: 0.3, type: 'sine', vol: 0.22 }]); buzz(25); },
        miss() { play([{ f: 300, f2: 210, t: 0, d: 0.22, type: 'triangle', vol: 0.15 }]); },
        tick() { play([{ f: 620, t: 0, d: 0.07, type: 'sine', vol: 0.1 }]); }
    };
    window.gameSfx = sfx;

    // celebrate() ki purani awaaz ki jagah nayi fanfare
    window.celeSound = function () { sfx.win(); };

    function shake() {
        const el = document.querySelector('.game-section.active');
        if (!el) return;
        el.classList.remove('sfx-shake');
        void el.offsetWidth;
        el.classList.add('sfx-shake');
        setTimeout(() => el.classList.remove('sfx-shake'), 500);
    }
    function reaction(ok) {
        if (ok === true) sfx.correct();
        else if (ok === false) { sfx.wrong(); shake(); }
    }

    // pehle touch par audio unlock (mobile browsers ke liye zaroori)
    document.addEventListener('pointerdown', getCtx, { once: true });

    // ---------- hooks: har game ka jawab ----------
    wrap('kbcAnswer', function (orig, args) {
        let ok = null;
        try { ok = (args[0] === kbcData[kbcState.qIndex][5]); } catch (e) {}
        const r = orig.apply(this, args);
        reaction(ok);
        return r;
    });
    wrap('kbcFinish', function (orig, args) {
        if (!args[0]) sfx.over();      // haar par udaas awaaz (jeet par celebrate() fanfare bajata hai)
        return orig.apply(this, args);
    });
    wrap('sahabaAnswer', function (orig, args) {
        let ok = null;
        try { if (!sahabaState.answered) ok = (args[0] === sahabaState.questions[sahabaState.index].c); } catch (e) {}
        const r = orig.apply(this, args);
        reaction(ok);
        return r;
    });
    wrap('emojiAnswer', function (orig, args) {
        let ok = null;
        try { if (!emojiState.answered) ok = (args[0] === emojiState.questions[emojiState.index].c); } catch (e) {}
        const r = orig.apply(this, args);
        reaction(ok);
        return r;
    });
    wrap('memoryFlip', function (orig, args) {
        let before = 0, locked = true;
        try { before = memoryState.flipped.length; locked = memoryState.locked; } catch (e) {}
        const r = orig.apply(this, args);
        try {
            if (!locked && memoryState.flipped.length > before) {
                if (memoryState.flipped.length === 2) {
                    const a = memoryState.cards[memoryState.flipped[0]], b = memoryState.cards[memoryState.flipped[1]];
                    if (a.id === b.id && a.type !== b.type) setTimeout(sfx.match, 400);
                    else setTimeout(sfx.miss, 450);
                } else sfx.tick();
            }
        } catch (e) {}
        return r;
    });

    // ---------- 🔊 SFX on/off button (header mein) ----------
    function addSfxButton() {
        if (document.getElementById('sfxBtn')) return;
        const theme = document.getElementById('themeBtn');
        if (!theme) return;
        const b = document.createElement('button');
        b.id = 'sfxBtn';
        b.className = 'icon-btn';
        b.title = 'Sound effects';
        b.textContent = sfxOn ? '🔊' : '🔇';
        b.onclick = function () {
            sfxOn = !sfxOn;
            localStorage.setItem('sfxOn', sfxOn);
            b.textContent = sfxOn ? '🔊' : '🔇';
            if (sfxOn) sfx.tick();
        };
        theme.parentNode.insertBefore(b, theme);
    }

    // ==========================================================
    // 🎵 NASHEED
    // ==========================================================
    let nasheedWanted = false;
    function getAudio() {
        let a = document.getElementById('kbcNasheed');
        if (!a) {
            a = document.createElement('audio');
            a.id = 'kbcNasheed';
            a.loop = true;
            a.preload = 'none';
            a.src = 'nasheed.mp3';
            document.body.appendChild(a);
        }
        return a;
    }
    function ensureNasheedBtn() {
        if (document.getElementById('nasheedBtn')) return;
        const row = document.querySelector('#kbc .kbc-lifelines');
        if (!row) return;
        const b = document.createElement('button');
        b.className = 'kbc-life';
        b.id = 'nasheedBtn';
        b.onclick = function () { window.toggleNasheed(); };
        row.appendChild(b);
    }
    function syncNasheedBtn() {
        ensureNasheedBtn();
        const btn = document.getElementById('nasheedBtn');
        if (!btn) return;
        const playing = !getAudio().paused;
        btn.textContent = playing ? '🔇 Nasheed Off' : '🎵 Nasheed';
        btn.classList.toggle('on', playing);
    }
    function stopNasheed() {
        nasheedWanted = false;
        getAudio().pause();
        syncNasheedBtn();
    }
    window.toggleNasheed = function () {
        const a = getAudio();
        if (!a.paused) { stopNasheed(); return; }
        a.volume = 0.25;
        nasheedWanted = true;
        const p = a.play();
        if (p && p.then) {
            p.then(syncNasheedBtn).catch(() => {
                nasheedWanted = false;
                syncNasheedBtn();
                toast('Nasheed file nahi mili: "nasheed.mp3" ko games.html wale folder mein rakhein');
            });
        } else syncNasheedBtn();
    };

    // KBC dobara ban'ne par button/label theek rahe
    wrap('initKBC', function (orig, args) {
        const r = orig.apply(this, args);
        syncNasheedBtn();
        return r;
    });
    // KBC chhodte hi nasheed band
    wrap('switchGame', function (orig, args) {
        const r = orig.apply(this, args);
        if (args[0] !== 'kbc') stopNasheed();
        return r;
    });
    // app background mein jaye to ruke, wapas aaye to chale
    document.addEventListener('visibilitychange', function () {
        const a = getAudio();
        if (document.hidden) a.pause();
        else if (nasheedWanted) a.play().catch(() => {});
        syncNasheedBtn();
    });

    // ==========================================================
    // 🛠 Data fix: kuch sawalon mein sahi jawab string ("0") likha hai, number banao
    // ==========================================================
    try {
        KBC.forEach(function (day) {
            day.forEach(function (q) { if (typeof q[5] === 'string') q[5] = parseInt(q[5], 10); });
        });
    } catch (e) {}

    // ---------- start ----------
    addSfxButton();
    syncNasheedBtn();
})();
