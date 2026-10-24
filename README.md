# 📖 Quraan and Duaa Ustad

Ek simple, mobile-friendly web app (PWA) jisse Quran ke alfaz, namaz ki duaen aur azkar aasaani se seekhe ja sakte hain. Koi build ya install ki zaroorat nahi.

<p align="center"><img src="icon.png" width="140" alt="App icon"></p>

## ✨ Features

### 📚 Sabaq (90 Days Course)
- Har din 10 alfaz (kul 900) — Arabic + Roman + meaning, **Mashq** aur tafseel
- Meaning 3 tarah se: **اردو / Roman / हिंदी**
- Arabic lafz aur **Mashq par tap karke Qari ki awaaz** suniye 🔊
- 📖 **Har lafz ke saath Quran ki ayat** (abhi Day 1–50: lafz 1–500, poore): ayat mein wo lafz **alag rang** mein, **surah aur ayat ka hawala**, aur ayat par tap karke **Qari Mishary Alafasy** ki awaaz. Har ayat ke neeche **⬇️ Download** (app mein save, net ke bina bhi sunein), **📥 MP3 file** (phone mein file utaarein) aur **🗑 Hatao**; din ke upar **Is din ki sab ayaat / Sab ayaat** ek saath download. Ayat ka text Maktaba Shamila se.
- 📝 **Daily Exam** — roz 10 sawal, 8 sahi hon to agla din unlock
- 🗺️ **92 padav ka safar**: 90 din + beech mein 🥈 Silver (Day 50 ke baad) + aakhir mein 🥇 Gold
- 🥈 **Silver Exam (500 lafz)** — Day 50 poora hote hi **50 mushkil sawal**. **80% (40/50)** laayen to Silver Sanad milti hai. **Jab tak pass nahi, Day 51 se aage sab band (🔒).**
- 🥇 **Final Exam (900 lafz)** — Day 90 ke baad **75 sawal**, pass **80% (60/75)**. Silver aur Final **dono 80%+** hon tabhi Gold Sanad.
- Exam fail ho to dobara de sakte hain (har baar naye sawal). Sanad download/share ho sakti hai.
- 🔥 Streak, ⭐ XP/Levels, 🏅 Badges
- 🛒 **Inaam Ghar (Shop)** — 3 themes + **16 stickers** (Aam / Khaas / Nayaab / Shahi). **Kharida hua item hamesha profile ke paas rehta hai**; theme badalne/reset karne se kuch khatam nahi hota, Shop se **🎨 Lagayein** dabayein. Stickers (max 3) **profile ke naam ke baazu mein** dikhte hain (Shahi stickers chamakte hain ✨)
- 📤 Lafz ya badge ki share card (WhatsApp / Insta)
- 📖 **Aaj ki Ayat**, 👤 alag-alag naam ki alag profile (har ki apni history)

**Silver/Gold exam mein anbiya ke naam (Adam, Musa, Isa, Muhammad ﷺ wagairah) nahi aate** — na sawal mein, na options mein. Roz ke Day exam mein wo aate hain.

**Mushkil sawal kaise bante hain:** jo lafz aapne daily exam mein galat kiye wo pehle aate hain, phir aakhri dinon ke kam aane wale aur lambe lafz. Galat options bhi sahi jawab jaise lambai ke hote hain, isliye andaze se pass hona mushkil hai.

- 🧠 **Kamzor lafz revision** (galat hue lafz dobara) • 🔔 **Roz ki yaad** (.ics) • 🔍 **Sanad No. + jaanch** (certificate par Sanad No.)
- 🏠 **Dashboard**: Maqsad → shortcuts → Aaj ki Ayat → Namaz/Yaad → Safar → Aaj ke lafz

### 🤲 Masnoon Duaein (`dua.html`)
- **93 duaein**: Namaz (59), Subah-Sham Azkar, Mushkil & Pareshani, Bimari & Shifa, Sone se Pehle
- Har dua: Arabic (line-wise) + Roman + Urdu tarjuma + tafseel + hawala
- 🔍 Search (Urdu ya Roman)
- **⭐ Favourites** — jo dua baar baar padhni ho, card ke ☆ par tap karein. Upar **⭐ Favourites** tab mein sab ek jagah milengi (search bhi chalta hai). Har profile ki apni favourites list.
- A- / A+ se Arabic aur Urdu ka size

### 🕌 Tajweed (`tajweed.html`)
Basic / Intermediate / High qawaid, misaalon ke saath — har misaal Qari ki awaaz mein.

