// ==========================================
// 1. DATA (Day-wise divided with Fazilat/Tafseel)
// ==========================================
const curriculum = [
    {
        day: 1,
        words: [
            { arabic: "اللَّهُ", roman: "Allah", urdu: "اللہ، سب کا رب اور مالک", tafseel: "یہ اسمِ اعظم ہے۔ قرآن کی سب سے زیادہ آنے والی آیت۔ اللہ وہ ذات ہے جس کی کوئی مثال نہیں، وہ اکیلا ہے اور ہر چیز کا مالک ہے۔" },
            { arabic: "رَبِّ", roman: "Rabb", urdu: "پالنے والا، مالک", tafseel: "رب کا مطلب ہے وہ جو ہمیں پیدا کرے، پالے، اور ہر لمحہ سنبھالے رکھے۔" },
            { arabic: "رَحْمَن", roman: "Rahmaan", urdu: "بہت مہربان", tafseel: "الرحمٰن کا مطلب ہے وہ جو تمام مخلوقات پر بلا تفریق رحم کرنے والا ہے۔" },
            { arabic: "رَحِيم", roman: "Raheem", urdu: "نہایت رحم والا", tafseel: "الرحیم کا مطلب ہے وہ جو خاص طور پر ایمان والوں پر بے حد رحم کرنے والا ہے۔" },
            { arabic: "غَفُور", roman: "Ghafoor", urdu: "بخشنی والا", tafseel: "الغفور وہ ہے جو بندوں کے گناہوں کو بار بار معاف کرنے والا ہے۔" },
            { arabic: "عَزِيز", roman: "Azeez", urdu: "زبردست", tafseel: "العزیز کا مطلب ہے زبردست، جسے کوئی ہرا نہیں سکتا، ہر چیز پر غالب۔" },
            { arabic: "حَكِيم", roman: "Hakeem", urdu: "حکمت والا", tafseel: "الحکیم کا مطلب ہے وہ جو ہر کام کمال حکمت اور تدبیر سے کرنے والا ہے۔" },
            { arabic: "عَلِيم", roman: "Aleem", urdu: "سب کچھ جاننے والا", tafseel: "العلیم وہ ہے جس کے علم سے کوئی چیز چھپی ہوئی نہیں، وہ ظاہر و باطن سب جانتا ہے۔" },
            { arabic: "سَمِيع", roman: "Samee'", urdu: "سب سننے والا", tafseel: "السمیع وہ ہے جو ہر آہٹ، ہر آواز، اور دل کے وسوسوں کو بھی سننے والا ہے۔" },
            { arabic: "بَصِير", roman: "Baseer", urdu: "سب دیکھنے والا", tafseel: "البصیر وہ ہے جس کی نظر سے کوئی ذرہ بھی اوجھل نہیں، وہ ہر عمل دیکھتا ہے۔" }
        ]
    },
    {
        day: 2,
        words: [
            { arabic: "أَشْهَدُ أَنْ لَّا إِلَهَ إِلَّا اللَّهُ", roman: "Ashhadu an la ilaha illallah", urdu: "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں", tafseel: "حدیث: جو شخص وضو کے بعد یہ کلمہ پڑھے، اس کے لیے جنت کے آٹھوں دروازے کھول دیے جاتے ہیں۔ (صحیح مسلم 234)" },
            { arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", roman: "La hawla wa la quwwata illa billah", urdu: "گناہ سے بچنے کی کوئی طاقت نہیں مگر اللہ کی مدد سے", tafseel: "یہ جنت کا خزانہ ہے۔ جب مؤذن 'حی علی الصلاۃ' کہے تو یہ پڑھنا سنت ہے۔ (صحیح مسلم 385)" },
            { arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", roman: "Allahummaftah li abwaba rahmatik", urdu: "اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول دے", tafseel: "مسجد میں داخل ہوتے وقت یہ دعا پڑھنا سنت ہے۔ (صحیح مسلم 713)" },
            { arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ", roman: "Subhanaka Allahumma wa bihamdika", urdu: "اے اللہ! تو پاک ہے اور تیری ہی تعریف ہے", tafseel: "یہ نماز کی پہلی دعا (استفتاح) ہے۔ نبی کریم ﷺ نماز شروع کرتے وقت یہ پڑھتے تھے۔ (سنن ابی داؤد 776)" },
            { arabic: "رَبِّ اغْفِرْ لِي", roman: "Rabbighfir li", urdu: "اے میرے رب! مجھے بخش دے", tafseel: "دو سجدوں کے درمیان یہ دعا مانگنا مسنون ہے۔ (سنن ابن ماجہ 897)" },
            { arabic: "بَعُوضَة", roman: "Ba'oodah", urdu: "مچھر", tafseel: "اللہ تعالیٰ نے قرآن میں مچھر کی مثال دی ہے (سورۃ البقرہ 2:26) تاکہ انسان غور کرے۔" },
            { arabic: "قِثَّاء", roman: "Qiththa'a", urdu: "ککڑی", tafseel: "بنی اسرائیل نے حضرت موسیٰ علیہ السلام سے کھانے کی تنوع مانگتے ہوئے یہ لفظ کہا تھا۔" },
            { arabic: "فُوم", roman: "Fuum", urdu: "گیہوں یا لہسن", tafseel: "یہ بھی بنی اسرائیل کی خوراک سے متعلق قرآن میں آیا ہے۔" },
            { arabic: "عَدَس", roman: "Adas", urdu: "مسور کی دال", tafseel: "بنی اسرائیل نے حضرت موسیٰ سے کہا تھا کہ ہمیں دال اور پیاز چاہیے۔" },
            { arabic: "بَصَل", roman: "Basal", urdu: "پیاز", tafseel: "یہ قرآنِ مجید میں بنی اسرائیل کی مانگی ہوئی خوراک کے طور پر آیا ہے۔" }
        ]
    }
];

// ==========================================
// 2. STATE & VARIABLES
// ==========================================
let currentDay = parseInt(localStorage.getItem('currentDay')) || 1;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Elements
const dictGrid = document.getElementById('wordGrid');
const dailyGrid = document.getElementById('dailyGrid');
const dayTitle = document.getElementById('dayTitle');
const progressFill = document.getElementById('progressFill');
const toast = document.getElementById('toast');

// ==========================================
// 3. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerText = '☀️';
    }
    renderDictionary();
    setupNavigation();
    setupDailyView();
    setupThemeToggle();
});

