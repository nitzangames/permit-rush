import { COLORS, CANVAS_W, CANVAS_H, CONFIG, VERSION } from '../core/constants.js';

export function drawTopHUD(ctx, session) {
  // Score (top-left)
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '26px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE', 40, 60);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 54px ui-monospace, monospace';
  ctx.fillText(String(session.score).padStart(5, '0'), 40, 115);

  // Wave (top-center)
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '22px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WAVE', CANVAS_W / 2, 60);
  ctx.fillStyle = COLORS.cardAccent;
  ctx.font = 'bold 52px ui-monospace, monospace';
  ctx.fillText(String(session.wave), CANVAS_W / 2, 115);

  // Lives (top-right)
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '22px ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('LIVES', CANVAS_W - 40, 60);
  for (let i = 0; i < CONFIG.MAX_LIVES; i++) {
    const cx = CANVAS_W - 50 - i * 46;
    const cy = 100;
    const alive = i < session.lives;
    ctx.fillStyle = alive ? COLORS.reject : 'rgba(255,80,80,0.2)';
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.reject;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Combo (below score)
  if (session.combo >= 2) {
    ctx.fillStyle = COLORS.approve;
    ctx.font = 'bold 32px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('x' + session.comboMult + '  COMBO ' + session.combo, 40, 170);
  }

  // Version (bottom-right, dim)
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '16px ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.globalAlpha = 0.55;
  ctx.fillText(VERSION, CANVAS_W - 20, CANVAS_H - 16);
  ctx.globalAlpha = 1;
}

export function drawTimerBar(ctx, session) {
  const x = 60, y = 244, w = CANVAS_W - 120, h = 14;
  ctx.fillStyle = 'rgba(63, 212, 255, 0.15)';
  ctx.fillRect(x, y, w, h);
  const pct = Math.max(0, session.timer / session.timerMax);
  const barColor = pct < 0.25 ? COLORS.timerBarWarn : COLORS.timerBar;
  ctx.fillStyle = barColor;
  ctx.fillRect(x, y, w * pct, h);
  ctx.strokeStyle = COLORS.cardAccent;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  if (pct < 0.25) {
    ctx.fillStyle = COLORS.reject;
    ctx.font = 'bold 20px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HURRY', CANVAS_W / 2, y - 8);
  }
}

export function drawRulebook(ctx, session, newRulesIds = null) {
  const panelY = 1240;
  const panelH = 360;
  const x = 40, w = CANVAS_W - 80;

  ctx.fillStyle = COLORS.rulebookBg;
  ctx.strokeStyle = COLORS.rulebookAccent;
  ctx.lineWidth = 2;
  ctx.fillRect(x, panelY, w, panelH);
  ctx.strokeRect(x, panelY, w, panelH);

  ctx.fillStyle = COLORS.cardAccent;
  ctx.font = 'bold 24px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('RULEBOOK / WAVE ' + session.wave, x + 20, panelY + 34);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '18px ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('[ CROSS-CHECK REQUIRED ]', x + w - 20, panelY + 34);

  const rules = session.activeRules();
  const cols = 2;
  const rowH = 46;
  const startY = panelY + 62;
  const colW = (w - 40) / cols;

  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rx = x + 20 + col * colW;
    const ry = startY + row * rowH;
    const isNew = newRulesIds && newRulesIds.includes(r.id);

    ctx.fillStyle = isNew ? COLORS.newRule : COLORS.cardAccent;
    ctx.font = 'bold 20px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(r.id, rx, ry);

    ctx.fillStyle = isNew ? COLORS.textBright : COLORS.text;
    ctx.font = '18px ui-monospace, monospace';
    ctx.fillText(r.shortText, rx + 56, ry);
  }
}

export function drawSwipeHints(ctx, offsetX) {
  const commit = Math.min(1, Math.abs(offsetX) / CONFIG.SWIPE_COMMIT_DX);

  // Left hint (reject)
  ctx.save();
  ctx.globalAlpha = offsetX < 0 ? 0.35 + 0.6 * commit : 0.3;
  ctx.fillStyle = COLORS.reject;
  ctx.font = 'bold 44px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('\u2190 REJECT', 40, 1720);
  ctx.restore();

  // Right hint (approve)
  ctx.save();
  ctx.globalAlpha = offsetX > 0 ? 0.35 + 0.6 * commit : 0.3;
  ctx.fillStyle = COLORS.approve;
  ctx.font = 'bold 44px ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('APPROVE \u2192', CANVAS_W - 40, 1720);
  ctx.restore();
}

export function drawNewRulesBanner(ctx, banner) {
  if (!banner) return;
  const alpha = Math.min(1, banner.ttl / 0.4) * (banner.ttl > 2.8 ? (3.2 - banner.ttl) / 0.4 : 1);
  const y = 240;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = 'rgba(255, 176, 64, 0.92)';
  ctx.fillRect(0, y, CANVAS_W, 80);
  ctx.fillStyle = COLORS.bg;
  ctx.font = 'bold 34px ui-monospace, monospace';
  ctx.textAlign = 'center';
  const ids = banner.rules.map(r => r.id).join(' + ');
  ctx.fillText('NEW RULE UNLOCKED: ' + ids, CANVAS_W / 2, y + 52);
  ctx.restore();
}