### 🕌 Namaz (`namaz.js`)
- **Azan ke waqt**: 📍 location se Aladhan API se 5 waqt aate hain (ya khud time bharein). Asr: Hanafi / Shafi.
- **Roz ek baar sawal**: Isha ke baad (ya kal ka na bhara ho to subah) "Poori namaz padhi?" — ✅ sab padhi = +25 XP, 🔥 poori-namaz streak, 3/7/30 din ke badges.
- **Azan par 20 min lock**: azan ke waqt se 20 minute app par poori screen band; reload se bhi nahi hatti. Zaroori kaam ke liye 5 second dabaye rakhne ka button. Har profile ke paas apna **🔒 tick** hai (Namaz panel mein) — tick hata do to lock nahi lagta; admin par bhi yahi tick chalta hai.
- **📊 Mahine ka hisaab**: 5 boxes (Fajr–Isha) mein padhi/chhooti, % aur din-ba-din grid (box dabakar badal sakte hain). Sirf **is mahine + pichle mahine** ka data rakha jata hai. Mahine ke aakhri din Isha ke baad (ya naye mahine mein pehli baar kholne par) apne aap hisaab dikhta hai.
- **🔊 Azan ki awaaz**: azan ka waqt aate hi (app khula ho to) apne aap, lock chalu ho ya na ho, `azan-aksa.mp3` / `azan-sweet.mp3` / `azan-3.mp3` mein se chuni hui bajti hai (Settings mein badal sakte hain ya band). Phone kabhi-kabhi bina chhue awaaz rok deta hai.
- **📅 Calendar alarm**: 2 mahine ke azan alarms ki `.ics` file (app band ho tab bhi phone bajata hai).
- Dhyan: web app phone ko **system-level lock nahi kar sakti** — lock sirf app ke andar hai.
- Har page ke `<head>` mein `<script src="namaz.js" defer></script>` chahiye (index aur games mein lag chuka hai; dua.html, tajweed.html, asma.html mein bhi lagayein taake wahan bhi lock chale).

### 📱 Android App (`android/`)
Azan app band hone par bhi + asli phone lock ke liye. Dekhein `android/README.md` (GitHub Actions se APK banta hai).

### 🎮 Games (`games.html`)
🏆 KBC · ⭐ Sahaba · 🧠 Memory · 😀 Emoji — sound effects ke saath. Header ka **🎵 button** har game mein nasheed chalata/rokta hai (`nasheed.mp3` chahiye).

### Aur
🔊 Suno · 🌙 Dark/Light mode · 🔐 Password login · 📱 PWA (home screen par install)

## 🎙️ Qari ki awaaz (Quran ka har hissa)

App mein jahan bhi Arabic par 🔊 / tap hai — dua, sabaq, mashq, tajweed, Aaj ki Ayat — wahan **jo hissa Quran ka hai wo Qari ki asli recording se chalta hai, phone ki robot awaaz se nahi.**

Kaise kaam karta hai (`qari.js`):

1. Poora Quran text (harakat ke saath) ek baar Quran.com se aata hai aur phone mein save ho jaata hai.
2. App ka Arabic text poore Quran se milaya jaata hai — **ek se zyada ayat aur ek se zyada surah bhi** (jaise Aamanar-Rasulu, teeno Qul). Spelling ka chhota farq maaf hai (jaise `يَئُودُهُ` / `يَـُٔودُهُ`).
3. **Poori ayat** mile to us ayat ki **Qari Mishary Rashid Alafasy** ki recording chalti hai (everyayah.com se, na chale to Quran.com se). Ayat ka **tukda** ho to Quran.com ki lafz-ba-lafz recording chalti hai.
4. **Jo Quran mein nahi hai** (hadees ki duaein, jaise "Allahumma inni a'udhu bika...") wo phone ki awaaz mein chalta hai. Agar ek hi dua mein Quran + hadees dono hon (jaise musibat ki dua) to Quran wala hissa Qari se aur baaki phone se.
5. Net na ho ya recording na chale to us hisse ke liye phone ki awaaz chalti hai.

Dhyan dein:
- Qari ki recording ke liye **internet zaroori** hai (Quran text pehli baar ke baad offline bhi match ho jaata hai).
- Quran ka hissa sahi pehchanne ke liye dua/sabaq ke `arabic` mein Quran ka text **bilkul sahi** likhein (Quran.com se copy karna behtar hai). Quran aur hadees ko ek hi dua mein milana ho to bhi chalega, magar alag-alag cards behtar hain.
- **Qari badalna** ho to `qari.js` mein `RECITER` (everyayah.com ka folder naam, jaise `Alafasy_128kbps`) badlein.

## 📁 Files

