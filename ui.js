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
        /* Aaj ki ayat */
        '.daily-card{position:relative;margin:16px 0 0;padding:18px 16px 14px;border-radius:18px;background:var(--card-bg,#fffdf6);border:1.5px solid var(--secondary,#B8923A);box-shadow:var(--shadow);text-align:center;animation:fadeInUp .4s ease-out both}' +
        '.daily-card .d-label{font-size:12px;font-weight:700;letter-spacing:.5px;color:var(--secondary,#B8923A)}' +
        '.daily-card .d-ar{font-family:Amiri,serif;font-size:calc(30px*var(--scale,1));line-height:2;color:var(--ink,#0A2E24);direction:rtl;margin-top:4px}' +
        '.daily-card .d-ur{font-family:"Noto Nastaliq Urdu",serif;font-size:calc(18px*var(--scale,1));line-height:2.2;color:var(--text,#1F2A25);direction:rtl;margin-top:4px}' +
        '.daily-card .d-ref{font-size:13px;font-weight:600;color:var(--text-light,#55645C);margin-top:6px}' +
        '.daily-card .d-acts{display:flex;gap:8px;margin-top:12px}' +
        '.daily-card .d-btn{flex:1;min-height:44px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;border:none;background:linear-gradient(180deg,#17614B,var(--primary,#0F4C3A));color:#fff}' +
        '.daily-card .d-ghost{background:transparent;color:var(--primary,#0F4C3A);border:1.5px solid var(--primary,#0F4C3A)}' +
        '[data-theme="dark"] .daily-card .d-ghost{color:var(--gold-bright,#D9B65A);border-color:var(--gold-bright,#D9B65A)}' +
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

    // ==========================================
    // 📖 AAJ KI AYAT (index par #dailyCard mein)
    // Ayat ka matn Shamela ki Quran fehrist se mila kar liya gaya hai.
    // "(آیت کا حصہ)" wale cards poori ayat ka sirf ek hissa hain.
    // ==========================================
    var DAILY_AYAT = [["فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", "تم مجھے یاد کرو، میں تمہیں یاد رکھوں گا، اور میرا شکر ادا کرو اور ناشکری نہ کرو۔", "Al-Baqarah 2:152"], ["يَاأَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", "اے ایمان والو! صبر اور نماز سے مدد لو۔ بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔", "Al-Baqarah 2:153"], ["الَّذِينَ إِذَا أَصَابَتْهُمْ مُصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ", "جنہیں جب کوئی مصیبت پہنچتی ہے تو کہتے ہیں: ہم اللہ ہی کے ہیں اور ہمیں اسی کی طرف لوٹ کر جانا ہے۔", "Al-Baqarah 2:156"], ["وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ", "اور جب میرے بندے آپ سے میرے بارے میں پوچھیں تو (کہہ دیں) میں قریب ہوں؛ پکارنے والے کی پکار کا جواب دیتا ہوں جب وہ مجھے پکارے۔ پس وہ میرا حکم مانیں اور مجھ پر ایمان رکھیں تاکہ راہِ راست پائیں۔", "Al-Baqarah 2:186"], ["وَمِنْهُمْ مَنْ يَقُولُ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", "اور ان میں سے کوئی کہتا ہے: اے ہمارے رب! ہمیں دنیا میں بھلائی دے اور آخرت میں بھی بھلائی دے اور ہمیں آگ کے عذاب سے بچا۔", "Al-Baqarah 2:201"], ["رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ", "اے ہمارے رب! ہدایت دینے کے بعد ہمارے دلوں کو ٹیڑھا نہ کر اور ہمیں اپنے پاس سے رحمت عطا فرما؛ بے شک تو ہی بہت عطا کرنے والا ہے۔", "Aal-e-Imran 3:8"], ["وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنْتُمُ الْأَعْلَوْنَ إِنْ كُنْتُمْ مُؤْمِنِينَ", "اور نہ سستی کرو اور نہ غم کرو، اور تم ہی غالب رہو گے اگر تم مومن ہو۔", "Aal-e-Imran 3:139"], ["قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ", "کہہ دیجیے: بے شک میری نماز، میری قربانی، میری زندگی اور میری موت سب اللہ رب العالمین کے لیے ہے۔", "Al-An'am 6:162"], ["قَالَا رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ", "دونوں نے کہا: اے ہمارے رب! ہم نے اپنی جانوں پر ظلم کیا، اور اگر تو نے ہمیں نہ بخشا اور ہم پر رحم نہ کیا تو ہم ضرور خسارہ پانے والوں میں ہوں گے۔", "Al-A'raf 7:23"], ["وَأَطِيعُوا اللَّهَ وَرَسُولَهُ وَلَا تَنَازَعُوا فَتَفْشَلُوا وَتَذْهَبَ رِيحُكُمْ وَاصْبِرُوا إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", "اور اللہ اور اس کے رسول ﷺ کی اطاعت کرو، اور آپس میں جھگڑا نہ کرو ورنہ ہمت ہار بیٹھو گے اور تمہاری ہوا اکھڑ جائے گی؛ اور صبر کرو، بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔", "Al-Anfal 8:46"], ["قُلْ لَنْ يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ", "کہہ دیجیے: ہمیں ہرگز کوئی چیز نہیں پہنچے گی مگر وہی جو اللہ نے ہمارے لیے لکھ دی ہے؛ وہی ہمارا کارساز ہے، اور مومنوں کو اللہ ہی پر بھروسا کرنا چاہیے۔", "At-Tawbah 9:51"], ["وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ", "اور صبر کرو، بے شک اللہ نیکی کرنے والوں کا اجر ضائع نہیں کرتا۔", "Hud 11:115"], ["الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", "جو لوگ ایمان لائے اور ان کے دل اللہ کے ذکر سے اطمینان پاتے ہیں؛ سن لو! اللہ کے ذکر ہی سے دلوں کو اطمینان ملتا ہے۔", "Ar-Ra'd 13:28"], ["وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ وَلَئِنْ كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ", "اور جب تمہارے رب نے اعلان کر دیا: اگر تم شکر کرو گے تو میں ضرور تمہیں اور زیادہ دوں گا، اور اگر ناشکری کرو گے تو بے شک میرا عذاب بہت سخت ہے۔", "Ibrahim 14:7"], ["إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوْا وَالَّذِينَ هُمْ مُحْسِنُونَ", "بے شک اللہ ان لوگوں کے ساتھ ہے جو تقویٰ اختیار کرتے ہیں اور جو نیکی کرنے والے ہیں۔", "An-Nahl 16:128"], ["قَالَ رَبِّ اشْرَحْ لِي صَدْرِي", "(موسیٰ علیہ السلام نے) کہا: اے میرے رب! میرا سینہ میرے لیے کھول دے۔", "Taha 20:25"], ["وَقُلْ رَبِّ زِدْنِي عِلْمًا", "اور کہو: اے میرے رب! میرے علم میں اضافہ فرما۔", "Taha 20:114 (آیت کا حصہ)"], ["وَقُلْ رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ", "اور کہو: اے میرے رب! بخش دے اور رحم فرما، اور تو سب رحم کرنے والوں سے بہتر ہے۔", "Al-Mu'minun 23:118"], ["رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ", "(موسیٰ علیہ السلام نے) کہا: اے میرے رب! جو بھلائی بھی تو مجھ پر نازل فرمائے میں اس کا محتاج ہوں۔", "Al-Qasas 28:24 (آیت کا حصہ)"], ["إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَاأَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا", "بے شک اللہ اور اس کے فرشتے نبی ﷺ پر درود بھیجتے ہیں؛ اے ایمان والو! تم بھی ان پر درود اور خوب سلام بھیجو۔", "Al-Ahzab 33:56"], ["وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ", "اور تمہارے رب نے فرمایا: مجھے پکارو، میں تمہاری دعا قبول کروں گا۔", "Ghafir 40:60 (آیت کا حصہ)"], ["إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُرْحَمُونَ", "مومن تو آپس میں بھائی بھائی ہیں، اس لیے اپنے دو بھائیوں میں صلح کرا دیا کرو اور اللہ سے ڈرتے رہو تاکہ تم پر رحم کیا جائے۔", "Al-Hujurat 49:10"], ["وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ", "اور میں نے جنوں اور انسانوں کو صرف اس لیے پیدا کیا کہ وہ میری عبادت کریں۔", "Adh-Dhariyat 51:56"], ["فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", "پس (اے جن و انس!) تم اپنے رب کی کون کون سی نعمتوں کو جھٹلاؤ گے؟", "Ar-Rahman 55:13"], ["وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", "اور جو اللہ پر بھروسا کرے تو وہ اسے کافی ہے۔", "At-Talaq 65:3 (آیت کا حصہ)"], ["فَإِنَّ مَعَ الْعُسْرِ يُسْرًا إِنَّ مَعَ الْعُسْرِ يُسْرًا", "پس بے شک مشکل کے ساتھ آسانی ہے۔ بے شک مشکل کے ساتھ آسانی ہے۔", "Ash-Sharh 94:5-6"]];

    function dailyIndex() {
        var n = new Date();
        var dayOfYear = Math.floor((Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) - Date.UTC(n.getFullYear(), 0, 0)) / 86400000);
        return dayOfYear % DAILY_AYAT.length;
    }

    function renderDailyAyat() {
        var box = document.getElementById('dailyCard');
        if (!box) return;
        var a = DAILY_AYAT[dailyIndex()];
        box.innerHTML =
            '<div class="daily-card">' +
              '<div class="d-label">📖 AAJ KI AYAT</div>' +
              '<div class="d-ar">' + a[0] + '</div>' +
              '<div class="d-ur">' + a[1] + '</div>' +
              '<div class="d-ref">' + a[2] + '</div>' +
              '<div class="d-acts">' +
                '<button type="button" id="dailySuno" class="d-btn">🔊 Suno</button>' +
                '<button type="button" id="dailyShare" class="d-btn d-ghost">📤 Share</button>' +
              '</div>' +
            '</div>';
        document.getElementById('dailySuno').onclick = function () {
            if (window.QSpeech) QSpeech.speak(a[0], { lang: 'ar', rate: 0.7, btn: this });
        };
        document.getElementById('dailyShare').onclick = function () {
            var txt = a[0] + '\n\n' + a[1] + '\n\n(' + a[2] + ')\n\n- Quraan Ustad';
            if (navigator.share) navigator.share({ title: 'Quraan Ustad', text: txt }).catch(function () {});
            else if (navigator.clipboard) { navigator.clipboard.writeText(txt); if (window.showToast) showToast('📋 Copy ho gaya!'); }
        };
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDailyAyat); else renderDailyAyat();

    // ==========================================
    // 🔊 GLOBAL SOUND EFFECTS (For Exams & UI)
    // ==========================================
    (function() {
        let ctx = null;
        function getCtx() {
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return null;
                if (!ctx) ctx = new AC();
                if (ctx.state === 'suspended') ctx.resume();
                return ctx;
            } catch (e) { return null; }
        }

        function tone(freqs) {
            const c = getCtx();
            if (!c) return;
            const t0 = c.currentTime + 0.02;
            freqs.forEach(f => {
                const osc = c.createOscillator(), g = c.createGain();
                osc.type = f.type || 'sine';
                osc.frequency.setValueAtTime(f.f, t0 + (f.t || 0));
                if (f.f2) osc.frequency.exponentialRampToValueAtTime(f.f2, t0 + (f.t || 0) + f.d);
                g.gain.setValueAtTime(0.0001, t0 + (f.t || 0));
                g.gain.exponentialRampToValueAtTime(f.vol || 0.2, t0 + (f.t || 0) + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + (f.t || 0) + f.d);
                osc.connect(g); g.connect(c.destination);
                osc.start(t0 + (f.t || 0)); osc.stop(t0 + (f.t || 0) + f.d + 0.05);
            });
        }

        window.QSSFX = {
            correct: function() { tone([{f: 880, t: 0, d: 0.15}, {f: 1319, t: 0.1, d: 0.4}]); if(navigator.vibrate) navigator.vibrate(30); },
            wrong: function() { tone([{f: 250, f2: 150, t: 0, d: 0.3, type: 'sawtooth', vol: 0.3}]); if(navigator.vibrate) navigator.vibrate([100, 50, 100]); },
            win: function() { tone([{f: 523, t: 0, d: 0.1}, {f: 659, t: 0.1, d: 0.1}, {f: 784, t: 0.2, d: 0.1}, {f: 1047, t: 0.3, d: 0.6, vol: 0.3}]); }
        };
    })();
})();