// ==========================================
// 4. UI RENDERING
// ==========================================
function renderDictionary() {
    dictGrid.innerHTML = '';
    let allWords = [];
    // Show all words from all unlocked days
    for(let i=0; i < currentDay && i < curriculum.length; i++) {
        allWords = allWords.concat(curriculum[i].words);
    }

    if(allWords.length === 0) {
        dictGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:gray;">Abhi koi lafz unlock nahi hua.</p>';
        return;
    }

    allWords.forEach((word, index) => {
        dictGrid.appendChild(createCard(word, index));
    });
}

function createCard(word, index) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Agar tafseel (Fazilat/Hadith) majood hai toh button dikhao
    let explainBtnHTML = '';
    if (word.tafseel) {
        explainBtnHTML = `<button class="explain-btn" onclick="showTafseel(${index}, 'dict')">📖 Fazilat / Hadith Padhein</button>`;
    }

    card.innerHTML = `
        <div class="arabic" onclick="speakText('${word.arabic}', 'ar-SA')">${word.arabic}</div>
        <div class="roman">${word.roman}</div>
        <div class="urdu" onclick="speakText('${word.urdu}', 'ur-PK')">${word.urdu}</div>
        <div class="card-actions">
            <button class="action-btn" onclick="copyText('${word.arabic}')">📋 Copy Arabic</button>
        </div>
        ${explainBtnHTML}
    `;
    return card;
}

function setupDailyView() {
    if (currentDay > curriculum.length) {
        dayTitle.innerText = "Mashallah! Aapne saare din complete kar liye.";
        document.getElementById('startExamContainer').classList.add('hidden');
        dailyGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Aapne pura course complete kar liya hai. Ab Dictionary me search karke padh sakte hain.</p>';
        return;
    }

    const todayData = curriculum[currentDay - 1];
    dayTitle.innerText = `Day ${currentDay} - Learn 10 Words`;
    progressFill.style.width = `${(currentDay/curriculum.length)*100}%`;

    dailyGrid.innerHTML = '';
    todayData.words.forEach((word, index) => {
        const card = createCard(word, index);
        // Update the onclick function for daily view to fetch from correct place
        card.querySelector('.explain-btn').setAttribute('onclick', `showTafseel(${index}, 'daily')`);
        dailyGrid.appendChild(card);
    });
}