```
.
├── index.html       # Sabaq, exam, login, shop, certificate (main app)
├── courseData.js    # 90 din ka course data (900 alfaz)
├── wordAyat.js      # Har lafz -> Quran ki ayat (Day 1-50 ke 500 lafz), hawala ke saath
├── dua.html         # Masnoon duaein + Favourites
├── tajweed.html     # Tajweed ke qawaid
├── games.html       # Games
├── asma.html        # Asma wala page
├── speech.js        # 🔊 Suno / Roko — Qari + phone ki awaaz ko jodta hai
├── qari.js          # Quran text pehchan kar Qari ki recording dhoondhta hai
├── progress.js      # Levels, badges, share card
├── ui.js            # Splash, text size (A-/A+), Aaj ki Ayat
├── azan-aksa.mp3 / azan-sweet.mp3 / azan-3.mp3   # Azan ki awaaz
├── nasheed.mp3      # Games ka nasheed
├── namaz.js         # Azan times, roz ki namaz ka sawal, 20 min lock, Calendar alarms
├── games-audio.js   # Games ka nasheed aur sound effects (nasheed.mp3 chahiye)
├── theme.css        # Shared theme
├── install.js       # Install popup (upar banner)
├── manifest.json    # PWA settings
├── sw.js            # Service worker (offline)
├── icon.png / icon-192.png / icon-maskable.png / signature.png
└── README.md
```

## 🚀 GitHub Pages par Live Karein

1. Repo ki **Settings → Pages** kholen.
2. **Source:** `Deploy from a branch` → branch `main`, folder `/ (root)` → **Save**.
3. App is link par live hogi: `https://<your-username>.github.io/<repo-name>/`
4. Phone ke browser mein kholkar **Add to Home Screen** karein.

Locally chalane ke liye `python3 -m http.server` chalayein aur `http://localhost:8000` kholen (PWA install aur Qari ki awaaz ke liye server zaroori hai, seedha file kholne se kuch cheezein nahi chalti).

> Koi bhi file badalne par `sw.js` mein `CACHE_NAME` ka number badha dein (jaise `v36` → `v37`), taake purane phones par naya version aaye. Users ki history (localStorage) par koi asar nahi padta.

## ⬇️ Ayat Download (Offline)

- Download karne par ayat ki Mishary wali mp3 phone ke **Cache Storage** (`qs-mishary-v1`) mein save hoti hai; phir ayat par tap karne se pehle wahi saved copy chalti hai (net na ho tab bhi). Saved na ho to pehle jaisa net se.
- `sw.js` is cache (`qs-mishary-v1`) ko version badalne par bhi delete nahi karta. Naam badlein to `qari.js` (`DL_CACHE`) aur `sw.js` (`KEEP_CACHES`) dono mein.
- Download ke liye internet chahiye aur everyayah.com / Quran.com ko browser se fetch karne dena chahiye (CORS).

## 🛠️ Data Badalna / Badhaana

**Sabaq** — `courseData.js` mein:

```js
{ day: 1, words: [
  { a: "اللَّهُ", r: "Allah", u: "اللہ", u_ro: "Allah", u_hi: "अल्लाह",
    m: "اللَّهُ أَحَدٌ", t: "سب کا رب", t_ro: "Sab ka Rabb", t_hi: "सब का रब" }
]}
```

`a` = Arabic, `r` = Roman, `u` / `u_ro` / `u_hi` = meaning (Urdu / Roman / Hindi), `m` = mashq (Quran ka jumla), `t` / `t_ro` / `t_hi` = tafseel.

**Lafz ke saath ayat** — `wordAyat.js` mein:

```js
wordAyat["اللَّهُ"] = { k: "112:1", i: 3 };           // k = surah:ayat, i = ayat mein lafz ka number (0 se)
ayatText["112:1"]   = { sn: "الإخلاص", sr: "Al-Ikhlas", t: "قُلْ هُوَ اللَّهُ أَحَدٌ" };
```

Key wahi Arabic hai jo `courseData.js` ke `a` mein hai. Jis lafz ki entry nahi hoti uske card par ayat ka box nahi dikhta. Ayat ka text Maktaba Shamila (`shamela_get_aya`) se lein taake Quran ke saath bilkul ek jaisa rahe. Kuch lafz (jaise `لِمَاذَا`) Quran mein is shakal mein nahi aate — unke liye `n` (note) likha hai aur Quran ka sabse qareebi lafz (`لِمَ`) dikhaya gaya hai.

**Duaein** — `dua.html` ke andar `allDuas` array mein:

```js
{ cat: "namaz", title: "5. Masjid mein dakhil hote waqt",
  arabic: "...", roman: "...", urdu: "...", tafseel: "...", hawala: "Sahih Muslim 713" }
```

`cat` = `namaz` / `subah` / `mushkil` / `bimari` / `sone`. Favourites `cat` + `title` se pehchani jaati hain, isliye kisi dua ka `title` badalne par uski favourite hat jayegi.

## 🔐 Password

Login ke passwords `index.html` ke script mein (`ADMIN_PASSWORD`, `GUEST_PASSWORD`) hain. Yeh client-side hain, isliye asli security nahi dete — public repo mein koi bhi inhein dekh sakta hai. Asli password README ya kisi public jagah par na likhein.

## 📬 Contact

[gormefauzan@gmail.com](mailto:gormefauzan@gmail.com)
