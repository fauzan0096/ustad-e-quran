// ==========================================================
// onboarding.js — Fahm-ul-Quran welcome slides (sirf pehli baar)
// Install: index.html ke <head> mein:
//   <script src="onboarding.js"></script>
// Use: login ke baad QSOnboarding.show() call karein
// Reset: browser console mein QSOnboarding.reset()
// ==========================================================
(function () {
    'use strict';
    var KEY = 'qsOnboarded_v1';
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    var SLIDES = [
        {
            icon: 'بِسْمِ اللَّهِ',
            isArabic: true,
            title: 'Fahm-ul-Quran mein khush aamdeed',
            text: 'Quran ke 900 lafz, namaz ki duaein, tajweed — sab ek jagah, aasan Urdu mein. Sirf 10 minute roz, 90 din mein poora course.'
        },
        {
            icon: '📚',
            title: 'Roz 10 lafz, 90 din mein 900',
            text: 'Har din 10 naye Quran ke alfaz. Har lafz ke saath mashq, tafseel, aur us ayat ka hawala jisme wo lafz aaya hai. Exam pass karke agla din kholein.'
        },
        {
            icon: '🎙️',
            title: 'Qari Mishary ki asli awaaz',
            text: 'Har lafz, har dua, har ayat — asli Qari ki recording se suno. Robot awaaz nahi, sahi makharij ke saath. Offline bhi sun sakte hain.'
        },
        {
            icon: '🤲',
            title: 'Chalo shuru karein',
            text: 'Allah aapko ilm se nawaze, samajh ata farmaye, aur amal ki taufeeq de. Ameen. 🤲'
        }
    ];

    function show(callback) {
        if (lsGet(KEY) === '1') { if (callback) callback(); return; }

        var current = 0;

        // ---------- CSS ----------
        var css = document.createElement('style');
        css.textContent = `
        #qsOnb {
            position: fixed; inset: 0; z-index: 2147483600;
            background: radial-gradient(120% 90% at 50% 0%, #17614B 0%, #0A2E24 70%);
            color: #fff; display: flex; flex-direction: column;
            font-family: 'Figtree', system-ui, -apple-system, sans-serif;
            overflow: hidden; opacity: 1;
        }
        #qsOnb::before {
            content: ""; position: absolute; inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23D9B65A' stroke-opacity='.08' stroke-width='1'%3E%3Crect x='14' y='14' width='28' height='28'/%3E%3Crect x='14' y='14' width='28' height='28' transform='rotate(45 28 28)'/%3E%3C/g%3E%3C/svg%3E");
            pointer-events: none;
        }
        .qs-onb-top {
            position: relative; z-index: 1;
            display: flex; justify-content: space-between; align-items: center;
            padding: calc(16px + env(safe-area-inset-top, 0)) 20px 8px;
        }
        .qs-onb-logo {
            width: 40px; height: 40px; border-radius: 12px;
            border: 1.5px solid #D9B65A; object-fit: cover;
            background: #0A2E24;
        }
        .qs-onb-skip {
            background: rgba(255,255,255,.14); border: none; color: #fff;
            padding: 8px 16px; border-radius: 20px; font-size: 13px;
            font-weight: 600; cursor: pointer; font-family: inherit;
            min-height: 36px;
        }
        .qs-onb-skip:active { background: rgba(255,255,255,.28); }
        .qs-onb-slides {
            flex: 1; position: relative; z-index: 1;
            display: flex; overflow: hidden;
        }
        .qs-onb-slide {
            flex: 0 0 100%; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 20px 24px 30px; text-align: center;
            transition: transform .5s cubic-bezier(.2,.9,.3,1);
        }
        .qs-onb-ic {
            width: 156px; height: 156px; border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, rgba(217,182,90,.25), rgba(217,182,90,.05));
            border: 2px solid rgba(217,182,90,.5);
            display: flex; align-items: center; justify-content: center;
            font-size: 72px; margin-bottom: 30px;
            box-shadow: 0 20px 50px rgba(0,0,0,.35);
            animation: qsOnbPulse 3s ease-in-out infinite;
            flex: 0 0 auto;
        }
        .qs-onb-ic.ar {
            font-family: 'Amiri', serif; font-size: 32px; color: #D9B65A;
            direction: rtl; line-height: 1.7; padding: 16px;
            font-weight: 700;
        }
        @keyframes qsOnbPulse {
            0%, 100% { transform: translateY(0); box-shadow: 0 20px 50px rgba(0,0,0,.35); }
            50% { transform: translateY(-6px); box-shadow: 0 26px 60px rgba(0,0,0,.45); }
        }
        .qs-onb-title {
            font-size: 24px; font-weight: 800; line-height: 1.3;
            margin: 0 0 14px; color: #fff; max-width: 420px;
            font-family: 'Amiri', serif; letter-spacing: .2px;
        }
        .qs-onb-text {
            font-size: 15.5px; line-height: 1.75; color: rgba(255,255,255,.85);
            max-width: 400px; margin: 0;
        }
        .qs-onb-bottom {
            position: relative; z-index: 1;
            padding: 16px 24px calc(28px + env(safe-area-inset-bottom, 0));
            display: flex; flex-direction: column; gap: 16px; align-items: center;
        }
        .qs-onb-dots {
            display: flex; gap: 8px; justify-content: center; align-items: center;
        }
        .qs-onb-dots span {
            width: 8px; height: 8px; border-radius: 50%;
            background: rgba(255,255,255,.28);
            transition: all .3s;
        }
        .qs-onb-dots span.on {
            width: 28px; border-radius: 4px; background: #D9B65A;
        }
        .qs-onb-btns {
            display: flex; gap: 10px; width: 100%; max-width: 460px;
        }
        .qs-onb-btn {
            flex: 1; min-height: 52px; border: none; border-radius: 14px;
            font-size: 16px; font-weight: 700; cursor: pointer;
            font-family: inherit; transition: transform .15s;
            display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .qs-onb-btn:active { transform: scale(.97); }
        .qs-onb-btn.next {
            background: linear-gradient(180deg, #E3C36E, #C79E3F);
            color: #2A2008; box-shadow: 0 8px 20px rgba(227,195,110,.35);
        }
        .qs-onb-btn.back {
            flex: 0 0 88px; background: rgba(255,255,255,.14); color: #fff;
        }
        .qs-onb-btn.back:disabled { opacity: .35; cursor: default; }
        @media (prefers-reduced-motion: reduce) {
            .qs-onb-ic { animation: none; }
            .qs-onb-slide { transition: none; }
            #qsOnb { transition: none !important; }
        }
        `;
        document.head.appendChild(css);

        // ---------- HTML ----------
        var el = document.createElement('div');
        el.id = 'qsOnb';
        var slidesHTML = SLIDES.map(function (s) {
            return '<div class="qs-onb-slide">' +
                '<div class="qs-onb-ic' + (s.isArabic ? ' ar' : '') + '">' + s.icon + '</div>' +
                '<h2 class="qs-onb-title">' + s.title + '</h2>' +
                '<p class="qs-onb-text">' + s.text + '</p>' +
                '</div>';
        }).join('');

        el.innerHTML =
            '<div class="qs-onb-top">' +
                '<img class="qs-onb-logo" src="icon-192.png" alt="" onerror="this.style.display=\'none\'">' +
                '<button class="qs-onb-skip" id="qsOnbSkip" type="button">Skip</button>' +
            '</div>' +
            '<div class="qs-onb-slides" id="qsOnbSlides">' + slidesHTML + '</div>' +
            '<div class="qs-onb-bottom">' +
                '<div class="qs-onb-dots" id="qsOnbDots">' +
                    SLIDES.map(function (_, i) { return '<span class="' + (i === 0 ? 'on' : '') + '" data-i="' + i + '"></span>'; }).join('') +
                '</div>' +
                '<div class="qs-onb-btns">' +
                    '<button class="qs-onb-btn back" id="qsOnbBack" type="button" disabled>←</button>' +
                    '<button class="qs-onb-btn next" id="qsOnbNext" type="button">Agla →</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(el);
        document.documentElement.style.overflow = 'hidden';

        var slides = document.getElementById('qsOnbSlides');
        var dots = document.querySelectorAll('#qsOnbDots span');
        var nextBtn = document.getElementById('qsOnbNext');
        var backBtn = document.getElementById('qsOnbBack');
        var skipBtn = document.getElementById('qsOnbSkip');

        function go(i) {
            current = Math.max(0, Math.min(SLIDES.length - 1, i));
            slides.style.transform = 'translateX(-' + (current * 100) + '%)';
            dots.forEach(function (d, k) { d.classList.toggle('on', k === current); });
            backBtn.disabled = current === 0;
            nextBtn.textContent = current === SLIDES.length - 1 ? '🤲 Shuru Karein' : 'Agla →';
        }

        function done() {
            lsSet(KEY, '1');
            el.style.transition = 'opacity .35s';
            el.style.opacity = '0';
            setTimeout(function () {
                if (el.parentNode) el.remove();
                document.documentElement.style.overflow = '';
                if (callback) callback();
            }, 350);
        }

        nextBtn.addEventListener('click', function () {
            if (current === SLIDES.length - 1) done();
            else go(current + 1);
        });
        backBtn.addEventListener('click', function () { if (current > 0) go(current - 1); });
        skipBtn.addEventListener('click', done);

        // Swipe support
        var sx = 0, sy = 0, drag = false;
        slides.addEventListener('touchstart', function (e) {
            var t = e.touches[0]; sx = t.clientX; sy = t.clientY; drag = true;
        }, { passive: true });
        slides.addEventListener('touchend', function (e) {
            if (!drag) return;
            drag = false;
            var t = e.changedTouches[0];
            var dx = t.clientX - sx, dy = t.clientY - sy;
            if (Math.abs(dx) > 50 && Math.abs(dy) < 60) {
                if (dx < 0) go(current + 1);
                else go(current - 1);
            }
        }, { passive: true });

        // Keyboard (desktop)
        document.addEventListener('keydown', function (e) {
            if (!document.getElementById('qsOnb')) return;
            if (e.key === 'ArrowRight') { if (current < SLIDES.length - 1) go(current + 1); }
            else if (e.key === 'ArrowLeft') { if (current > 0) go(current - 1); }
            else if (e.key === 'Escape') done();
        });
    }

    window.QSOnboarding = {
        show: show,
        reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
        hasSeen: function () { return lsGet(KEY) === '1'; }
    };
})();