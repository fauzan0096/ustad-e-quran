// ==========================================================
// app.js — Fahm-ul-Quran ka shared UI ek file mein
//  1) UI       : splash, text size (A-/A+), Aaj ki Ayat
//  2) INSTALL  : install popup + service worker
//  3) PROGRESS : levels, badges, share card (sirf index.html par chalta hai)
// Har page mein head mein ek line: <script src="app.js"></script>
// Jis page par splash/text-size nahi chahiye (jaise asma.html) wahan us se pehle:
//   <script>window.QS_LITE=1</script>
// ==========================================================

// ───────────── 1) UI ─────────────
if (!window.QS_LITE) {
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
        '[data-theme="dark"] .daily-card .d-ghost,[data-theme="midnight"] .daily-card .d-ghost,[data-theme="royal"] .daily-card .d-ghost{color:var(--gold-bright,#D9B65A);border-color:var(--gold-bright,#D9B65A)}' +
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
            '<div class="nm">Fahm-ul-Quran</div>' +
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
            var txt = a[0] + '\n\n' + a[1] + '\n\n(' + a[2] + ')\n\n- Fahm-ul-Quran';
            if (navigator.share) navigator.share({ title: 'Fahm-ul-Quran', text: txt }).catch(function () {});
            else if (navigator.clipboard) { navigator.clipboard.writeText(txt); if (window.showToast) showToast('📋 Copy ho gaya!'); }
        };
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDailyAyat); else renderDailyAyat();
})();
}

// ───────────── 2) INSTALL ─────────────
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
              '<h2 id="qsInstTitle">Fahm-ul-Quran app install karein</h2>' +
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

