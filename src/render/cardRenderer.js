import { COLORS, CANVAS_W, CONFIG } from '../core/constants.js';
import { drawHouseIllustration } from './houseRenderer.js';

export function drawBlueprintCard(ctx, bp, offsetX, stampState) {
  if (!bp) return;
  const cardW = 900;
  const cardH = 920;
  const cardLeft = (CANVAS_W - cardW) / 2 + offsetX;
  const cardTop = 280;

  const rot = (offsetX / 600) * 0.18;
  const commit = Math.min(1, Math.abs(offsetX) / CONFIG.SWIPE_COMMIT_DX);

  ctx.save();
  ctx.translate(cardLeft + cardW / 2, cardTop + cardH / 2);
  ctx.rotate(rot);
  ctx.translate(-cardW / 2, -cardH / 2);

  ctx.fillStyle = COLORS.card;
  roundRect(ctx, 0, 0, cardW, cardH, 22);
  ctx.fill();

  // Tint card edge while swiping
  if (offsetX !== 0) {
    const tint = offsetX > 0 ? 'rgba(63,255,143,' : 'rgba(255,80,80,';
    ctx.fillStyle = tint + (0.06 + 0.18 * commit) + ')';
    roundRect(ctx, 0, 0, cardW, cardH, 22);
    ctx.fill();
  }

  ctx.strokeStyle = COLORS.cardAccent;
  ctx.lineWidth = 3;
  roundRect(ctx, 0, 0, cardW, cardH, 22);
  ctx.stroke();

  ctx.fillStyle = COLORS.cardAccent;
  ctx.fillRect(0, 0, cardW, 6);

  // Grid dots
  ctx.fillStyle = COLORS.gridDot;
  for (let y = 24; y < cardH; y += 40) {
    for (let x = 24; x < cardW; x += 40) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Header
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 44px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(bp.id, 40, 80);

  ctx.font = '26px ui-monospace, monospace';
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText('APPLICANT : ' + bp.applicant, 40, 118);
  ctx.fillText('ADDRESS   : ' + bp.address, 40, 152);

  // Zone badge
  const zoneW = 160, zoneH = 58;
  const zoneX = cardW - zoneW - 30;
  const zoneFill = bp.zone === 'flood' ? 'rgba(64, 128, 220, 0.9)'
                  : bp.zone === 'historic' ? 'rgba(255, 176, 64, 0.9)'
                  : bp.zone === 'HOA-A' ? 'rgba(180, 120, 220, 0.9)'
                  : COLORS.cardAccent;
  ctx.fillStyle = zoneFill;
  roundRect(ctx, zoneX, 32, zoneW, zoneH, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.bg;
  ctx.font = 'bold 32px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bp.zone.toUpperCase(), zoneX + zoneW / 2, 32 + zoneH / 2 + 2);
  ctx.textBaseline = 'alphabetic';

  // Illustration frame
  const illX = 40, illY = 180, illW = cardW - 80, illH = 360;
  drawHouseIllustration(ctx, bp, illX, illY, illW, illH);

  // Specs grid
  drawSpecsGrid(ctx, bp, 40, 560, cardW - 80, 340);

  // Debug strip (bottom of card) — seed + card index for bug reports
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '16px ui-monospace, monospace';
  ctx.textAlign = 'left';
  const seedStr = bp.seed != null ? bp.seed.toString(16).toUpperCase().padStart(8, '0') : '--------';
  ctx.fillText('SEED ' + seedStr + '  /  CARD #' + (bp.cardIndex || 0), 40, cardH - 20);

  // Stamp overlay
  if (stampState && stampState.alpha > 0) {
    drawStamp(ctx, stampState, cardW / 2, cardH / 2);
  }

  ctx.restore();
}

function drawSpecsGrid(ctx, bp, x, y, w, h) {
  const specs = [
    ['ZONE', bp.zone.toUpperCase()],
    ['FLOORS', String(bp.floors)],
    ['ROOF', bp.roofType.toUpperCase()],
    ['GARAGE', bp.garageSize.toUpperCase()],
    ['LOT SIZE', bp.lotSize + ' sqft'],
    ['FOOTPRINT', bp.footprint + ' sqft'],
    ['SETBACK', bp.setback + ' ft'],
    ['FOUNDATION', bp.foundation.toUpperCase()],
    ['SOLAR', bp.solarPanels ? 'YES' : 'NO'],
    ['TREE REMOVAL', bp.treeRemoval ? 'YES' : 'NO'],
  ];

  const cols = 2;
  const rows = Math.ceil(specs.length / cols);
  const cellW = w / cols;
  const cellH = h / rows;

  ctx.strokeStyle = COLORS.gridDot;
  ctx.lineWidth = 1;

  for (let i = 0; i < specs.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cx = x + col * cellW;
    const cy = y + row * cellH;
    ctx.strokeRect(cx, cy, cellW, cellH);

    ctx.fillStyle = COLORS.textDim;
    ctx.font = '20px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(specs[i][0], cx + 16, cy + 26);

    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 26px ui-monospace, monospace';
    ctx.fillText(specs[i][1], cx + 16, cy + 58);
  }
}

function drawStamp(ctx, s, cx, cy) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, s.alpha);
  const approve = s.type === 'approve';
  const color = approve ? COLORS.approve : COLORS.reject;
  const text = approve ? 'APPROVED' : 'REJECTED';

  ctx.translate(cx, cy);
  ctx.rotate(approve ? -0.18 : 0.2);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 9;
  ctx.strokeRect(-280, -85, 560, 150);
  ctx.lineWidth = 4;
  ctx.strokeRect(-295, -100, 590, 180);
  ctx.font = 'bold 108px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
