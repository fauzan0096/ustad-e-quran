// ==========================================
// 1. DATA (Duaen, Quran, aur 50 GK Questions)
// ==========================================
const duaData = [
    { arabic: "الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", roman: "Alhamdulillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur", urdu: "تمام تعریف اللہ کے لیے ہے جس نے ہمیں نیند کی موت کے بعد زندہ کیا", tafseel: "حدیث: نبی ﷺ جب نیند سے جاگتے تو یہ پڑھتے۔ (صحیح البخاری 6312)" },
    { arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", roman: "Bismillah, tawakkaltu 'alallah, la hawla wa la quwwata illa billah", urdu: "اللہ کے نام سے، میں نے اللہ پر بھروسہ کیا، اور کوئی طاقت نہیں مگر اللہ کی مدد سے", tafseel: "حدیث: جو گھر سے نکلتے وقت یہ پڑھے، اسے ہدایت دی جاتی ہے اور شیطان سے بچا لیا جاتا ہے۔ (سنن ابی داؤد 5095)" },
    { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", roman: "Allahumma inni as'alukal-'afiyata fid-dunya wal-akhirah", urdu: "اے اللہ! میں تجھ سے دنیا و آخرت میں عافیت مانگتا ہوں", tafseel: "حدیث: نبی ﷺ صبح و شام یہ دعا کبھی نہیں چھوڑتے تھے۔ (سنن ابی داؤد 5074)" },
    { arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", roman: "Ya Hayyu ya Qayyumu bi rahmatika astaghith", urdu: "اے زندہ! اے سب کو قائم رکھنے والے! میں تیری رحمت کے وسیلے سے فریاد کرتا ہوں", tafseel: "حدیث: نبی ﷺ نے فاطمہ کو صبح و شام یہ پڑھنے کی وصیت کی۔ (سلسلہ صحیحہ 661)" },
    { arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", roman: "Allahumma rahmataka arju, fala takilni ila nafsi tarfata 'ayn", urdu: "اے اللہ! میں تیری رحمت کا امیدوار ہوں، مجھے پلک جھپکنے کے برابر بھی میرے نفس کے سپرد نہ کر", tafseel: "حدیث: پریشانی کے وقت یہ دعا پڑھنا مسنون ہے۔ (سنن ابی داؤد 5090)" }
];

const quranData = [
    { arabic: "اللَّهُ", roman: "Allah", urdu: "اللہ، سب کا رب اور مالک", tafseel: "یہ اسمِ اعظم ہے۔ قرآن کی سب سے زیادہ آنے والی آیت۔" },
    { arabic: "رَبِّ", roman: "Rabb", urdu: "پالنے والا، مالک", tafseel: "رب کا مطلب ہے وہ جو ہمیں پیدا کرے، پالے، اور سنبھالے رکھے۔" },
    { arabic: "رَحْمَن", roman: "Rahmaan", urdu: "بہت مہربان", tafseel: "الرحمٰن کا مطلب ہے وہ جو تمام مخلوقات پر بلا تفریق رحم کرنے والا ہے۔" },
    { arabic: "رَحِيم", roman: "Raheem", urdu: "نہایت رحم والا", tafseel: "الرحیم کا مطلب ہے وہ جو خاص طور پر ایمان والوں پر رحم کرنے والا ہے۔" },
    { arabic: "غَفُور", roman: "Ghafoor", urdu: "بخشنی والا", tafseel: "الغفور وہ ہے جو بندوں کے گناہوں کو بار بار معاف کرنے والا ہے۔" },
    { arabic: "بَعُوضَة", roman: "Ba'oodah", urdu: "مچھر", tafseel: "اللہ تعالیٰ نے قرآن میں مچھر کی مثال دی ہے (سورۃ البقرہ 2:26)۔" },
    { arabic: "قِثَّاء", roman: "Qiththa'a", urdu: "ککڑی", tafseel: "بنی اسرائیل نے کھانے کی تنوع مانگتے ہوئے یہ لفظ کہا تھا۔" }
];

const gkQuestions = [
    { q: "Islam mein kitne Arkaan (pillars) hain?", options: ["3", "5", "7", "10"], correct: 1 },
    { q: "Quran kis Nabi par nazil hua?", options: ["Hazrat Musa (AS)", "Hazrat Isa (AS)", "Hazrat Muhammad (SAW)", "Hazrat Ibrahim (AS)"], correct: 2 },
    { q: "Pehle Nabi kaun the?", options: ["Hazrat Nuh (AS)", "Hazrat Aadam (AS)", "Hazrat Ibrahim (AS)", "Hazrat Musa (AS)"], correct: 1 },
    { q: "Namaz mein kitni rakat farz hoti hain (1 din mein total)?", options: ["15", "17", "20", "12"], correct: 1 },
    { q: "Kis Nabi ko 'Kalimullah' kaha jata hai?", options: ["Hazrat Isa (AS)", "Hazrat Musa (AS)", "Hazrat Dawood (AS)", "Hazrat Yusuf (AS)"], correct: 1 },
    { q: "Quran ki sabse badi ayat kaun si hai?", options: ["Ayatul Kursi", "Surah Fatiha", "Surah Ikhlas", "Ayat-ul-Birr"], correct: 0 },
    { q: "Quran mein kitni Surah hain?", options: ["114", "100", "120", "110"], correct: 0 },
    { q: "Roza kis mahine mein farz kiya gaya?", options: ["Ramzan", "Shawwal", "Muharram", "Rajab"], correct: 0 },
    { q: "Hazrat Ali (RA) ka laqab kya tha?", options: ["Siddiq", "Farooq", "Haidar-e-Karrar", "Zulnoorain"], correct: 2 },
    { q: "Zakat dena kis par farz hai?", options: ["Sab par", "Sirf ameer par", "Sahib-e-Nisab par", "Bachon par"], correct: 2 },
    { q: "Qibla ki taraf rukh karke kya ibadat ki jati hai?", options: ["Roza", "Namaz", "Zakat", "Hajj"], correct: 1 },
    { q: "Pehli wahi kis ghaar mein nazil hui?", options: ["Ghaar-e-Saur", "Ghaar-e-Hira", "Ghaar-e-Koh", "Ghaar-e-Misr"], correct: 1 },
    { q: "Hazrat Muhammad (SAW) ki Walida ka naam kya tha?", options: ["Hazrat Amina", "Hazrat Khadija", "Hazrat Halima", "Hazrat Fatima"], correct: 0 },
    { q: "Hajj kis mahine mein kiya jata hai?", options: ["Ramzan", "Zil-Hajj", "Muharram", "Safar"], correct: 1 },
    { q: "Quran ki sabse choti Surah kaun si hai?", options: ["Surah Al-Kawthar", "Surah Al-Ikhlas", "Surah An-Nas", "Surah Al-Asr"], correct: 0 },
    { q: "Kis Sahaba ko 'Sayfullah' (Allah ki talwar) kaha jata hai?", options: ["Hazrat Umar (RA)", "Hazrat Khalid bin Waleed (RA)", "Hazrat Hamza (RA)", "Hazrat Abu Bakr (RA)"], correct: 1 },
    { q: "Hazrat Isa (AS) par kaun si kitab nazil hui?", options: ["Taurat", "Zaboor", "Injeel", "Quran"], correct: 2 },
    { q: "Hazrat Dawood (AS) par kaun si kitab nazil hui?", options: ["Zaboor", "Injeel", "Taurat", "Suhuf"], correct: 0 },
    { q: "Hazrat Musa (AS) par kaun si kitab nazil hui?", options: ["Taurat", "Zaboor", "Injeel", "Quran"], correct: 0 },
    { q: "Masjid-e-Nabawi kis shehar mein hai?", options: ["Makkah", "Madinah", "Jerusalem", "Taif"], correct: 1 },
    { q: "Masjid-e-Aqsa kis shehar mein hai?", options: ["Makkah", "Madinah", "Jerusalem (Baitul Maqdis)", "Misr"], correct: 2 },
    { q: "Quran mein kitne Sajde (Sajdah) hain?", options: ["15", "14", "10", "20"], correct: 0 },
    { q: "Kis Nabi ne kashti banayi thi?", options: ["Hazrat Nuh (AS)", "Hazrat Musa (AS)", "Hazrat Ibrahim (AS)", "Hazrat Yunus (AS)"], correct: 0 },
    { q: "Hazrat Yunus (AS) ko kis janwar ne nigla tha?", options: ["Mangar (Magarmachh)", "Machhli (Whale)", "Sher", "Haathi"], correct: 1 },
    { q: "Kis Nabi ko 'Zabeehullah' kaha jata hai?", options: ["Hazrat Ismail (AS)", "Hazrat Ishaq (AS)", "Hazrat Yaqoob (AS)", "Hazrat Yusuf (AS)"], correct: 0 },
    { q: "Hazrat Yusuf (AS) ke kitne bhai the?", options: ["10", "11", "12", "9"], correct: 1 },
    { q: "Jannat ka darwaza kholne wali chaabi kya hai?", options: ["Namaz", "Kalma Tauheed (La ilaha illallah)", "Roza", "Hajj"], correct: 1 },
    { q: "Sabse afzal ibadat kaun si hai?", options: ["Zakat", "Roza", "Namaz", "Hajj"], correct: 2 },
    { q: "Quran mein 'Bismillah' kitni baar aayi hai?", options: ["114", "113", "112", "100"], correct: 1 },
    { q: "Surah Fatiha ko kya kaha jata hai?", options: ["Ummul Quran", "Qalb-e-Quran", "Aroos-ul-Quran", "Zeenat-e-Quran"], correct: 0 },
    { q: "Surah Yaseen ko kya kaha jata hai?", options: ["Qalb-e-Quran", "Ummul Quran", "Aroos-ul-Quran", "Zeenat-e-Quran"], correct: 0 },
    { q: "Surah Rahman ko kya kaha jata hai?", options: ["Qalb-e-Quran", "Ummul Quran", "Aroos-ul-Quran", "Zeenat-e-Quran"], correct: 2 },
    { q: "Kis Sahaba ko 'Zulnoorain' kaha jata hai?", options: ["Hazrat Usman (RA)", "Hazrat Ali (RA)", "Hazrat Umar (RA)", "Hazrat Abu Bakr (RA)"], correct: 0 },
    { q: "Hazrat Umar (RA) ka laqab kya tha?", options: ["Siddiq", "Farooq-e-Azam", "Zulnoorain", "Haidar"], correct: 1 },
    { q: "Hazrat Abu Bakr (RA) ka laqab kya tha?", options: ["Siddiq-e-Akbar", "Farooq", "Zulnoorain", "Haidar"], correct: 0 },
    { q: "Namaz ke aakhri baithak mein jo padha jata hai usse kya kehte hain?", options: ["Tashahhud (At-Tahiyyat)", "Sana", "Tasbeeh", "Qirat"], correct: 0 },
    { q: "Fajr ki namaz mein kitni rakat sunnat hoti hain?", options: ["2", "4", "3", "1"], correct: 0 },
    { q: "Isha ki namaz mein kitni rakat farz hoti hain?", options: ["2", "3", "4", "5"], correct: 2 },
    { q: "Wudu ke baad kya padhna sunnat hai?", options: ["Kalma Shahadat", "Sana", "Darood", "Ayatul Kursi"], correct: 0 },
    { q: "Quran ki kis Surah mein 'Bismillah' nahi hai?", options: ["Surah Tawbah", "Surah Baqarah", "Surah Alaq", "Surah Fatiha"], correct: 0 },
    { q: "Makkah ko Quran mein kis naam se bhi bulaya gaya hai?", options: ["Bakkah", "Madinah", "Taif", "Kufa"], correct: 0 },
    { q: "Kis Sahaba ne sabse pehle Islam qabool kiya (mardon mein)?", options: ["Hazrat Abu Bakr (RA)", "Hazrat Umar (RA)", "Hazrat Ali (RA)", "Hazrat Usman (RA)"], correct: 0 },
    { q: "Islam mein 'Jihad-e-Akbar' kya hai?", options: ["Jang karna", "Nafs se ladna", "Zakat dena", "Roza rakhna"], correct: 1 },
    { q: "Quran padhne se pehle kya padhna wajib hai?", options: ["Darood", "Ta'awwudh (A'oozu billah)", "Bismillah", "Kalma"], correct: 1 },
    { q: "Hazrat Aisha (RA) ke walid ka naam kya tha?", options: ["Hazrat Umar (RA)", "Hazrat Abu Bakr (RA)", "Hazrat Usman (RA)", "Hazrat Ali (RA)"], correct: 1 },
    { q: "Jannat ke kitne darwaze hain?", options: ["7", "8", "5", "10"], correct: 1 },
    { q: "Jahannam ke kitne darwaze hain?", options: ["7", "8", "5", "10"], correct: 0 },
    { q: "Quran mein sabse zyada zikr kis Nabi ka hai?", options: ["Hazrat Ibrahim (AS)", "Hazrat Musa (AS)", "Hazrat Isa (AS)", "Hazrat Nuh (AS)"], correct: 1 },
    { q: "Hazrat Adam (AS) ki mitti kis cheez se bani thi?", options: ["Aag", "Mitti (Clay)", "Noor", "Paani"], correct: 1 },
    { q: "Farz namaz ke baad 'Tasbeeh-e-Fatima' mein Allahu Akbar kitni baar padhte hain?", options: ["33", "34", "35", "30"], correct: 1 }
];

// ==========================================
// 2. STATE & VARIABLES
// ==========================================
let isDarkMode = localStorage.getItem('darkMode') === 'true';
const toast = document.getElementById('toast');

// ==========================================
// 3. INITIALIZATION & UI RENDERING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerText = '☀️';
    }
    renderCards(duaData, 'duaGrid', 'dua');
    renderCards(quranData, 'quranGrid', 'quran');
    setupNavigation();
    setupThemeToggle();
});

function renderCards(data, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if(data.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:gray;">Koi data nahi mila.</p>';
        return;
    }

    data.forEach((word, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let explainBtnHTML = '';
        if (word.tafseel) {
            explainBtnHTML = `<button class="explain-btn" onclick="showTafseel('${type}', ${index})">📖 Fazilat / Tafseel Padhein</button>`;
        }

        card.innerHTML = `
            <div class="arabic" onclick="speakText('${word.arabic}', 'ar-SA')">${word.arabic}</div>
            <div class="roman">${word.roman}</div>
            <div class="urdu" onclick="speakText('${word.urdu}', 'ur-PK')">${word.urdu}</div>
            <div class="card-actions">
                <button class="action-btn" onclick="copyText('${word.arabic}')">📋 Copy</button>
            </div>
            ${explainBtnHTML}
        `;
        container.appendChild(card);
    });
}

// ==========================================
// 4. TTS, COPY & MODAL
// ==========================================
function speakText(text, lang) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.onstart = () => showToast("🔊 Aawaz play ho rahi hai...");
    utterance.onerror = () => showToast("⚠️ Voice device me nahi hai.");
    window.speechSynthesis.speak(utterance);
}

