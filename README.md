# 📖 Quran & Namaz Dictionary App

Ek **Interactive aur Smart Web App** jisme aap Quran aur Namaz ke lafzon ko padh sakte hain, unka matlab samajh sakte hain, aur sabse khaas baat — **unhe sun bhi sakte hain!**

Jab aap kisi bhi lafz par touch (ya click) karte hain, toh app ka **AI Voice Engine** wo Arabic lafz bolta hai. Ye app 100% free hai, koi login nahi, koi API key nahi, aur koi server nahi chahiye. Sab kuch aapke browser me chalta hai.

## ✨ Features

- **🔊 Touch to Speak:** Kisi bhi card par click karo aur Arabic pronunciation suno (Web Speech API dwara).
- **📚 3 Categories:** Namaz ki Duaen, Quran ke 326 Alfaz, aur Quran ke 650 Alfaz.
- **🔍 Smart Search:** Arabic, Roman (English) ya Urdu me type karke lafz dhoondo.
- **📱 Mobile Friendly:** Phone, tablet aur computer par perfect chalta hai.
- **🎨 Premium UI:** Islamic green aur gold theme ke saath khoobsurat design.
- **🆓 100% Free & Offline:** Internet sirf page load hone ke liye chahiye, voice mobile ke andar se aati hai.

## 🚀 GitHub Pages par Live Kaise Karein?

Agar aap isko apni website banana chahte hain, toh ye steps follow karein:

1. GitHub par ek naya **Public** repository banayein.
2. In 4 files ko upload karein: `index.html`, `style.css`, `script.js`, aur `README.md`.
3. Repo ki **Settings** me jayein.
4. Left menu me **Pages** par click karein.
5. **Source** me `Deploy from a branch` select karein.
6. **Branch** me `main` aur folder me `/ (root)` select karke **Save** karein.
7. 1-2 minute baad aapko aapki website ka link mil jayega!

## 🛠️ Naye Alfaz (Words) Kaise Add Karein?

Aapke paas jo PDFs hain (Jisme 900+ lafz hain), unko is app me add karna bohot aasan hai. 

Bas `script.js` file open karein aur `appData` wale section me jayein. Wahan aapko aise data dikhega:

```javascript
const appData = {
    namaz: [
        { arabic: "أَشْهَدُ أَنْ لَّا إِلَهَ إِلَّا اللَّهُ", roman: "Ashhadu an la ilaha illallah", urdu: "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں" },
        // Yahan naya word add karein
    ]
};