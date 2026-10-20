/* =========================================================
   AYAT / NASIHAT VIDEO MAKER
   Free client-side video generator using Canvas + MediaRecorder
   ========================================================= */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W = 720;
let H = 1280;

let recording = false;
let mediaRecorder = null;
let chunks = [];
let recordStartTime = 0;
let previewStartTime = performance.now();

/* ---------- ASPECT RATIO ---------- */
function applyAspectRatio() {
  const ratio = document.getElementById('aspectRatio').value;
  if (ratio === '9:16') {
    W = 720; H = 1280;
  } else if (ratio === '1:1') {
    W = 1080; H = 1080;
  } else if (ratio === '16:9') {
    W = 1280; H = 720;
  }
  canvas.width = W;
  canvas.height = H;
  previewStartTime = performance.now();
}

/* ---------- SETTINGS ---------- */
function getSettings() {
  return {
    text: document.getElementById('text').value.trim() || '...',
    animType: document.getElementById('animType').value,
    emoji: document.getElementById('emoji').value,
    bg1: document.getElementById('bg1').value,
    bg2: document.getElementById('bg2').value,
    textColor: document.getElementById('textColor').value,
    duration: parseFloat(document.getElementById('duration').value) || 8,
  };
}

/* ---------- TEXT WRAPPING ---------- */
function wrapText(text, maxWidth, fontSize) {
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------- DRAW ONE FRAME ---------- */
function drawFrame(elapsed) {
  const s = getSettings();

  // 1. Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, s.bg1);
  grad.addColorStop(1, s.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 2. Floating decorative circles
  for (let i = 0; i < 6; i++) {
    const x = (Math.sin(elapsed * 0.5 + i) * 0.5 + 0.5) * W;
    const y = (Math.cos(elapsed * 0.4 + i * 1.7) * 0.5 + 0.5) * H;
    const r = 40 + Math.sin(elapsed + i) * 20;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();
  }

  // 3. Emoji with bounce
  if (s.emoji) {
    const bounce = Math.sin(elapsed * 2) * 15;
    ctx.font = '130px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.emoji, W / 2, H * 0.25 + bounce);
  }

  // 4. Text with animation
  let fontSize = 68;
  if (s.text.length > 150) fontSize = 40;
  else if (s.text.length > 80) fontSize = 48;
  else if (s.text.length > 40) fontSize = 58;

  // scale for non-portrait sizes
  fontSize = Math.round(fontSize * (W / 720));

  const maxWidth = W * 0.82;
  const lines = wrapText(s.text, maxWidth, fontSize);
  const lineHeight = fontSize * 1.4;
  const totalH = lines.length * lineHeight;
  const centerY = H * 0.6;
  const startY = centerY - totalH / 2 + lineHeight / 2;

  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = s.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;

  const animDur = 1.5;
  let progress = Math.min(elapsed / animDur, 1);
  progress = 1 - Math.pow(1 - progress, 2); // ease-out

  if (s.animType === 'fade') {
    ctx.globalAlpha = progress;
    lines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineHeight));
    ctx.globalAlpha = 1;
  } else if (s.animType === 'slide') {
    const offset = (1 - progress) * 200;
    ctx.globalAlpha = progress;
    lines.forEach((line, i) =>
      ctx.fillText(line, W / 2, startY + i * lineHeight + offset)
    );
    ctx.globalAlpha = 1;
  } else if (s.animType === 'zoom') {
    const scale = 0.6 + progress * 0.4;
    ctx.save();
    ctx.translate(W / 2, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-W / 2, -centerY);
    ctx.globalAlpha = progress;
    lines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineHeight));
    ctx.restore();
    ctx.globalAlpha = 1;
  } else if (s.animType === 'typewriter') {
    const fullLen = lines.reduce((a, l) => a + l.length, 0) + (lines.length - 1);
    const charsToShow = Math.floor(fullLen * progress);
    let remaining = charsToShow;
    lines.forEach((line, i) => {
      if (remaining <= 0) return;
      const show = Math.min(line.length, remaining);
      ctx.fillText(line.substring(0, show), W / 2, startY + i * lineHeight);
      remaining -= show + 1;
    });
  }

  ctx.shadowBlur = 0;
}

/* ---------- PREVIEW LOOP ---------- */
function previewLoop() {
  if (recording) return;
  drawFrame((performance.now() - previewStartTime) / 1000);
  requestAnimationFrame(previewLoop);
}

/* ---------- RECORD ---------- */
function toggleRecord() {
  if (recording) return;
  recording = true;
  recordStartTime = performance.now();

  const stream = canvas.captureStream(30);

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

  mediaRecorder = new MediaRecorder(stream, { mimeType });
  chunks = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ayat-video-' + Date.now() + '.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    recording = false;
    const btn = document.getElementById('recordBtn');
    btn.textContent = '⏺ Start Recording';
    btn.disabled = false;
    previewStartTime = performance.now();
    previewLoop();
  };

  mediaRecorder.start();
  const btn = document.getElementById('recordBtn');
  btn.textContent = '⏹ Recording...';
  btn.disabled = true;
  recordLoop();
}

function recordLoop() {
  if (!recording) return;
  const elapsed = (performance.now() - recordStartTime) / 1000;
  const duration = getSettings().duration;

  if (elapsed >= duration) {
    drawFrame(duration);
    setTimeout(() => mediaRecorder.stop(), 100);
    return;
  }
  drawFrame(elapsed);
  requestAnimationFrame(recordLoop);
}

/* ---------- EVENT LISTENERS ---------- */
document.getElementById('recordBtn').addEventListener('click', toggleRecord);

document.getElementById('aspectRatio').addEventListener('change', () => {
  applyAspectRatio();
  updateNote();
});

document.querySelectorAll('.presets button').forEach((b) => {
  b.addEventListener('click', () => {
    document.getElementById('text').value = b.dataset.preset;
  });
});

document.getElementById('text').addEventListener('input', () => {
  previewStartTime = performance.now();
});

function updateNote() {
  const note = document.getElementById('previewNote');
  const r = document.getElementById('aspectRatio').value;
  const labels = {
    '9:16': 'Reels / Shorts ke liye perfect size',
    '1:1': 'Instagram post ke liye',
    '16:9': 'YouTube video ke liye',
  };
  note.textContent = labels[r] || '';
}

/* ---------- START ---------- */
applyAspectRatio();
updateNote();
previewStartTime = performance.now();
previewLoop();