function showTafseel(type, index) {
    let wordData;
    if (type === 'dua') wordData = duaData[index];
    else if (type === 'quran') wordData = quranData[index];

    document.getElementById('modalText').innerText = wordData.tafseel;
    document.getElementById('infoModal').classList.remove('hidden');
    
    document.getElementById('speakExplanationBtn').onclick = () => {
        speakText(wordData.tafseel, 'ur-PK');
    };
}

function closeModal() {
    window.speechSynthesis.cancel();
    document.getElementById('infoModal').classList.add('hidden');
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast("📋 Copy ho gaya!"));
}

// ==========================================
// 5. GAME LOGIC (Islamic GK Quiz)
// ==========================================
let gameQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

const startScreen = document.getElementById('gameStartScreen');
const quizScreen = document.getElementById('quizScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

document.getElementById('startGameBtn').addEventListener('click', startGame);
document.getElementById('restartGameBtn').addEventListener('click', startGame);

function startGame() {
    // Shuffle Questions
    gameQuestions = [...gkQuestions].sort(() => 0.5 - Math.random());
    currentQuestionIndex = 0;
    score = 0;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= gameQuestions.length) {
        endGame();
        return;
    }

    const q = gameQuestions[currentQuestionIndex];
    document.getElementById('questionCount').innerText = `Question ${currentQuestionIndex + 1}/${gameQuestions.length}`;
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    document.getElementById('questionText').innerText = q.q;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('nextQuestionBtn').classList.add('hidden');
}

