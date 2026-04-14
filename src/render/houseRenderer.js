import { COLORS } from '../core/constants.js';

export function drawHouseIllustration(ctx, bp, x, y, w, h) {
  if (bp.zone === 'flood') {
    ctx.fillStyle = COLORS.flood;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(64, 128, 220, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const wy = y + h - 15 - i * 7;
      ctx.beginPath();
      for (let wx = x; wx <= x + w; wx += 6) {
        ctx.lineTo(wx, wy + Math.sin((wx + i * 3) * 0.2) * 2);
      }
      ctx.stroke();
    }
  }

  ctx.strokeStyle = COLORS.textDim;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  const groundY = y + h - 60;
  ctx.strokeStyle = COLORS.houseLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 10, groundY);
  ctx.lineTo(x + w - 10, groundY);
  ctx.stroke();

  // Ground hatch
  ctx.strokeStyle = 'rgba(63, 212, 255, 0.25)';
  ctx.lineWidth = 1;
  for (let gx = x + 15; gx < x + w - 5; gx += 18) {
    ctx.beginPath();
    ctx.moveTo(gx, groundY);
    ctx.lineTo(gx - 8, groundY + 12);
    ctx.stroke();
  }

  const floorH = 62;
  const houseW = 240;
  const totalFloorsH = bp.floors * floorH;
  const houseX = x + (w - houseW) / 2;
  const houseTop = groundY - totalFloorsH;

  ctx.strokeStyle = COLORS.houseLine;
  ctx.lineWidth = 2;
  for (let i = 0; i < bp.floors; i++) {
    const fy = groundY - (i + 1) * floorH;
    ctx.strokeRect(houseX, fy, houseW, floorH);
    const wins = 3;
    const winW = 36, winH = 30;
    const gap = (houseW - wins * winW) / (wins + 1);
    for (let wi = 0; wi < wins; wi++) {
      const wx = houseX + gap + wi * (winW + gap);
      const wy = fy + (floorH - winH) / 2 - (i === 0 ? 6 : 0);
      ctx.strokeRect(wx, wy, winW, winH);
      ctx.beginPath();
      ctx.moveTo(wx + winW / 2, wy);
      ctx.lineTo(wx + winW / 2, wy + winH);
      ctx.moveTo(wx, wy + winH / 2);
      ctx.lineTo(wx + winW, wy + winH / 2);
      ctx.stroke();
    }
  }

  // Door on ground floor
  const doorW = 36, doorH = 52;
  ctx.fillStyle = COLORS.bg;
  ctx.strokeStyle = COLORS.houseLine;
  const dx = houseX + houseW / 2 - doorW / 2;
  const dy = groundY - doorH;
  ctx.fillRect(dx, dy, doorW, doorH);
  ctx.strokeRect(dx, dy, doorW, doorH);
  ctx.beginPath();
  ctx.arc(dx + doorW - 6, dy + doorH / 2, 2, 0, Math.PI * 2);
  ctx.stroke();

  drawRoof(ctx, houseX, houseTop, houseW, bp.roofType);

  if (bp.solarPanels && bp.roofType !== 'flat') {
    ctx.fillStyle = 'rgba(63, 212, 255, 0.55)';
    ctx.strokeStyle = COLORS.houseLine;
    const py = houseTop - 26;
    ctx.fillRect(houseX + 30, py, 70, 14);
    ctx.strokeRect(houseX + 30, py, 70, 14);
    ctx.fillRect(houseX + 140, py, 70, 14);
    ctx.strokeRect(houseX + 140, py, 70, 14);
    ctx.fillStyle = COLORS.textDim;
    ctx.font = '16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SOLAR', houseX + houseW / 2, py - 8);
  }

  if (bp.garageSize !== 'none') {
    const gw = { single: 80, double: 140, oversized: 210 }[bp.garageSize];
    const gh = 62;
    const gx = houseX - gw - 8;
    const gy = groundY - gh;
    ctx.strokeStyle = COLORS.houseLine;
    ctx.strokeRect(gx, gy, gw, gh);
    ctx.fillStyle = 'rgba(63, 212, 255, 0.08)';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.beginPath();
    for (let lx = gx + 12; lx < gx + gw; lx += 12) {
      ctx.moveTo(lx, gy + 8);
      ctx.lineTo(lx, gy + gh - 6);
    }
    ctx.stroke();
    ctx.fillStyle = COLORS.textDim;
    ctx.font = '14px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GARAGE', gx + gw / 2, gy - 6);
  }

  if (bp.foundation === 'basement') {
    const bh = floorH;
    // Subterranean tint
    ctx.fillStyle = 'rgba(63, 212, 255, 0.12)';
    ctx.fillRect(houseX, groundY, houseW, bh);
    // Outline (dashed to read as "below ground")
    ctx.strokeStyle = COLORS.houseLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(houseX, groundY, houseW, bh);
    ctx.setLineDash([]);
    // Small egress windows near the top
    const wins = 3, winW = 34, winH = 20;
    const gap = (houseW - wins * winW) / (wins + 1);
    for (let wi = 0; wi < wins; wi++) {
      const wx = houseX + gap + wi * (winW + gap);
      const wy = groundY + 8;
      ctx.strokeRect(wx, wy, winW, winH);
      ctx.beginPath();
      ctx.moveTo(wx + winW / 2, wy);
      ctx.lineTo(wx + winW / 2, wy + winH);
      ctx.stroke();
    }
    ctx.fillStyle = COLORS.textDim;
    ctx.font = 'bold 16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BASEMENT', houseX + houseW / 2, groundY + bh - 12);
  }

  // Setback dimension line (property edge to house)
  ctx.strokeStyle = COLORS.textDim;
  ctx.lineWidth = 1;
  const propX = x + 14;
  const dimY = groundY + 34;
  ctx.beginPath();
  ctx.moveTo(propX, groundY);
  ctx.lineTo(propX, dimY + 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(propX, dimY);
  ctx.lineTo(houseX, dimY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(propX, dimY - 4); ctx.lineTo(propX + 6, dimY); ctx.lineTo(propX, dimY + 4);
  ctx.moveTo(houseX, dimY - 4); ctx.lineTo(houseX - 6, dimY); ctx.lineTo(houseX, dimY + 4);
  ctx.stroke();
  ctx.fillStyle = bp.setback < 6 ? COLORS.warn : COLORS.textDim;
  ctx.font = '16px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(bp.setback + ' ft', (propX + houseX) / 2, dimY - 6);

  if (bp.treeRemoval) {
    const tx = x + w - 44;
    const ty = groundY - 28;
    ctx.strokeStyle = COLORS.houseLine;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, ty + 20); ctx.lineTo(tx, groundY); ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, ty + 10, 14, 0, Math.PI * 2); ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 80, 80, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx - 16, ty - 6); ctx.lineTo(tx + 16, ty + 26);
    ctx.moveTo(tx + 16, ty - 6); ctx.lineTo(tx - 16, ty + 26);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 120, 120, 0.9)';
    ctx.font = '12px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REMOVE', tx, groundY + 18);
  }
}

function drawRoof(ctx, x, y, w, type) {
  ctx.strokeStyle = COLORS.houseLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (type === 'gable') {
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + w / 2, y - 48);
    ctx.lineTo(x + w + 10, y);
    ctx.stroke();
  } else if (type === 'hip') {
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + w * 0.3, y - 38);
    ctx.lineTo(x + w * 0.7, y - 38);
    ctx.lineTo(x + w + 10, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, y - 38);
    ctx.lineTo(x + w * 0.7, y - 38);
    ctx.stroke();
  } else if (type === 'shed') {
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + w + 10, y - 38);
    ctx.lineTo(x + w + 10, y);
    ctx.stroke();
  } else if (type === 'flat') {
    ctx.strokeStyle = COLORS.houseLine;
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + w + 10, y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 176, 64, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 4);
    ctx.lineTo(x + w + 10, y - 4);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
