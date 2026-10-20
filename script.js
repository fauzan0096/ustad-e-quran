:root {
    --primary: #0F4C3A; /* Islamic Green */
    --secondary: #D4AF37; /* Gold */
    --bg: #F4F7F6;
    --card-bg: #ffffff;
    --text: #333333;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Poppins', sans-serif;
    background-color: var(--bg);
    color: var(--text);
    padding-bottom: 50px;
}

header {
    background-color: var(--primary);
    color: white;
    text-align: center;
    padding: 30px 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-bottom: 4px solid var(--secondary);
}

header h1 { font-size: 24px; margin-bottom: 8px; }
header p { font-size: 14px; opacity: 0.9; }

.controls {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

#searchBar {
    width: 100%;
    padding: 15px;
    border: 2px solid #ddd;
    border-radius: 10px;
    font-size: 16px;
    outline: none;
    transition: border 0.3s;
}
#searchBar:focus { border-color: var(--primary); }

.tabs {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 5px;
}

.tab-btn {
    padding: 10px 20px;
    border: none;
    background: #e0e0e0;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
    transition: all 0.3s;
}

.tab-btn.active {
    background: var(--primary);
    color: white;
}

.grid-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border-left: 6px solid var(--primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.card:active {
    transform: scale(0.98);
}

/* When speaking, change color */
.card.speaking {
    border-left-color: var(--secondary);
    background: #fffdf5;
}

.arabic {
    font-family: 'Amiri', serif;
    font-size: 32px;
    color: var(--primary);
    margin-bottom: 10px;
    direction: rtl;
}

.roman {
    font-weight: 600;
    color: #555;
    font-size: 15px;
    margin-bottom: 5px;
}

.urdu {
    font-family: 'Noto Nastaliq Urdu', serif;
    font-size: 18px;
    color: #666;
    direction: rtl;
    line-height: 1.8;
}

.play-icon {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 20px;
    opacity: 0.3;
}

.card.speaking .play-icon {
    opacity: 1;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); color: var(--secondary); }
    100% { transform: scale(1); }
}

.toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    color: white;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 14px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
}
.toast.show { opacity: 1; }

@media (max-width: 600px) {
    .grid-container { grid-template-columns: 1fr; }
}