function checkAnswer(selectedIndex, btnElement) {
    const q = gameQuestions[currentQuestionIndex];
    const allBtns = document.querySelectorAll('.option-btn');
    
    // Disable all buttons
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    if (selectedIndex === q.correct) {
        btnElement.classList.add('correct');
        score++;
    } else {
        btnElement.classList.add('wrong');
        // Show correct answer
        allBtns[q.correct].classList.add('correct');
    }

    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    
    const nextBtn = document.getElementById('nextQuestionBtn');
    nextBtn.classList.remove('hidden');
    
    // If last question, change button text
    if (currentQuestionIndex === gameQuestions.length - 1) {
        nextBtn.innerText = "See Result 🏆";
    } else {
        nextBtn.innerText = "Next Question ➡️";
    }
    
    nextBtn.onclick = () => {
        currentQuestionIndex++;
        loadQuestion();
    };
}

function endGame() {
    quizScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    document.getElementById('finalScoreText').innerText = `Aapne ${score} out of ${gameQuestions.length} score kiya!`;
}

// ==========================================
// 6. UTILS & NAVIGATION
// ==========================================
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
            
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.view).classList.add('active');
        });
    });
}

// Search Filters
document.getElementById('duaSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('#duaGrid .card').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? 'flex' : 'none';
    });
});

document.getElementById('quranSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('#quranGrid .card').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? 'flex' : 'none';
    });
});

function setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    btn.onclick = () => {
        isDarkMode = !isDarkMode;
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        btn.innerText = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDarkMode);
    };
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}