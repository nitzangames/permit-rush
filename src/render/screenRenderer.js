import { COLORS, CANVAS_W, CANVAS_H, VERSION } from '../core/constants.js';
import { RULES } from '../data/rules.js';

const RULE_BY_ID = Object.fromEntries(RULES.map(r => [r.id, r]));

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const trial = line ? line + ' ' + w : w;
    if (ctx.measureText(trial).width <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

export function drawBackground(ctx) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = COLORS.gridDot;
  for (let y = 20; y < CANVAS_H; y += 50) {
    for (let x = 20; x < CANVAS_W; x += 50) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  ctx.strokeStyle = 'rgba(63, 212, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_W; x += 200) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y < CANVAS_H; y += 200) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }
}

export function drawMenu(ctx, hiScore, pulseT) {
  // Title
  ctx.fillStyle = COLORS.cardAccent;
  ctx.font = 'bold 140px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PERMIT', CANVAS_W / 2, 500);
  ctx.fillStyle = COLORS.text;
  ctx.fillText('RUSH', CANVAS_W / 2, 650);

  // Underline
  ctx.strokeStyle = COLORS.cardAccent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2 - 240, 690);
  ctx.lineTo(CANVAS_W / 2 + 240, 690);
  ctx.stroke();

  // Tagline
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '32px ui-monospace, monospace';
  ctx.fillText('CITY PERMIT OFFICE', CANVAS_W / 2, 750);

  // Instructions
  ctx.fillStyle = COLORS.text;
  ctx.font = '30px ui-monospace, monospace';
  ctx.fillText('SWIPE RIGHT TO APPROVE', CANVAS_W / 2, 920);
  ctx.fillText('SWIPE LEFT TO REJECT', CANVAS_W / 2, 970);

  ctx.fillStyle = COLORS.textDim;
  ctx.font = '24px ui-monospace, monospace';
  ctx.fillText('CROSS-CHECK EACH BLUEPRINT', CANVAS_W / 2, 1040);
  ctx.fillText('AGAINST THE RULEBOOK.', CANVAS_W / 2, 1080);
  ctx.fillText('WRONG CALLS TRIGGER DISASTERS.', CANVAS_W / 2, 1120);

  // Start hint pulse
  const a = 0.55 + 0.45 * Math.sin(pulseT * 3);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = COLORS.approve;
  ctx.font = 'bold 56px ui-monospace, monospace';
  ctx.fillText('TAP TO START', CANVAS_W / 2, 1400);
  ctx.restore();

  // Hi-score
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '28px ui-monospace, monospace';
  ctx.fillText('BEST: ' + String(hiScore).padStart(5, '0'), CANVAS_W / 2, 1700);

  ctx.fillStyle = COLORS.textDim;
  ctx.font = '20px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(VERSION, CANVAS_W / 2, CANVAS_H - 40);
}

export function drawGameOver(ctx, session, pulseT) {
  ctx.fillStyle = 'rgba(5, 7, 15, 0.85)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = COLORS.reject;
  ctx.font = 'bold 110px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', CANVAS_W / 2, 540);

  ctx.strokeStyle = COLORS.reject;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2 - 260, 580);
  ctx.lineTo(CANVAS_W / 2 + 260, 580);
  ctx.stroke();

  ctx.fillStyle = COLORS.textDim;
  ctx.font = '30px ui-monospace, monospace';
  ctx.fillText('FINAL SCORE', CANVAS_W / 2, 680);

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 120px ui-monospace, monospace';
  ctx.fillText(String(session.score), CANVAS_W / 2, 800);

  const hi = session.getHiScore();
  const newHi = session.score >= hi && session.score > 0;
  if (newHi) {
    ctx.fillStyle = COLORS.approve;
    ctx.font = 'bold 36px ui-monospace, monospace';
    ctx.fillText('NEW BEST!', CANVAS_W / 2, 860);
  }

  // Breakdown
  const lines = [
    ['STAMPS',       String(session.totalStamps)],
    ['CORRECT',      String(session.correctStamps)],
    ['DISASTERS',    String(session.wrongStamps)],
    ['WAVE REACHED', String(session.wave)],
    ['FASTEST',      isFinite(session.fastestDecision) ? session.fastestDecision.toFixed(2) + 's' : '--'],
  ];
  ctx.font = '30px ui-monospace, monospace';
  for (let i = 0; i < lines.length; i++) {
    const y = 1000 + i * 54;
    ctx.fillStyle = COLORS.textDim;
    ctx.textAlign = 'left';
    ctx.fillText(lines[i][0], 240, y);
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'right';
    ctx.fillText(lines[i][1], CANVAS_W - 240, y);
  }

  const a = 0.55 + 0.45 * Math.sin(pulseT * 3);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = COLORS.cardAccent;
  ctx.font = 'bold 48px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TAP TO CONTINUE', CANVAS_W / 2, 1700);
  ctx.restore();

  ctx.fillStyle = COLORS.textDim;
  ctx.font = '20px ui-monospace, monospace';
  ctx.textAlign = 'center';
  const seedStr = session.seed != null ? session.seed.toString(16).toUpperCase().padStart(8, '0') : '--------';
  ctx.fillText('SEED ' + seedStr + '  /  ?seed=' + session.seed + ' TO REPLAY', CANVAS_W / 2, 1820);
}

