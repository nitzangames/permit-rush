// Renders 4 thumbnail options for Permit Rush.
// Each is 1024x1024 PNG, blueprint aesthetic, title rendered into the image.
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('tools/screenshots', { recursive: true });

const designs = ['stamp-hero', 'split', 'blueprint-card', 'alert'];

const html = `<!doctype html>
<html><body style="margin:0;background:#000;">
<canvas id="c" width="1024" height="1024"></canvas>
<script>
const COLORS = {
  bg: '#0d1021',
  bgDeep: '#05070f',
  card: '#0a0e1f',
  cyan: '#3fd4ff',
  cyanDim: '#2a8fb3',
  gridDot: '#1a2040',
  text: '#e0f0ff',
  textDim: '#6080a0',
  green: '#3fff8f',
  red: '#ff5050',
  amber: '#ffb040',
};
const W = 1024, H = 1024;
const ctx = document.getElementById('c').getContext('2d');

function clear() {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);
}
function gridDots() {
  ctx.fillStyle = COLORS.gridDot;
  for (let y = 16; y < H; y += 32) {
    for (let x = 16; x < W; x += 32) ctx.fillRect(x, y, 3, 3);
  }
}
function gridLines(alpha=0.06) {
  ctx.strokeStyle = 'rgba(63,212,255,' + alpha + ')';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 128) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += 128) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawStamp(cx, cy, text, color, rot, scale=1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 10;
  ctx.strokeRect(-220, -70, 440, 140);
  ctx.lineWidth = 4;
  ctx.strokeRect(-234, -84, 468, 168);
  ctx.font = 'bold 92px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawHouse(x, y, w, h, opts={}) {
  const { floors=2, roof='gable', garage='double', solar=false, basement=false, flood=false, damaged=false } = opts;
  if (flood) {
    ctx.fillStyle = 'rgba(64,128,220,0.22)';
    ctx.fillRect(x, y, w, h);
  }
  const groundY = y + h - 40;
  const floorH = h * 0.16;
  const houseW = w * 0.5;
  const houseX = x + (w - houseW) / 2;
  const houseTop = groundY - floors * floorH;
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 4;
  // ground
  ctx.beginPath(); ctx.moveTo(x+10, groundY); ctx.lineTo(x+w-10, groundY); ctx.stroke();
  // floors + windows
  for (let i = 0; i < floors; i++) {
    const fy = groundY - (i+1) * floorH;
    ctx.strokeRect(houseX, fy, houseW, floorH);
    const wins = 3, winW = houseW*0.13, winH = floorH*0.45;
    const gap = (houseW - wins*winW) / (wins+1);
    for (let k = 0; k < wins; k++) {
      const wx = houseX + gap + k*(winW+gap);
      const wy = fy + (floorH - winH) / 2 - (i===0 ? winH*0.2 : 0);
      ctx.strokeRect(wx, wy, winW, winH);
      ctx.beginPath();
      ctx.moveTo(wx+winW/2, wy); ctx.lineTo(wx+winW/2, wy+winH);
      ctx.moveTo(wx, wy+winH/2); ctx.lineTo(wx+winW, wy+winH/2);
      ctx.stroke();
    }
  }
  // door
  const dw = houseW*0.14, dh = floorH*0.72;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(houseX + houseW/2 - dw/2, groundY - dh, dw, dh);
  ctx.strokeRect(houseX + houseW/2 - dw/2, groundY - dh, dw, dh);
  // roof
  ctx.beginPath();
  if (roof === 'gable') {
    ctx.moveTo(houseX-14, houseTop);
    ctx.lineTo(houseX+houseW/2, houseTop - floorH*0.95);
    ctx.lineTo(houseX+houseW+14, houseTop);
  } else if (roof === 'hip') {
    ctx.moveTo(houseX-14, houseTop);
    ctx.lineTo(houseX+houseW*0.3, houseTop - floorH*0.75);
    ctx.lineTo(houseX+houseW*0.7, houseTop - floorH*0.75);
    ctx.lineTo(houseX+houseW+14, houseTop);
  }
  ctx.stroke();
  // solar
  if (solar) {
    ctx.fillStyle = 'rgba(63,212,255,0.5)';
    ctx.fillRect(houseX + houseW*0.15, houseTop - floorH*0.3, houseW*0.3, floorH*0.2);
    ctx.strokeRect(houseX + houseW*0.15, houseTop - floorH*0.3, houseW*0.3, floorH*0.2);
  }
  // garage
  if (garage !== 'none') {
    const gw = { single: houseW*0.32, double: houseW*0.55, oversized: houseW*0.82 }[garage];
    const gh = floorH * 0.9;
    const gx = houseX - gw - 10;
    const gy = groundY - gh;
    ctx.strokeRect(gx, gy, gw, gh);
    ctx.fillStyle = 'rgba(63,212,255,0.08)';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = COLORS.cyan;
    ctx.beginPath();
    for (let lx = gx + 12; lx < gx + gw; lx += 14) {
      ctx.moveTo(lx, gy + 6); ctx.lineTo(lx, gy + gh - 6);
    }
    ctx.stroke();
  }
  if (damaged) {
    // crack lines across the front
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(houseX + houseW*0.35, groundY - floors*floorH);
    ctx.lineTo(houseX + houseW*0.55, groundY - floors*floorH*0.6);
    ctx.lineTo(houseX + houseW*0.40, groundY - floors*floorH*0.3);
    ctx.lineTo(houseX + houseW*0.62, groundY);
    ctx.stroke();
    // smoke
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = 'rgba(255,80,80,' + (0.4 - i*0.03) + ')';
      ctx.beginPath();
      ctx.arc(houseX + houseW*0.5 + Math.sin(i)*40, houseTop - 40 - i*30, 30 + i*4, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

function titleBlock(title, subtitle, yTitle, yAccent, yMark) {
  ctx.fillStyle = COLORS.cyan;
  ctx.font = 'bold 140px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(title, W/2, yTitle);
  if (subtitle) {
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 58px ui-monospace, Menlo, monospace';
    ctx.fillText(subtitle, W/2, yTitle + 70);
  }
  if (yAccent) {
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W/2 - 240, yAccent);
    ctx.lineTo(W/2 + 240, yAccent);
    ctx.stroke();
  }
}

function border() {
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, W-28, H-28);
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W-56, H-56);
}

function design1() { // stamp-hero — big APPROVED stamp, house behind, title top
  clear();
  gridDots();
  gridLines(0.08);
  // Draw all content inside a "safe area" so platform crops don't clip the frame.
  const pad = 92;
  const sx = (W - pad*2) / W;
  ctx.save();
  ctx.translate(pad, pad);
  ctx.scale(sx, sx);
  // title band
  ctx.fillStyle = 'rgba(63,212,255,0.9)';
  ctx.fillRect(0, 80, W, 10);
  ctx.fillStyle = COLORS.cyan;
  ctx.font = 'bold 128px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PERMIT', W/2, 240);
  ctx.fillStyle = COLORS.text;
  ctx.fillText('RUSH', W/2, 360);
  // house
  drawHouse(180, 420, 664, 420, { floors: 2, roof: 'gable', garage: 'double', solar: true });
  // green stamp
  drawStamp(W/2, 700, 'APPROVED', COLORS.green, -0.18, 1.1);
  ctx.restore();
  // Inset border so it stays visible under edge cropping
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 6;
  ctx.strokeRect(60, 60, W-120, H-120);
  ctx.lineWidth = 2;
  ctx.strokeRect(74, 74, W-148, H-148);
}

function design2() { // split approved/rejected
  clear();
  // left half green, right half red
  ctx.fillStyle = 'rgba(63,255,143,0.08)';
  ctx.fillRect(0, 0, W/2, H);
  ctx.fillStyle = 'rgba(255,80,80,0.08)';
  ctx.fillRect(W/2, 0, W/2, H);
  gridDots();
  // diagonal divider
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(W/2, 0);
  ctx.lineTo(W/2, H);
  ctx.stroke();
  // approve stamp (left)
  drawStamp(W*0.25, H*0.35, 'APPROVE', COLORS.green, -0.22, 0.8);
  // reject stamp (right)
  drawStamp(W*0.75, H*0.35, 'REJECT', COLORS.red, 0.22, 0.8);
  // house bottom
  drawHouse(220, 560, 584, 320, { floors: 2, roof: 'hip', garage: 'single', solar: false });
  // title overlay
  ctx.fillStyle = 'rgba(5,7,15,0.85)';
  ctx.fillRect(0, 900, W, 124);
  ctx.fillStyle = COLORS.cyan;
  ctx.font = 'bold 96px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PERMIT RUSH', W/2, 985);
  border();
}

function design3() { // blueprint card centerpiece
  clear();
  gridDots();
  gridLines(0.05);
  // centered "card"
  const cx = 120, cy = 140, cw = W - 240, ch = H - 280;
  ctx.fillStyle = COLORS.card;
  ctx.fillRect(cx, cy, cw, ch);
  ctx.strokeStyle = COLORS.cyan;
  ctx.lineWidth = 5;
  ctx.strokeRect(cx, cy, cw, ch);
  ctx.fillStyle = COLORS.cyan;
  ctx.fillRect(cx, cy, cw, 10);
  // inner grid dots
  ctx.fillStyle = COLORS.gridDot;
  for (let y = cy+30; y < cy+ch; y += 36) {
    for (let x = cx+30; x < cx+cw; x += 36) ctx.fillRect(x, y, 3, 3);
  }
  // BP id
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 42px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BP-4291', cx + 36, cy + 76);
  // zone badge
  ctx.fillStyle = COLORS.cyan;
  ctx.fillRect(cx + cw - 200, cy + 40, 160, 60);
  ctx.fillStyle = COLORS.bg;
  ctx.font = 'bold 36px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('R1', cx + cw - 120, cy + 82);
  // house inside card
  drawHouse(cx + 60, cy + 130, cw - 120, 420, { floors: 2, roof: 'gable', garage: 'double', solar: true });
  // stamp overlapping card
  drawStamp(W/2, cy + ch + 30, 'PERMIT RUSH', COLORS.cyan, 0, 0.9);
  // actual title via larger text after stamp
  ctx.fillStyle = COLORS.cyan;
  ctx.font = 'bold 100px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PERMIT RUSH', W/2, H - 48);
  border();
}

function design4() { // red alert disaster
  clear();
  // red vignette
  const g = ctx.createRadialGradient(W/2, H*0.55, 100, W/2, H*0.55, W*0.7);
  g.addColorStop(0, 'rgba(255,80,80,0.4)');
  g.addColorStop(1, 'rgba(5,7,15,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  gridDots();
  // title top
  ctx.fillStyle = COLORS.red;
  ctx.font = 'bold 128px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PERMIT', W/2, 180);
  ctx.fillStyle = COLORS.text;
  ctx.fillText('RUSH', W/2, 300);
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(W/2 - 260, 325);
  ctx.lineTo(W/2 + 260, 325);
  ctx.stroke();
  // damaged house
  drawHouse(180, 380, 664, 440, { floors: 3, roof: 'gable', garage: 'oversized', damaged: true });
  // violation stamp
  drawStamp(W/2, 860, 'VIOLATION', COLORS.red, 0.15, 1.1);
  border();
}

const which = window.__which;
if (which === 'stamp-hero') design1();
else if (which === 'split') design2();
else if (which === 'blueprint-card') design3();
else if (which === 'alert') design4();
window.__done = true;
</script>
</body></html>`;

const browser = await puppeteer.launch({ headless: true });
for (const d of designs) {
  const page = await browser.newPage();
  page.on('console', msg => console.log('[page]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[page error]', err.message));
  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
  const baked = html.replace('const which = window.__which;', `const which = '${d}';`);
  await page.setContent(baked, { waitUntil: 'load' });
  await page.waitForFunction('window.__done === true', { timeout: 5000 }).catch(e => console.log('[wait]', e.message));
  await new Promise(r => setTimeout(r, 200));
  const info = await page.evaluate(() => {
    const c = document.getElementById('c');
    const cx = c.getContext('2d');
    const d = cx.getImageData(100, 100, 1, 1).data;
    const d2 = cx.getImageData(512, 512, 1, 1).data;
    return { done: window.__done, w: c.width, h: c.height, px100: Array.from(d), px512: Array.from(d2) };
  });
  console.log(d, 'info', info);
  const dataUrl = await page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  const b64 = dataUrl.split(',', 2)[1];
  writeFileSync(`tools/screenshots/thumb_${d}.png`, Buffer.from(b64, 'base64'));
  await page.close();
  console.log('wrote', `tools/screenshots/thumb_${d}.png`);
}
await browser.close();
