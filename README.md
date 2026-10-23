# 📖 Quraan and Duaa Ustad

Ek simple, mobile-friendly web app (PWA) jisse Quran ke alfaz, namaz ki duaen aur azkar aasaani se seekhe ja sakte hain. Koi build ya install ki zaroorat nahi.

<p align="center"><img src="icon.png" width="140" alt="App icon"></p>

## ✨ Features

### 📚 Sabaq (90 Days Course)
- Har din 10 alfaz (kul 900) — Arabic + Roman + meaning, **Mashq** aur tafseel
- Meaning 3 tarah se: **اردو / Roman / हिंदी**
- Arabic lafz aur **Mashq par tap karke Qari ki awaaz** suniye 🔊
- 📖 **Har lafz ke saath Quran ki ayat** (abhi Day 1–10, pehle 100 lafz): ayat mein wo lafz **alag rang** mein, **surah aur ayat ka hawala**, aur ayat par tap karke **Qari Mishary Alafasy** ki awaaz. Ayat ka text Maktaba Shamila se.
- 📝 **Daily Exam** — roz 10 sawal, 8 sahi hon to agla din unlock
- 🥈 **Silver Exam (500 lafz)** — Day 50 poora hote hi **50 mushkil sawal**. **80% (40/50)** laayen to Silver Sanad milti hai. **Jab tak pass nahi, Day 51 se aage sab band (🔒).**
- 🥇 **Final Exam (900 lafz)** — Day 90 ke baad **75 sawal**, pass **80% (60/75)**. Silver aur Final **dono 80%+** hon tabhi Gold Sanad.
- Exam fail ho to dobara de sakte hain (har baar naye sawal). Sanad download/share ho sakti hai.
- 🔥 Streak, ⭐ XP/Levels, 🏅 Badges, 🛒 Inaam Ghar (Shop)
- 📤 Lafz ya badge ki share card (WhatsApp / Insta)
- 📖 **Aaj ki Ayat**, 👤 alag-alag naam ki alag profile (har ki apni history)

**Mushkil sawal kaise bante hain:** jo lafz aapne daily exam mein galat kiye wo pehle aate hain, phir aakhri dinon ke kam aane wale aur lambe lafz. Galat options bhi sahi jawab jaise lambai ke hote hain, isliye andaze se pass hona mushkil hai.

### 🤲 Masnoon Duaein (`dua.html`)
- **93 duaein**: Namaz (59), Subah-Sham Azkar, Mushkil & Pareshani, Bimari & Shifa, Sone se Pehle
- Har dua: Arabic (line-wise) + Roman + Urdu tarjuma + tafseel + hawala
- 🔍 Search (Urdu ya Roman)
- **⭐ Favourites** — jo dua baar baar padhni ho, card ke ☆ par tap karein. Upar **⭐ Favourites** tab mein sab ek jagah milengi (search bhi chalta hai). Har profile ki apni favourites list.
- A- / A+ se Arabic aur Urdu ka size

### 🕌 Tajweed (`tajweed.html`)
Basic / Intermediate / High qawaid, misaalon ke saath — har misaal Qari ki awaaz mein.

### 🎮 Games (`games.html`)
🏆 KBC · ⭐ Sahaba · 🧠 Memory · 😀 Emoji — nasheed aur sound effects ke saath.

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
├── wordAyat.js      # Har lafz -> Quran ki ayat (Day 1-10 ke 100 lafz), hawala ke saath
├── dua.html         # Masnoon duaein + Favourites
├── tajweed.html     # Tajweed ke qawaid
├── games.html       # Games
├── asma.html        # Asma wala page
├── speech.js        # 🔊 Suno / Roko — Qari + phone ki awaaz ko jodta hai
├── qari.js          # Quran text pehchan kar Qari ki recording dhoondhta hai
├── progress.js      # Levels, badges, share card
├── ui.js            # Splash, text size (A-/A+), Aaj ki Ayat
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

> Koi bhi file badalne par `sw.js` mein `CACHE_NAME` ka number badha dein (jaise `v24` → `v25`), taake purane phones par naya version aaye. Users ki history (localStorage) par koi asar nahi padta.

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