// ==========================================
// 5. TTS (Voice), COPY & MODAL
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

function showTafseel(index, viewType) {
    let wordData;
    if (viewType === 'daily') {
        wordData = curriculum[currentDay - 1].words[index];
    } else {
        // Find in all unlocked words
        let allWords = [];
        for(let i=0; i < currentDay && i < curriculum.length; i++) {
            allWords = allWords.concat(curriculum[i].words);
        }
        wordData = allWords[index];
    }

    document.getElementById('modalText').innerText = wordData.tafseel;
    document.getElementById('infoModal').classList.remove('hidden');
    
    // Tafseel sunne ka button logic
    document.getElementById('speakExplanationBtn').onclick = () => {
        speakText(wordData.tafseel, 'ur-PK');
    };
}

function closeModal() {
    window.speechSynthesis.cancel(); // Stop voice if playing
    document.getElementById('infoModal').classList.add('hidden');
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast("📋 Copy ho gaya!"));
}

// ==========================================
// 6. EXAM LOGIC
// ==========================================
document.getElementById('startExamBtn').addEventListener('click', () => {
    document.getElementById('startExamContainer').classList.add('hidden');
    document.getElementById('examSection').classList.remove('hidden');
    generateQuiz();
});

function generateQuiz() {
    const todayData = curriculum[currentDay - 1];
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '';
    
    // Shuffle words for quiz
    const shuffledWords = [...todayData.words].sort(() => 0.5 - Math.random());

    shuffledWords.forEach((word) => {
        // Pick 3 random wrong options
        let wrongOptions = curriculum.flatMap(d => d.words)
            .filter(w => w.urdu !== word.urdu)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.urdu);
        
        let options = [word.urdu, ...wrongOptions].sort(() => 0.5 - Math.random());

        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';
        qDiv.innerHTML = `<h3>${word.arabic}</h3><div class="options"></div>`;
        
        const optionsDiv = qDiv.querySelector('.options');
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => {
                optionsDiv.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                btn.dataset.correct = (opt === word.urdu).toString(); 
            };
            optionsDiv.appendChild(btn);
        });
        quizContainer.appendChild(qDiv);
    });

    document.getElementById('submitExamBtn').classList.remove('hidden');
    document.getElementById('submitExamBtn').onclick = checkExam;
}

function checkExam() {
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;

    questions.forEach(q => {
        const selected = q.querySelector('.option-btn.selected');
        if (selected && selected.dataset.correct === 'true') {
            selected.classList.add('correct');
            score++;
        } else if (selected) {
            selected.classList.add('wrong');
            // Show correct answer
            q.querySelectorAll('.option-btn').forEach(b => {
                if(b.dataset.correct === 'true') b.classList.add('correct');
            });
        }
    });

    const resultDiv = document.getElementById('examResult');
    resultDiv.classList.remove('hidden');
    document.getElementById('submitExamBtn').classList.add('hidden');

    if (score >= 8) { 
        resultDiv.innerHTML = `<span style="color:#28a745">🎉 Mubarak ho! Aapne ${score}/10 score kiya. Day ${currentDay} Pass!</span>`;
        currentDay++;
        localStorage.setItem('currentDay', currentDay);
        setTimeout(() => { location.reload(); }, 3000);
    } else {
        resultDiv.innerHTML = `<span style="color:#dc3545">😢 Afsos! Aapne ${score}/10 score kiya. Aapko 8 marks chahiye. Agli baar try karein.</span>`;
        setTimeout(() => {
            document.getElementById('examSection').classList.add('hidden');
            resultDiv.classList.add('hidden');
            document.getElementById('startExamContainer').classList.remove('hidden');
        }, 4000);
    }
}

// ==========================================
// 7. NAVIGATION, SEARCH & THEME
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

document.getElementById('searchBar').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const cards = dictGrid.querySelectorAll('.card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'flex' : 'none';
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