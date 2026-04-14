import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const URL = process.env.URL || 'http://localhost:5173/?seed=2468';
const OUT = 'tools/screenshots';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 720, height: 1280, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'networkidle0' });

// Wait for canvas to paint.
await page.waitForSelector('#game');
await new Promise(r => setTimeout(r, 250));

// 1) Menu screen
await page.screenshot({ path: `${OUT}/01_menu.png` });

// 2) Tap to enter briefing
const rect = await page.evaluate(() => {
  const r = document.getElementById('game').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
});
await page.mouse.click(rect.x, rect.y);
await new Promise(r => setTimeout(r, 350));
await page.screenshot({ path: `${OUT}/02_briefing_start.png` });

// 3) Dismiss briefing -> playing (first card)
await page.mouse.click(rect.x, rect.y);
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/03_first_card.png` });

await browser.close();
console.log('wrote screenshots to', OUT);
