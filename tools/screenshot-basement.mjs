// Finds a seed where card #1 has a basement foundation, captures the card screen.
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

mkdirSync('tools/screenshots', { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 720, height: 1280, deviceScaleFactor: 1 });

// Try seeds until we land on a basement card #1
for (let seed = 1; seed <= 60; seed++) {
  await page.goto(`http://localhost:5173/?seed=${seed}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 150));
  // MENU tap to enter briefing, then briefing tap to enter playing
  const rect = await page.evaluate(() => {
    const r = document.getElementById('game').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.click(rect.x, rect.y);
  await new Promise(r => setTimeout(r, 400)); // arm delay
  await page.mouse.click(rect.x, rect.y);
  await new Promise(r => setTimeout(r, 400));

  // Skip forward until we find a basement card (approve 3 times, we won't care about correctness)
  for (let i = 0; i < 6; i++) {
    const bp = await page.evaluate(() => window.__debugBp || null);
    if (bp && bp.foundation === 'basement') {
      await page.screenshot({ path: `tools/screenshots/basement_seed${seed}_card${i+1}.png` });
      console.log(`basement found: seed=${seed}, cardIndex=${bp.cardIndex}, zone=${bp.zone}`);
      await browser.close();
      process.exit(0);
    }
    // swipe right to advance
    await page.mouse.move(rect.x - 100, rect.y);
    await page.mouse.down();
    await page.mouse.move(rect.x + 200, rect.y, { steps: 10 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 900));
    // If disaster, click to dismiss
    await page.mouse.click(rect.x, rect.y);
    await new Promise(r => setTimeout(r, 400));
  }
}

console.log('no basement found');
await browser.close();
process.exit(1);