export function drawBriefing(ctx, session, isStart, pulseT) {
  ctx.fillStyle = 'rgba(5, 7, 15, 0.88)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Title
  ctx.fillStyle = isStart ? COLORS.cardAccent : COLORS.newRule;
  ctx.font = 'bold 84px ui-monospace, monospace';
  ctx.textAlign = 'center';
  const title = isStart ? 'RULEBOOK' : 'NEW RULE';
  ctx.fillText(title, CANVAS_W / 2, 260);

  ctx.strokeStyle = isStart ? COLORS.cardAccent : COLORS.newRule;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2 - 260, 290);
  ctx.lineTo(CANVAS_W / 2 + 260, 290);
  ctx.stroke();

  ctx.fillStyle = COLORS.textDim;
  ctx.font = '30px ui-monospace, monospace';
  const subtitle = isStart
    ? 'APPROVE OR REJECT EACH PERMIT'
    : 'WAVE ' + session.wave + ' UNLOCKED';
  ctx.fillText(subtitle, CANVAS_W / 2, 340);

  // Rules list (word-wrapped)
  const rules = session.activeRules();
  const newIds = session.newRulesBanner ? session.newRulesBanner.rules.map(r => r.id) : [];
  const listX = 80;
  const listY = 440;
  const listW = CANVAS_W - 160;
  const textX = listX + 108;
  const textMaxW = listW - 108 - 24;
  const lineH = 32;

  let cursorY = listY;
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    const isNew = newIds.includes(r.id);

    ctx.font = '26px ui-monospace, monospace';
    const lines = wrapText(ctx, r.fullText, textMaxW);
    const rowH = Math.max(64, 28 + lines.length * lineH);

    ctx.fillStyle = isNew ? 'rgba(255, 176, 64, 0.18)' : 'rgba(10, 14, 31, 0.7)';
    ctx.fillRect(listX, cursorY, listW, rowH);
    ctx.strokeStyle = isNew ? COLORS.newRule : COLORS.rulebookAccent;
    ctx.lineWidth = 2;
    ctx.strokeRect(listX, cursorY, listW, rowH);

    ctx.fillStyle = isNew ? COLORS.newRule : COLORS.cardAccent;
    ctx.font = 'bold 34px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(r.id, listX + 24, cursorY + 42);

    ctx.fillStyle = COLORS.text;
    ctx.font = '26px ui-monospace, monospace';
    for (let li = 0; li < lines.length; li++) {
      ctx.fillText(lines[li], textX, cursorY + 38 + li * lineH);
    }

    cursorY += rowH + 10;
  }

  // Instructions (only on first briefing)
  if (isStart) {
    const instrY = cursorY + 30;
    ctx.fillStyle = COLORS.textDim;
    ctx.font = '26px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SWIPE RIGHT TO APPROVE  /  SWIPE LEFT TO REJECT', CANVAS_W / 2, instrY);
    ctx.fillText('CROSS-CHECK EACH PERMIT AGAINST THE RULEBOOK', CANVAS_W / 2, instrY + 40);
  }

  const a = 0.55 + 0.45 * Math.sin(pulseT * 3);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = COLORS.approve;
  ctx.font = 'bold 52px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TAP TO CONTINUE', CANVAS_W / 2, CANVAS_H - 120);
  ctx.restore();
}

