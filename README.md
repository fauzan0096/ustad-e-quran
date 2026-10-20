# 📖 Quraan and Duaa Ustad

Ek simple, mobile-friendly web app (PWA) jisse Quran ke alfaz, namaz ki duaen aur azkar aasaani se seekhe ja sakte hain. Koi build ya install ki zaroorat nahi.

<p align="center"><img src="icon.png" width="140" alt="App icon"></p>

## ✨ Features

- 📚 **Sabaq (40 Days Course)** — har din 10 alfaz, Arabic + Roman + Urdu meaning, mashq aur tafseel
- 📝 **Daily Exam** — Urdu meaning ka MCQ test (pass hone par agla din unlock)
- 🤲 **Namaz ki Duaen** aur 🌅 **Azkar** — search ke saath
- 📖 **Quran Alfaz** — searchable list
- 🎮 **Islamic GK Quiz**
- 🔊 Suno, 📤 Share, 🔥 Streak, 🌙 Dark/Light mode, 🔐 Password login
- 📱 **PWA** — phone ki home screen par install kar sakte hain

## 📁 Files

```
.
├── index.html      # Poori app (HTML + CSS + JS + data)
├── manifest.json   # PWA settings
├── icon.png        # App icon 512x512
├── icon-192.png    # App icon 192x192
└── README.md
```

## 🚀 GitHub Pages par Live Karein

1. Repo ki **Settings → Pages** kholen.
2. **Source:** `Deploy from a branch` → branch `main`, folder `/ (root)` → **Save**.
3. App is link par live hogi: `https://<your-username>.github.io/<repo-name>/`
4. Phone ke browser mein kholkar **Add to Home Screen** karein.

Locally chalane ke liye `index.html` browser mein open karein (PWA install ke liye server zaroori hai, jaise `python3 -m http.server`).

## 🛠️ Data Badalna / Badhaana

Course data `index.html` ke andar `courseData` array mein hai:

```js
{ day: 1, words: [
  { a: "اللَّهُ", r: "Allah", u: "اللہ", m: "اللَّهُ أَحَدٌ", t: "اسمِ اعظم" }
]}
```

`a` = Arabic, `r` = Roman, `u` = Urdu meaning, `m` = mashq, `t` = tafseel.
Namaz, Azkar, Quran Alfaz aur GK quiz ka data bhi usi script mein (`namazData`, `azkarData`, `quranWordsData`, `gkData`) hai.

## 🔐 Password

Passwords `index.html` ke `CONFIG` section mein (`USER_PASSWORD`, `ADMIN_PASSWORD`) badlein. Yeh client-side hain, isliye asli security nahi dete.

## 📬 Contact

[gormefauzan@gmail.com](mailto:gormefauzan@gmail.com)
