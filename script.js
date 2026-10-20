const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W = 720, H = 1280;
let recording = false;
let mediaRecorder = null;
let chunks = [];
let recordStartTime = 0;
let previewStartTime = performance.now();

// Variables for Image and Audio
let bgImageObj = null;
let bgAudioObj = new Audio();
let audioCtx = null;

// Aspect Ratio Function
function applyAspectRatio() {
  const ratio = document.getElementById('aspectRatio').value;
  if (ratio === '9:16') { W = 720; H = 1280; }
  else if (ratio === '1:1') { W = 1080; H = 1080; }
  else if (ratio === '16:9') { W = 1280; H = 720; }
  canvas.width = W; canvas.height = H;
  previewStartTime = performance.now();
}

// Get Settings
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

// Text Wrap
function wrapText(text, maxWidth, fontSize) {
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  const words = text.split(/\s+/);
  const lines = []; let line = '';
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else { line = test; }
  }
  if (line) lines.push(line);
  return lines;
}

// Draw Frame
function drawFrame(elapsed) {
  const s = getSettings();

  // 1. Background (Image or Gradient)
  if (bgImageObj) {
    // Image cover logic (like object-fit: cover)
    const imgRatio = bgImageObj.width / bgImageObj.height;
    const canvasRatio = W / H;
    let drawW, drawH, offsetX = 0, offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawH = H; drawW = bgImageObj.width * (H / bgImageObj.height);
      offsetX = (W - drawW) / 2;
    } else {
      drawW = W; drawH = bgImageObj.height * (W / bgImageObj.width);
      offsetY = (H - drawH) / 2;
    }
    ctx.drawImage(bgImageObj, offsetX, offsetY, drawW, drawH);
    
    // Add dark overlay so text is visible
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);
  } else {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, s.bg1); grad.addColorStop(1, s.bg2);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    
    // Floating circles
    for (let i = 0; i < 6; i++) {
      const x = (Math.sin(elapsed * 0.5 + i) * 0.5 + 0.5) * W;
      const y = (Math.cos(elapsed * 0.4 + i * 1.7) * 0.5 + 0.5) * H;
      ctx.beginPath(); ctx.arc(x, y, 40 + Math.sin(elapsed + i) * 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill();
    }
  }

  // 2. Emoji
  if (s.emoji) {
    const bounce = Math.sin(elapsed * 2) * 15;
    ctx.font = '130px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.emoji, W / 2, H * 0.25 + bounce);
  }

  // 3. Text
  let fontSize = 68;
  if (s.text.length > 150) fontSize = 40;
  else if (s.text.length > 80) fontSize = 48;
  else if (s.text.length > 40) fontSize = 58;
  fontSize = Math.round(fontSize * (W / 720));

  const lines = wrapText(s.text, W * 0.82, fontSize);
  const lineHeight = fontSize * 1.4;
  const totalH = lines.length * lineHeight;
  const centerY = H * 0.6;
  const startY = centerY - totalH / 2 + lineHeight / 2;

  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = s.textColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 15;

  const animDur = 1.5;
  let progress = Math.min(elapsed / animDur, 1);
  progress = 1 - Math.pow(1 - progress, 2);

  if (s.animType === 'fade') {
    ctx.globalAlpha = progress;
    lines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineHeight));
    ctx.globalAlpha = 1;
  } else if (s.animType === 'slide') {
    const offset = (1 - progress) * 200;
    ctx.globalAlpha = progress;
    lines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineHeight + offset));
    ctx.globalAlpha = 1;
  } else if (s.animType === 'zoom') {
    const scale = 0.6 + progress * 0.4;
    ctx.save(); ctx.translate(W / 2, centerY); ctx.scale(scale, scale); ctx.translate(-W / 2, -centerY);
    ctx.globalAlpha = progress;
    lines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineHeight));
    ctx.restore(); ctx.globalAlpha = 1;
  } else if (s.animType === 'typewriter') {
    const fullLen = lines.reduce((a, l) => a + l.length, 0) + (lines.length - 1);
    let remaining = Math.floor(fullLen * progress);
    lines.forEach((line, i) => {
      if (remaining <= 0) return;
      const show = Math.min(line.length, remaining);
      ctx.fillText(line.substring(0, show), W / 2, startY + i * lineHeight);
      remaining -= show + 1;
    });
  }
  ctx.shadowBlur = 0;
}

// Preview Loop
function previewLoop() {
  if (recording) return;
  drawFrame((performance.now() - previewStartTime) / 1000);
  requestAnimationFrame(previewLoop);
}

// Record Function
function toggleRecord() {
  if (recording) return;
  recording = true;
  recordStartTime = performance.now();

  // Capture Canvas Stream
  const canvasStream = canvas.captureStream(30);
  let combinedStream = canvasStream;

  // If Audio is loaded, merge it
  if (bgAudioObj.src) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const source = audioCtx.createMediaElementSource(bgAudioObj);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    source.connect(audioCtx.destination); // So user can hear it while recording

    const audioTrack = dest.stream.getAudioTracks()[0];
    combinedStream = new MediaStream([...canvasStream.getVideoTracks(), audioTrack]);
    
    bgAudioObj.currentTime = 0;
    bgAudioObj.play();
  }

  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
  
  mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
  chunks = [];

  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ayat-video-' + Date.now() + '.webm';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    if (bgAudioObj.src) { bgAudioObj.pause(); bgAudioObj.currentTime = 0; }

    recording = false;
    const btn = document.getElementById('recordBtn');
    btn.textContent = '⏺ Start Recording'; btn.disabled = false;
    previewStartTime = performance.now(); previewLoop();
  };

  mediaRecorder.start();
  const btn = document.getElementById('recordBtn');
  btn.textContent = '⏹ Recording...'; btn.disabled = true;
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

// File Uploads Event Listeners
document.getElementById('bgImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      bgImageObj = new Image();
      bgImageObj.onload = () => { previewStartTime = performance.now(); };
      bgImageObj.src = event.target.result;
    };
    reader.readAsDataURL(file);
  } else { bgImageObj = null; }
});

document.getElementById('bgAudio').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) { bgAudioObj.src = URL.createObjectURL(file); }
  else { bgAudioObj.src = ''; }
});

document.getElementById('recordBtn').addEventListener('click', toggleRecord);
document.getElementById('aspectRatio').addEventListener('change', applyAspectRatio);
document.getElementById('text').addEventListener('input', () => { previewStartTime = performance.now(); });
document.getElementById('bg1').addEventListener('input', () => { previewStartTime = performance.now(); });
document.getElementById('bg2').addEventListener('input', () => { previewStartTime = performance.now(); });
document.getElementById('textColor').addEventListener('input', () => { previewStartTime = performance.now(); });

applyAspectRatio();
previewStartTime = performance.now();
previewLoop();