export function drawDisasterFlash(ctx, disaster, armed, pulseT) {
  if (!disaster) return;
  const t = 1 - Math.max(0, Math.min(1, disaster.ttl / 1.2));

  // Base tint depends on disaster kind
  const tints = {
    flood:    'rgba(64, 128, 220,',
    fire:     'rgba(255, 120, 40,',
    collapse: 'rgba(255, 80, 80,',
    blackout: 'rgba(40, 40, 60,',
  };
  const base = tints[disaster.kind] || tints.collapse;
  const alpha = 0.55 * (1 - t) + 0.15;
  ctx.fillStyle = base + alpha + ')';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Kind-specific sparkle
  if (disaster.kind === 'fire') {
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * CANVAS_W;
      const y = CANVAS_H - Math.random() * CANVAS_H * 0.7;
      ctx.fillStyle = 'rgba(255, ' + (120 + Math.random() * 120) + ', 40, ' + (0.5 * (1 - t)) + ')';
      ctx.beginPath();
      ctx.arc(x, y, 4 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (disaster.kind === 'flood') {
    const waterH = (1 - t) * CANVAS_H * 0.6;
    ctx.fillStyle = 'rgba(32, 96, 200, 0.5)';
    ctx.fillRect(0, CANVAS_H - waterH, CANVAS_W, waterH);
  } else if (disaster.kind === 'collapse') {
    for (let i = 0; i < 24; i++) {
      const x = Math.random() * CANVAS_W;
      const y = Math.random() * CANVAS_H * 0.8;
      ctx.fillStyle = 'rgba(255, 80, 80, ' + (0.4 * (1 - t)) + ')';
      ctx.fillRect(x, y, 10 + Math.random() * 40, 10 + Math.random() * 40);
    }
  } else if (disaster.kind === 'blackout') {
    ctx.fillStyle = 'rgba(0,0,0,' + (0.55 * (1 - t)) + ')';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * CANVAS_W;
      const y = Math.random() * CANVAS_H;
      ctx.fillStyle = 'rgba(255, 220, 120, ' + Math.random() * 0.8 + ')';
      ctx.fillRect(x, y, 2, 10 + Math.random() * 20);
    }
  }

  // Violation banner
  if (disaster.violations && disaster.violations.length) {
    const rules = disaster.violations.map(id => RULE_BY_ID[id]).filter(Boolean);
    const lineGap = 56;
    const panelH = 260 + rules.length * lineGap;
    const panelTop = CANVAS_H / 2 - panelH / 2;
    ctx.fillStyle = 'rgba(5, 7, 15, 0.88)';
    ctx.fillRect(0, panelTop, CANVAS_W, panelH);
    ctx.strokeStyle = COLORS.reject;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, panelTop + 20, CANVAS_W - 40, panelH - 40);

    ctx.fillStyle = COLORS.reject;
    ctx.font = 'bold 72px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VIOLATION', CANVAS_W / 2, panelTop + 110);

    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      const y = panelTop + 180 + i * lineGap;
      ctx.fillStyle = COLORS.warn;
      ctx.font = 'bold 36px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(r.id, 80, y);
      ctx.fillStyle = COLORS.text;
      ctx.font = '32px ui-monospace, monospace';
      ctx.fillText(r.shortText, 180, y);
    }
  } else {
    const panelH = 220;
    const panelTop = CANVAS_H / 2 - panelH / 2;
    ctx.fillStyle = 'rgba(5, 7, 15, 0.88)';
    ctx.fillRect(0, panelTop, CANVAS_W, panelH);
    ctx.strokeStyle = COLORS.reject;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, panelTop + 20, CANVAS_W - 40, panelH - 40);
    ctx.fillStyle = COLORS.reject;
    ctx.font = 'bold 72px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WRONG CALL', CANVAS_W / 2, panelTop + 120);
    ctx.fillStyle = COLORS.text;
    ctx.font = '32px ui-monospace, monospace';
    ctx.fillText('VALID PERMIT REJECTED', CANVAS_W / 2, panelTop + 170);
  }

  if (armed) {
    const a = 0.5 + 0.5 * Math.sin((pulseT || 0) * 4);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = COLORS.textBright;
    ctx.font = 'bold 38px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TAP OR SWIPE TO CONTINUE', CANVAS_W / 2, CANVAS_H / 2 + 180);
    ctx.restore();
  }
}