// ───────────── 3) PROGRESS (index.html) ─────────────
(function () {
    function start() {
        if (!document.getElementById('mainApp')) return;   // sirf index.html
/* Batch 3 — index.html ke liye:
   1) Levels aur Badges (streak, din mukammal, full marks, dohrai, pasandida)
   2) Share card: lafz ya badge ki sundar tasveer banakar WhatsApp par bhejna
   Ye file index.html ke main script ke BAAD load hoti hai. */
(function () {
    // ---------- storage helpers ----------
    // Profile ke hisaab se alag save hone wali keys (index.html ka pk() 'p_<profile>_<key>' banata hai)
    var PER = { currentDay: 1, streak: 1, bestStreak: 1, bookmarks: 1, perfectExams: 1, revisionsDone: 1, badgesEarned: 1, namazBest: 1 };
    function K(k) {
        try { if (PER[k] && typeof pk === 'function' && typeof activeProfile !== 'undefined' && activeProfile) return pk(k); } catch (e) {}
        return k;
    }
    function lsGet(k) { try { return localStorage.getItem(K(k)); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(K(k), v); } catch (e) {} }
    function lsJSON(k, d) { try { var v = JSON.parse(lsGet(k)); return v || d; } catch (e) { return d; } }
    function num(k) { return parseInt(lsGet(k), 10) || 0; }
    function toast(m) { if (typeof showToast === 'function') showToast(m); }

    // ---------- Levels ----------
    var LEVELS = [
        { n: 'Mubtadi',     i: '🌱', min: 0 },
        { n: 'Talib-e-Ilm', i: '📘', min: 50 },
        { n: 'Mutaalim',    i: '📗', min: 150 },
        { n: 'Mahir',       i: '⭐', min: 300 },
        { n: 'Ustad',       i: '👑', min: 450 }
    ];

    // ---------- Badges ----------
    var BADGES = [
        { id: 's3',  i: '🔥', n: '3 din ki streak',        d: 'Lagatar 3 din app kholi',               t: function (s) { return s.streak >= 3; } },
        { id: 's7',  i: '🔥', n: '7 din ki streak',        d: 'Poora ek hafta roz aaye',               t: function (s) { return s.streak >= 7; } },
        { id: 's30', i: '🌙', n: '30 din ki streak',       d: 'Poora ek mahina roz aaye',              t: function (s) { return s.streak >= 30; } },
        { id: 'd1',  i: '🌟', n: 'Pehla qadam',            d: 'Pehla din mukammal kiya',               t: function (s) { return s.days >= 1; } },
        { id: 'd10', i: '📚', n: 'Pehle 10 din mukammal',  d: '100 lafz seekh liye',                   t: function (s) { return s.days >= 10; } },
        { id: 'd25', i: '🧭', n: 'Aadha safar',            d: '25 din mukammal',                       t: function (s) { return s.days >= 25; } },
        { id: 'd50', i: '🏆', n: 'Course mukammal',        d: 'Sab din mukammal, Mashallah!',          t: function (s) { return s.days >= s.total; } },
        { id: 'p1',  i: '💯', n: 'Full marks',             d: 'Exam mein 10/10 aaye',                  t: function (s) { return s.perfect >= 1; } },
        { id: 'p5',  i: '🎯', n: '5 baar full marks',      d: 'Exam mein 5 baar 10/10',                t: function (s) { return s.perfect >= 5; } },
        { id: 'r1',  i: '🔁', n: 'Dohrai mukammal',        d: 'Dohrai mein sab lafz sahi',             t: function (s) { return s.rev >= 1; } },
        { id: 'n3',  i: '🕌', n: '3 din poori namaz',      d: 'Lagatar 3 din paanchon namaz',          t: function (s) { return s.namaz >= 3; } },
        { id: 'n7',  i: '🤲', n: 'Namazi — 7 din',         d: 'Poora hafta paanchon namaz',            t: function (s) { return s.namaz >= 7; } },
        { id: 'n30', i: '🌙', n: 'Pakka Namazi — 30 din',  d: 'Poora mahina paanchon namaz, MashaAllah!', t: function (s) { return s.namaz >= 30; } },
        { id: 'f10', i: '❤️', n: '10 pasandida',           d: '10 lafz pasandida mein jode',           t: function (s) { return s.favs >= 10; } }
    ];

    function state() {
        var total = (typeof courseData !== 'undefined' && courseData.length) ? courseData.length : 50;
        var prog = Math.max(1, num('currentDay') || 1);          // asli progress (admin ka dekhna nahi ginta)
        var days = Math.min(total, prog - 1);
        var words = 0;
        if (typeof courseData !== 'undefined') courseData.forEach(function (d) { if (d.day <= days) words += d.words.length; });
        var streak = num('streak');
        var best = Math.max(num('bestStreak'), streak);
        if (best !== num('bestStreak')) lsSet('bestStreak', best);
        return { total: total, days: days, words: words, streak: Math.max(streak, best), cur: streak, best: best,
                 favs: lsJSON('bookmarks', []).length, namaz: num('namazBest'), perfect: num('perfectExams'), rev: num('revisionsDone') };
    }

    function levelOf(words) {
        var idx = 0;
        for (var i = 0; i < LEVELS.length; i++) if (words >= LEVELS[i].min) idx = i;
        return idx;
    }

    function earnedIds(s) { return BADGES.filter(function (b) { return b.t(s); }).map(function (b) { return b.id; }); }

    // ---------- CSS ----------
    var st = document.createElement('style');
    st.textContent =
        '.share-ico{position:absolute;top:8px;left:8px;width:40px;height:40px;border-radius:50%;border:none;background:transparent;font-size:18px;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center}' +
        '.share-ico:active{transform:scale(.9)}' +
        '.today-card .share-ico{background:rgba(255,255,255,.14)}' +
        '#levelStrip{max-width:1200px;margin:10px auto 0;padding:0 16px}' +
        '.lv-strip{width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:var(--card-bg);border:1px solid var(--border);box-shadow:var(--shadow);cursor:pointer;text-align:left;color:var(--text);min-height:64px}' +
        '.lv-strip:active{transform:scale(.99)}' +
        '.lv-ico{font-size:30px;flex:0 0 auto}' +
        '.lv-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}' +
        '.lv-main b{font-size:14px}' +
        '.lv-bar{display:block;height:6px;border-radius:6px;background:var(--border);overflow:hidden}' +
        '.lv-bar u{display:block;height:100%;text-decoration:none;background:linear-gradient(90deg,var(--primary),var(--gold-bright));border-radius:6px;transition:width .5s}' +
        '.lv-main small{font-size:11.5px;color:var(--text-light)}' +
        '.lv-bdg{flex:0 0 auto;font-size:12px;font-weight:700;padding:6px 10px;border-radius:14px;background:var(--soft-bg);color:var(--text)}' +
        '.bd-sum{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0 4px}' +
        '.bd-sum span{font-size:12.5px;font-weight:600;padding:6px 12px;border-radius:14px;background:var(--soft-bg);color:var(--text)}' +
        '.bd-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}' +
        '.bd{position:relative;text-align:center;padding:14px 8px 12px;border-radius:16px;border:1px solid var(--border);background:var(--soft-bg)}' +
        '.bd.on{border-color:var(--secondary);background:linear-gradient(180deg,rgba(217,182,90,.18),rgba(217,182,90,.04))}' +
        '.bd .bi{font-size:36px;line-height:1.2}' +
        '.bd:not(.on) .bi{filter:grayscale(1);opacity:.35}' +
        '.bd b{display:block;font-size:13px;margin-top:4px;color:var(--text)}' +
        '.bd small{display:block;font-size:11px;color:var(--text-light);margin-top:2px;line-height:1.35}' +
        '.bd:not(.on) b,.bd:not(.on) small{opacity:.6}' +
        '.bd .bs{margin-top:8px;border:none;background:var(--primary);color:#fff;border-radius:12px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;min-height:32px}' +
        '[data-theme="dark"] .bd .bs{background:var(--gold-bright);color:#2A2008}';
    document.head.appendChild(st);

    // ---------- Level strip ----------
    function renderStrip(s) {
        var row = document.querySelector('.quick-row');
        if (!row) return;
        var el = document.getElementById('levelStrip');
        if (!el) { el = document.createElement('div'); el.id = 'levelStrip'; row.parentNode.insertBefore(el, row.nextSibling); }
        var li = levelOf(s.words), lv = LEVELS[li], nx = LEVELS[li + 1];
        var pct = nx ? Math.round((s.words - lv.min) / (nx.min - lv.min) * 100) : 100;
        var sub = nx ? (s.words + ' / ' + nx.min + ' lafz • agla: ' + nx.n) : (s.words + ' lafz • Sab levels mukammal 🎉');
        el.innerHTML = '<button class="lv-strip" id="lvBtn" aria-label="Badges kholein">' +
            '<span class="lv-ico">' + lv.i + '</span>' +
            '<span class="lv-main"><b>Level ' + (li + 1) + ' · ' + lv.n + '</b><i class="lv-bar"><u style="width:' + pct + '%"></u></i><small>' + sub + '</small></span>' +
            '<span class="lv-bdg">🏅 ' + earnedIds(s).length + '/' + BADGES.length + '</span></button>';
        document.getElementById('lvBtn').onclick = openBadges;
    }

    // ---------- Naye badge ka pata ----------
    function checkNew(s) {
        var now = earnedIds(s);
        var seen = lsJSON('badgesEarned', []);
        var fresh = now.filter(function (id) { return seen.indexOf(id) < 0; });
        if (fresh.length) {
            lsSet('badgesEarned', JSON.stringify(seen.concat(fresh)));
            var b = BADGES.filter(function (x) { return x.id === fresh[0]; })[0];
            toast('🎉 Naya badge: ' + b.i + ' ' + b.n + (fresh.length > 1 ? ' (+' + (fresh.length - 1) + ' aur)' : ''));
        }
    }

    function refresh() {
        var s = state();
        renderStrip(s);
        checkNew(s);
        return s;
    }

    // ---------- Badges modal ----------
    function modal() {
        var m = document.getElementById('badgeModal');
        if (m) return m;
        m = document.createElement('div');
        m.id = 'badgeModal';
        m.className = 'modal hidden';
        m.innerHTML = '<div class="modal-content"><span class="close-btn" id="bdClose">&times;</span>' +
            '<h2 id="bdTitle" style="text-align:center;color:var(--ink)">🏅 Meri Progress</h2>' +
            '<div class="bd-sum" id="bdSum"></div><div class="bd-grid" id="bdGrid"></div></div>';
        document.body.appendChild(m);
        document.getElementById('bdClose').onclick = function () { m.classList.add('hidden'); };
        m.addEventListener('click', function (e) { if (e.target === m) m.classList.add('hidden'); });
        return m;
    }

    function openBadges() {
        var s = refresh(), m = modal(), li = levelOf(s.words), got = earnedIds(s);
        document.getElementById('bdSum').innerHTML =
            '<span>' + LEVELS[li].i + ' ' + LEVELS[li].n + '</span>' +
            '<span>🔥 Streak ' + s.cur + ' (best ' + s.best + ')</span>' +
            '<span>📖 ' + s.words + ' lafz</span>';
        document.getElementById('bdGrid').innerHTML = BADGES.map(function (b) {
            var on = got.indexOf(b.id) >= 0;
            return '<div class="bd ' + (on ? 'on' : '') + '"><div class="bi">' + (on ? b.i : '🔒') + '</div><b>' + b.n + '</b><small>' + b.d + '</small>' +
                (on ? '<button class="bs" data-bshare="' + b.id + '">📤 Share</button>' : '') + '</div>';
        }).join('');
        m.classList.remove('hidden');
    }

    // ---------- Share card (canvas) ----------
    var W = 1080, H = 1350, GOLD = '#D9B65A';

    function rr(ctx, x, y, w, h, r) {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
        else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    }

    function fitText(ctx, text, font, maxW, startPx, minPx, weight) {
        var px = startPx;
        do { ctx.font = (weight || '') + ' ' + px + 'px ' + font; if (ctx.measureText(text).width <= maxW) break; px -= 4; } while (px > minPx);
        return px;
    }

    function wrapLines(ctx, text, maxW) {
        var words = String(text).split(/\s+/), lines = [], cur = '';
        words.forEach(function (w) {
            var t = cur ? cur + ' ' + w : w;
            if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
        });
        if (cur) lines.push(cur);
        return lines;
    }

    async function loadFonts() {
        try {
            await Promise.all([
                document.fonts.load('700 80px Amiri', 'اللَّه'),
                document.fonts.load('700 50px "Noto Nastaliq Urdu"', 'اللہ'),
                document.fonts.load('700 40px Figtree', 'Ab')
            ]);
        } catch (e) {}
    }

    function base(ctx) {
        var g = ctx.createRadialGradient(W / 2, 0, 80, W / 2, 0, H);
        g.addColorStop(0, '#17614B'); g.addColorStop(1, '#0A2E24');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(217,182,90,.12)'; ctx.lineWidth = 2;
        for (var y = 0; y < H; y += 108) for (var x = 0; x < W; x += 108) {
            ctx.strokeRect(x + 27, y + 27, 54, 54);
            ctx.save(); ctx.translate(x + 54, y + 54); ctx.rotate(Math.PI / 4); ctx.strokeRect(-27, -27, 54, 54); ctx.restore();
        }
        ctx.strokeStyle = GOLD; ctx.lineWidth = 6; rr(ctx, 40, 40, W - 80, H - 80, 36); ctx.stroke();
        ctx.strokeStyle = 'rgba(217,182,90,.5)'; ctx.lineWidth = 2; rr(ctx, 62, 62, W - 124, H - 124, 26); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
        ctx.fillStyle = GOLD; ctx.font = '700 58px Amiri, serif';
        ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', W / 2, 168);
        ctx.fillStyle = 'rgba(217,182,90,.5)'; ctx.fillRect(W / 2 - 90, 232, 180, 3);
    }

    function footer(ctx) {
        ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(217,182,90,.5)'; ctx.fillRect(W / 2 - 90, H - 262, 180, 3);
        ctx.fillStyle = '#fff'; ctx.font = '700 66px Amiri, serif';
        ctx.fillText('Fahm-ul-Quran', W / 2, H - 196);
        ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '500 30px Figtree, system-ui, sans-serif';
        ctx.fillText('Quran aur Duaa seekhein', W / 2, H - 134);
    }

    async function drawWord(w) {
        await loadFonts();
        var c = document.createElement('canvas'); c.width = W; c.height = H;
        var ctx = c.getContext('2d');
        base(ctx);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.direction = 'ltr'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '600 30px Figtree, system-ui, sans-serif';
        ctx.fillText('QURAN KA LAFZ', W / 2, 330);
        // Arabic
        ctx.direction = 'rtl'; ctx.fillStyle = '#fff';
        fitText(ctx, w.a, 'Amiri, serif', W - 220, 230, 90, '700');
        ctx.fillText(w.a, W / 2, 560);
        // Roman
        ctx.direction = 'ltr'; ctx.fillStyle = GOLD;
        fitText(ctx, w.r, 'Figtree, system-ui, sans-serif', W - 200, 76, 40, '700');
        ctx.fillText(w.r, W / 2, 770);
        // Urdu
        ctx.direction = 'rtl'; ctx.fillStyle = '#fff';
        ctx.font = '700 70px "Noto Nastaliq Urdu", serif';
        var lines = wrapLines(ctx, w.u, W - 200).slice(0, 3);
        var y0 = 930 - (lines.length - 1) * 55;
        lines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, y0 + i * 110); });
        footer(ctx);
        return c;
    }

    async function drawBadge(b) {
        await loadFonts();
        var c = document.createElement('canvas'); c.width = W; c.height = H;
        var ctx = c.getContext('2d');
        base(ctx);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '600 30px Figtree, system-ui, sans-serif';
        ctx.fillText('NAYA BADGE', W / 2, 330);
        ctx.font = '300px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        ctx.fillText(b.i, W / 2, 600);
        ctx.fillStyle = GOLD;
        fitText(ctx, b.n, 'Amiri, serif', W - 200, 96, 50, '700');
        ctx.fillText(b.n, W / 2, 860);
        ctx.fillStyle = '#fff'; ctx.font = '500 42px Figtree, system-ui, sans-serif';
        wrapLines(ctx, b.d, W - 240).slice(0, 2).forEach(function (ln, i) { ctx.fillText(ln, W / 2, 960 + i * 58); });
        footer(ctx);
        return c;
    }

    async function shareCanvas(canvas, name, text) {
        var blob = await new Promise(function (r) { canvas.toBlob(r, 'image/png'); });
        if (!blob) { toast('❌ Tasveer nahi ban saki'); return; }
        var file = new File([blob], name, { type: 'image/png' });
        var link = location.origin + location.pathname.replace(/[^/]*$/, '');
        try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: text + '\n' + link });
                return;
            }
        } catch (e) { if (e && e.name === 'AbortError') return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        toast('📥 Tasveer save ho gayi — ab WhatsApp se bhej dein');
    }

    async function shareWord(a) {
        var w = (typeof findWord === 'function') ? findWord(a) : null;
        if (!w) return;
        toast('🖼️ Tasveer ban rahi hai...');
        var c = await drawWord(w);
        await shareCanvas(c, 'fahm-ul-quran-lafz.png', w.a + ' — ' + w.u);
    }

    async function shareBadge(id) {
        var b = BADGES.filter(function (x) { return x.id === id; })[0];
        if (!b) return;
        toast('🖼️ Tasveer ban rahi hai...');
        var c = await drawBadge(b);
        await shareCanvas(c, 'fahm-ul-quran-badge.png', b.i + ' ' + b.n + ' — Fahm-ul-Quran');
    }

    // ---------- Events ----------
    document.addEventListener('click', function (e) {
        var s = e.target.closest && e.target.closest('.share-ico');
        if (s) { e.stopPropagation(); shareWord(s.dataset.share); return; }
        var bs = e.target.closest && e.target.closest('[data-bshare]');
        if (bs) { e.stopPropagation(); shareBadge(bs.dataset.bshare); }
    });

    // ---------- Public ----------
    window.QSProgress = {
        refresh: refresh,
        open: openBadges,
        onExam: function (score, total, type) {
            if (total && score === total) {
                lsSet('perfectExams', num('perfectExams') + 1);
                if (type === 'revision') lsSet('revisionsDone', num('revisionsDone') + 1);
            }
            refresh();
        },
        _drawWord: drawWord, _drawBadge: drawBadge
    };

    if (document.getElementById('mainApp') && !document.getElementById('mainApp').classList.contains('hidden')) refresh();
})();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
